import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PurchaseDoc } from "@/types";

// Purchases are WRITTEN only by the Stripe webhook (Admin SDK). The client may
// read its own to decide whether a post is unlocked.
export function purchaseId(uid: string, postId: string): string {
  return `${uid}_${postId}`;
}

export async function hasPurchased(uid: string, postId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "purchases", purchaseId(uid, postId)));
  return snap.exists();
}

export async function listMyPurchases(uid: string): Promise<PurchaseDoc[]> {
  const q = query(collection(db, "purchases"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PurchaseDoc);
}
