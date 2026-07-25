"use client";

import { useEffect, useState } from "react";
import {
  balanceOwedCents,
  listPayouts,
  listSellerTransactions,
  listWaiverCredits,
} from "@/lib/db/earnings";
import { formatCents, PLATFORM_FEE_PCT } from "@/lib/fees";
import type { PayoutDoc, TransactionDoc, WaiverCreditDoc } from "@/types";

// Seller earnings on the owner's own profile (HANDOFF 4.6 step 1: the
// "BlaBlaCar model" — the platform collects everything and redistributes;
// this panel shows what the ledger says they're owed). Web twin of the iOS
// Rewards surface for credits.
export function EarningsPanel({ uid }: { uid: string }) {
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [payouts, setPayouts] = useState<PayoutDoc[]>([]);
  const [credits, setCredits] = useState<WaiverCreditDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      listSellerTransactions(uid).catch(() => []),
      listPayouts(uid).catch(() => []),
      listWaiverCredits(uid).catch(() => []),
    ])
      .then(([t, p, c]) => {
        setTransactions(t);
        setPayouts(p);
        setCredits(c);
      })
      .finally(() => setLoaded(true));
  }, [uid]);

  if (!loaded) return null;

  const balance = balanceOwedCents(transactions, payouts);
  const availableCredits = credits.filter(
    (c) => c.consumedByTransactionId == null,
  ).length;

  // Nothing earned and nothing to waive yet — stay out of the way.
  if (transactions.length === 0 && availableCredits === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Earnings</h2>
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-2xl font-bold">{formatCents(balance)}</p>
          <p className="text-xs text-slate-500">
            Balance owed · paid out on request
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold">{transactions.length}</p>
          <p className="text-xs text-slate-500">
            Sale{transactions.length === 1 ? "" : "s"}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold">{availableCredits}</p>
          <p className="text-xs text-slate-500">
            Fee-waiver credit{availableCredits === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {availableCredits > 0
          ? `Next sale: 0% platform fee (${availableCredits} credit${
              availableCredits === 1 ? "" : "s"
            } available). Share your bounties to earn more.`
          : `Sales carry a ${PLATFORM_FEE_PCT}% platform fee — share your bounties to earn fee-waiver credits.`}
      </p>
      {transactions.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {transactions.slice(0, 5).map((t) => (
            <li key={t.id} className="flex justify-between text-sm">
              <span className="text-slate-600">
                Sale · {new Date(t.createdAt).toLocaleDateString()}
                {t.waiverCreditId && (
                  <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    fee waived
                  </span>
                )}
              </span>
              <span className="font-medium">{formatCents(t.netCents)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
