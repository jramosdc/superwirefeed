import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ReviewDoc } from "@/types";

// NOTE: reviews are created server-side via POST /api/reviews (Admin SDK), which
// also updates the seller's rating aggregate. Clients only read them here.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
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
