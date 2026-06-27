import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { SubscriptionDoc } from "@/types";

// Subscriptions are WRITTEN only by the Stripe webhook (Admin SDK). The client
// may read its own to decide whether a creator's gated posts are unlocked.
export function subscriptionId(subscriberUid: string, creatorUid: string): string {
  return `${subscriberUid}_${creatorUid}`;
}

export async function hasActiveSubscription(
  subscriberUid: string,
  creatorUid: string,
): Promise<boolean> {
  const snap = await getDoc(
    doc(db, "subscriptions", subscriptionId(subscriberUid, creatorUid)),
  );
  return snap.exists() && (snap.data() as SubscriptionDoc).status === "active";
}

export async function listMySubscriptions(uid: string): Promise<SubscriptionDoc[]> {
  const q = query(collection(db, "subscriptions"), where("subscriberUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SubscriptionDoc);
}
