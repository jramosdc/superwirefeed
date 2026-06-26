import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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

// Bulk reads for the feeds browse page (filter/sort by accuracy & trust without
// a per-post round trip). Fine at marketplace MVP scale.
export async function listAccuracyMap(): Promise<
  Record<string, { score: number; corroborations: number }>
> {
  const snap = await getDocs(collection(db, "postAccuracy"));
  const map: Record<string, { score: number; corroborations: number }> = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    map[d.id] = {
      score: (data.score as number) ?? 0,
      corroborations: (data.corroborations as number) ?? 0,
    };
  });
  return map;
}

export async function listTrustMap(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, "trust"));
  const map: Record<string, number> = {};
  snap.docs.forEach((d) => {
    map[d.id] = (d.data().score as number) ?? 0;
  });
  return map;
}
