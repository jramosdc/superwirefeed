import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PostAccuracyDoc, TrustDoc } from "@/types";

// Read-only accessors for server-maintained accuracy/trust state.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

export async function getPostAccuracy(
  postId: string,
): Promise<PostAccuracyDoc | null> {
  const snap = await getDoc(doc(db, "postAccuracy", postId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    corroborations: (d.corroborations as number) ?? 0,
    disputes: (d.disputes as number) ?? 0,
    corrWeight: (d.corrWeight as number) ?? 0,
    dispWeight: (d.dispWeight as number) ?? 0,
    score: (d.score as number) ?? 0,
    updatedAt: tsToMillis(d.updatedAt),
  };
}

export async function getTrust(uid: string): Promise<TrustDoc | null> {
  const snap = await getDoc(doc(db, "trust", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    score: (d.score as number) ?? 0,
    updatedAt: tsToMillis(d.updatedAt),
  };
}
