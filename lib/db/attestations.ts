import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/token";
import type { AttestationDoc, AttestationVerdict } from "@/types";

// Attestations are WRITTEN only by POST /api/attestations (Admin SDK), which also
// maintains the post's accuracy aggregate and the seller's trust score. Clients
// read them here and submit through the API.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

export function attestationId(attesterUid: string, postId: string): string {
  return `${attesterUid}_${postId}`;
}

export async function listAttestationsForPost(
  postId: string,
): Promise<AttestationDoc[]> {
  const q = query(
    collection(db, "attestations"),
    where("postId", "==", postId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AttestationDoc, "id">),
    createdAt: tsToMillis(d.data().createdAt),
  }));
}

export async function getMyAttestation(
  uid: string,
  postId: string,
): Promise<AttestationDoc | null> {
  const snap = await getDoc(doc(db, "attestations", attestationId(uid, postId)));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as Omit<AttestationDoc, "id">),
    createdAt: tsToMillis(snap.data().createdAt),
  };
}

export async function submitAttestation(input: {
  postId: string;
  verdict: AttestationVerdict;
  evidenceUrl?: string;
  attesterName?: string;
}): Promise<void> {
  const token = await getIdToken();
  const res = await fetch("/api/attestations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error ?? "Failed to submit attestation");
  }
}
