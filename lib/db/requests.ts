"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getStoredRef } from "@/lib/referral";
import type { RequestDoc, RequestResponseDoc, RequestStatus } from "@/types";

// --- Deadline helpers (display + response-gating; expiry is client-side) ---
// A fulfilled/closed request is never "expired" — it already ended. These
// mirror the iOS client's RequestDoc.isExpired / .deadlineBadge exactly.

const startOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function isExpired(r: RequestDoc): boolean {
  return r.status === "open" && r.expiresAt != null && r.expiresAt < Date.now();
}

/** "Ends in 3d" / "Ends today" / "Expired", or null when there's no deadline. */
export function deadlineBadge(r: RequestDoc): string | null {
  if (r.status !== "open" || r.expiresAt == null) return null;
  const now = Date.now();
  if (r.expiresAt < now) return "Expired";
  const days = Math.round((startOfDay(r.expiresAt) - startOfDay(now)) / 86_400_000);
  if (days <= 0) return "Ends today";
  if (days === 1) return "Ends tomorrow";
  return `Ends in ${days}d`;
}

// Requests/bounties are client-written, owner-scoped (rules enforce that the
// requester owns the request and a responder owns their response). No server
// aggregates — a stated bounty is a signal, not escrowed payment (future work).

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

function toRequest(id: string, d: Record<string, unknown>): RequestDoc {
  return {
    id,
    requesterUid: (d.requesterUid as string) ?? "",
    requesterName: (d.requesterName as string) ?? "Anon",
    title: (d.title as string) ?? "",
    description: (d.description as string) ?? "",
    category: (d.category as string) ?? "Any",
    format: (d.format as string) ?? "Any",
    bountyUsd: (d.bountyUsd as number) ?? 0,
    status: (d.status as RequestStatus) ?? "open",
    fulfilledByPostId: (d.fulfilledByPostId as string) ?? "",
    fulfilledByUid: (d.fulfilledByUid as string) ?? "",
    acceptedPostIds: (d.acceptedPostIds as string[]) ?? [],
    acceptedUids: (d.acceptedUids as string[]) ?? [],
    expiresAt: d.expiresAt != null ? tsToMillis(d.expiresAt) : undefined,
    createdAt: tsToMillis(d.createdAt),
    updatedAt: tsToMillis(d.updatedAt),
  };
}

export interface RequestInput {
  requesterUid: string;
  requesterName: string;
  title: string;
  description: string;
  category: string;
  format: string;
  bountyUsd: number;
  /** Optional deadline in millis; omit for no deadline. */
  expiresAt?: number;
}

export async function createRequest(input: RequestInput): Promise<string> {
  const { expiresAt, ...rest } = input;
  const ref = doc(collection(db, "requests"));
  await setDoc(ref, {
    ...rest,
    status: "open",
    fulfilledByPostId: "",
    fulfilledByUid: "",
    // Write as a Timestamp (not raw millis) so the iOS client — which reads
    // expiresAt as a Firestore Timestamp — sees it too. Omit when unset.
    ...(expiresAt ? { expiresAt: Timestamp.fromMillis(expiresAt) } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRequest(id: string): Promise<RequestDoc | null> {
  const snap = await getDoc(doc(db, "requests", id));
  return snap.exists() ? toRequest(snap.id, snap.data()) : null;
}

export async function listRequests(): Promise<RequestDoc[]> {
  const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toRequest(d.id, d.data()));
}

// Requester closes a request (also legacy single-winner fulfill).
export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  fulfilledBy?: { postId: string; uid: string },
): Promise<void> {
  await updateDoc(doc(db, "requests", id), {
    status,
    fulfilledByPostId: fulfilledBy?.postId ?? "",
    fulfilledByUid: fulfilledBy?.uid ?? "",
    updatedAt: serverTimestamp(),
  });
}

// Requester accepts a response — supports picking MORE THAN ONE winner:
// each accept appends to the accepted arrays. The legacy single fulfilledBy
// fields are only set by the first accept (kept for back-compat).
export async function acceptResponse(
  requestId: string,
  postId: string,
  responderUid: string,
  isFirstAccept: boolean,
): Promise<void> {
  await updateDoc(doc(db, "requests", requestId), {
    acceptedPostIds: arrayUnion(postId),
    acceptedUids: arrayUnion(responderUid),
    status: "fulfilled",
    updatedAt: serverTimestamp(),
    ...(isFirstAccept
      ? { fulfilledByPostId: postId, fulfilledByUid: responderUid }
      : {}),
  });
}

// ONE response per user per bounty: the doc ID is
// "{requestId}_{responderUid}", so re-submitting revises your offer instead
// of stacking duplicates (same pattern as purchases/follows).
export async function addResponse(input: {
  requestId: string;
  responderUid: string;
  responderName: string;
  postId: string;
  postTitle: string;
  note: string;
}): Promise<void> {
  // Referral attribution (HANDOFF 4.2): if this responder arrived via a ?ref
  // share link for THIS bounty, stamp the sharer on the response. The Stripe
  // webhook reads it to grant a share-converted waiver credit when the bounty
  // ends in a purchase. Self-refs grant nothing, so don't stamp them.
  const stored = getStoredRef();
  const refUid =
    stored &&
    stored.refUid !== input.responderUid &&
    (stored.requestId === "" || stored.requestId === input.requestId)
      ? stored.refUid
      : "";
  const ref = doc(db, "requestResponses", `${input.requestId}_${input.responderUid}`);
  await setDoc(ref, {
    ...input,
    ...(refUid ? { refUid } : {}),
    createdAt: serverTimestamp(),
  });
}

export async function listResponses(
  requestId: string,
): Promise<RequestResponseDoc[]> {
  const q = query(
    collection(db, "requestResponses"),
    where("requestId", "==", requestId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<RequestResponseDoc, "id">),
      createdAt: tsToMillis(d.data().createdAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}
