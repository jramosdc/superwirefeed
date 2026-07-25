"use client";

import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PayoutDoc, TransactionDoc, WaiverCreditDoc } from "@/types";

// Seller earnings: the transactions ledger (webhook-written) minus payouts
// (owner-written), plus fee-waiver credits. All reads are owner-scoped by the
// rules, bounded, and sorted in memory so no composite index is needed —
// the same pattern as the iOS client's FirestoreService.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

export async function listSellerTransactions(
  uid: string,
): Promise<TransactionDoc[]> {
  const q = query(
    collection(db, "transactions"),
    where("sellerUid", "==", uid),
    limit(500),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<TransactionDoc, "id" | "createdAt">),
      id: d.id,
      createdAt: tsToMillis(d.data().createdAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listPayouts(uid: string): Promise<PayoutDoc[]> {
  const q = query(collection(db, "payouts"), where("uid", "==", uid), limit(500));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<PayoutDoc, "id" | "createdAt">),
      id: d.id,
      createdAt: tsToMillis(d.data().createdAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listWaiverCredits(uid: string): Promise<WaiverCreditDoc[]> {
  const q = query(
    collection(db, "waiverCredits"),
    where("uid", "==", uid),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<WaiverCreditDoc, "id" | "createdAt">),
      id: d.id,
      createdAt: tsToMillis(d.data().createdAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Balance owed = sum of ledger net minus everything already paid out. */
export function balanceOwedCents(
  transactions: TransactionDoc[],
  payouts: PayoutDoc[],
): number {
  const earned = transactions.reduce((sum, t) => sum + (t.netCents ?? 0), 0);
  const paid = payouts.reduce((sum, p) => sum + (p.amountCents ?? 0), 0);
  return earned - paid;
}
