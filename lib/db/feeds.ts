import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { FeedDoc } from "@/types";

function toFeed(id: string, data: Record<string, unknown>): FeedDoc & { id: string } {
  return {
    id,
    ownerUid: (data.ownerUid as string) ?? id,
    name: (data.name as string) ?? "",
    likes: (data.likes as number) ?? 0,
    postCategories: (data.postCategories as string[]) ?? [],
    coverImageURL: (data.coverImageURL as string) ?? "",
    updatedAt: tsToMillis(data.updatedAt),
  };
}

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

// One feed per user, doc id === ownerUid.
export async function createFeed(uid: string, name: string): Promise<void> {
  await setDoc(
    doc(db, "feeds", uid),
    {
      ownerUid: uid,
      name,
      likes: 0,
      postCategories: [],
      coverImageURL: "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getFeed(feedId: string): Promise<(FeedDoc & { id: string }) | null> {
  const snap = await getDoc(doc(db, "feeds", feedId));
  return snap.exists() ? toFeed(snap.id, snap.data()) : null;
}

export async function listFeeds(): Promise<(FeedDoc & { id: string })[]> {
  const q = query(collection(db, "feeds"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toFeed(d.id, d.data()));
}

export async function updateFeed(
  feedId: string,
  patch: Partial<FeedDoc>,
): Promise<void> {
  await updateDoc(doc(db, "feeds", feedId), { ...patch, updatedAt: serverTimestamp() });
}

// Touch updatedAt so a feed bubbles to the top after a new post (old behavior).
export async function touchFeed(feedId: string): Promise<void> {
  await updateDoc(doc(db, "feeds", feedId), { updatedAt: serverTimestamp() });
}

export async function voteFeed(feedId: string, delta: 1 | -1): Promise<void> {
  await updateDoc(doc(db, "feeds", feedId), { likes: increment(delta) });
}
