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
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { RequestDoc, RequestResponseDoc, RequestStatus } from "@/types";

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
}

export async function createRequest(input: RequestInput): Promise<string> {
  const ref = doc(collection(db, "requests"));
  await setDoc(ref, {
    ...input,
    status: "open",
    fulfilledByPostId: "",
    fulfilledByUid: "",
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

// Requester closes or marks a request fulfilled (optionally crediting a post).
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

export async function addResponse(input: {
  requestId: string;
  responderUid: string;
  responderName: string;
  postId: string;
  postTitle: string;
  note: string;
}): Promise<void> {
  const ref = doc(collection(db, "requestResponses"));
  await setDoc(ref, { ...input, createdAt: serverTimestamp() });
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
