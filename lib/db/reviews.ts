import {
  addDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ReviewDoc } from "@/types";

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

export async function addReview(input: {
  sellerUid: string;
  authorUid: string;
  authorName: string;
  rating: number;
  text: string;
}): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...input,
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    createdAt: serverTimestamp(),
  });
}

export async function listReviewsForSeller(sellerUid: string): Promise<ReviewDoc[]> {
  const q = query(
    collection(db, "reviews"),
    where("sellerUid", "==", sellerUid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReviewDoc, "id">), createdAt: tsToMillis(d.data().createdAt) }));
}

// Aggregate seller rating: average + count.
export function aggregateRating(reviews: ReviewDoc[]): { avg: number; count: number } {
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
