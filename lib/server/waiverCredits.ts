import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { CREATED_AND_SHARED_MONTHLY_CAP, platformFeeCents } from "@/lib/fees";

// Server-side waiver-credit economy (HANDOFF 4.3/4.4). All granting and
// consumption happens here via the Admin SDK — clients can only READ their own
// credits (firestore.rules). Anti-gaming: credits come only from server-verified
// events, and every doc id is deterministic so webhook/API retries can't
// double-grant.

// Deterministic id: one created-and-shared credit per bounty per user, ever.
const createdAndSharedId = (requestId: string, uid: string) =>
  `cs_${requestId}_${uid}`;

// One share-converted credit per bounty per sharer (a multi-winner bounty
// converts once per sharer, not once per accepted response).
const shareConvertedId = (requestId: string, refUid: string) =>
  `sc_${requestId}_${refUid}`;

/**
 * Grant "created-and-shared" credits: 1 credit for a bounty the user both
 * created AND shared (any platform), capped per calendar month.
 *
 * Reconciliation-style and idempotent: derives what should exist from the
 * `shares` collection and fills only the gaps. Called when the webapp records
 * a share (/api/shares) and before consuming credits for a seller in the
 * webhook — the latter also picks up shares written directly by the iOS app.
 */
export async function grantCreatedAndSharedCredits(uid: string): Promise<void> {
  const [shareSnap, creditSnap] = await Promise.all([
    adminDb.collection("shares").where("sharerUid", "==", uid).limit(500).get(),
    adminDb.collection("waiverCredits").where("uid", "==", uid).limit(500).get(),
  ]);

  const sharedRequestIds = [
    ...new Set(
      shareSnap.docs
        .map((d) => (d.data().requestId as string) ?? "")
        .filter(Boolean),
    ),
  ];
  if (!sharedRequestIds.length) return;

  const existingIds = new Set(creditSnap.docs.map((d) => d.id));
  // Monthly cap counts credits GRANTED this calendar month (UTC).
  const now = new Date();
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  let grantedThisMonth = creditSnap.docs.filter((d) => {
    const data = d.data();
    return (
      data.source === "created-and-shared" &&
      data.createdAt?.toMillis?.() >= monthStart
    );
  }).length;

  for (const requestId of sharedRequestIds) {
    if (grantedThisMonth >= CREATED_AND_SHARED_MONTHLY_CAP) break;
    if (existingIds.has(createdAndSharedId(requestId, uid))) continue;

    const requestSnap = await adminDb.collection("requests").doc(requestId).get();
    const request = requestSnap.data();
    // Only the bounty's own requester earns this credit for sharing it.
    if (!requestSnap.exists || request?.requesterUid !== uid) continue;

    await adminDb
      .collection("waiverCredits")
      .doc(createdAndSharedId(requestId, uid))
      .set({
        uid,
        source: "created-and-shared",
        requestId,
        consumedByTransactionId: null,
        label: (request?.title as string) ?? "",
        createdAt: FieldValue.serverTimestamp(),
      });
    grantedThisMonth++;
  }
}

/**
 * Grant a "share-converted" credit: someone shared a bounty, the winning
 * responder arrived via their ?ref link, and the bounty ended in a real
 * purchase. Called ONLY from the Stripe webhook's bounty-fulfill loop.
 * Uncapped, but a ref pointing at the responder or the buyer grants nothing.
 */
export async function grantShareConvertedCredit(input: {
  refUid: string;
  requestId: string;
  responderUid: string;
  buyerUid: string;
  label: string;
}): Promise<void> {
  const { refUid, requestId, responderUid, buyerUid, label } = input;
  if (!refUid || refUid === responderUid || refUid === buyerUid) return;

  await adminDb
    .collection("waiverCredits")
    .doc(shareConvertedId(requestId, refUid))
    .set({
      uid: refUid,
      source: "share-converted",
      requestId,
      consumedByTransactionId: null,
      label,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export interface LedgerEntry {
  transactionId: string;
  feeCents: number;
  netCents: number;
  waiverCreditId: string | null;
}

/**
 * Write the transaction ledger entry for a completed sale, consuming the
 * seller's oldest unconsumed waiver credit if one exists (fee becomes $0).
 *
 * Runs in a Firestore transaction keyed by the Stripe session id, so a
 * webhook retry can neither double-write the ledger nor double-spend a
 * credit. Returns null when the ledger entry already existed.
 */
export async function recordSaleTransaction(input: {
  stripeSessionId: string;
  postId: string;
  sellerUid: string;
  buyerUid: string;
  grossCents: number;
  serviceFeeCents: number;
}): Promise<LedgerEntry | null> {
  const { stripeSessionId, postId, sellerUid, buyerUid, grossCents, serviceFeeCents } =
    input;
  const txRef = adminDb.collection("transactions").doc(stripeSessionId);

  return adminDb.runTransaction(async (t) => {
    const existing = await t.get(txRef);
    if (existing.exists) return null; // webhook retry — already recorded

    // Oldest unconsumed credit first. Fetched with a bounded single-field
    // query and filtered/sorted in memory (no composite index needed —
    // same pattern as the iOS client's credit reads).
    const creditSnap = await t.get(
      adminDb.collection("waiverCredits").where("uid", "==", sellerUid).limit(500),
    );
    const oldest = creditSnap.docs
      .filter((d) => d.data().consumedByTransactionId == null)
      .sort(
        (a, b) =>
          (a.data().createdAt?.toMillis?.() ?? 0) -
          (b.data().createdAt?.toMillis?.() ?? 0),
      )[0];

    const feeCents = oldest ? 0 : platformFeeCents(grossCents);
    if (oldest) {
      t.update(oldest.ref, { consumedByTransactionId: stripeSessionId });
    }
    t.set(txRef, {
      postId,
      sellerUid,
      buyerUid,
      grossCents,
      serviceFeeCents,
      feeCents,
      waiverCreditId: oldest?.id ?? null,
      netCents: grossCents - feeCents,
      stripeSessionId,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      transactionId: stripeSessionId,
      feeCents,
      netCents: grossCents - feeCents,
      waiverCreditId: oldest?.id ?? null,
    };
  });
}
