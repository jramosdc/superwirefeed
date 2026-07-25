import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { purchaseId } from "@/lib/db/purchases";
import { subscriptionId } from "@/lib/db/subscriptions";
import {
  grantCreatedAndSharedCredits,
  grantShareConvertedCredit,
  recordSaleTransaction,
} from "@/lib/server/waiverCredits";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";

// Stripe webhook. This is the ONLY writer of purchase records and of the
// transactions ledger (HANDOFF 4.3 — the source of truth for what sellers are
// owed). The signature is verified, then on a completed checkout we write
// purchases/{uid}_{postId} via the Admin SDK (which bypasses Firestore rules —
// clients can never forge one).
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const amount = Number(session.metadata?.amount ?? session.amount_total ?? 0);

    if (session.mode === "subscription") {
      // Recurring subscription to a creator's feed.
      const subscriberUid = session.metadata?.subscriberUid;
      const creatorUid = session.metadata?.creatorUid;
      if (subscriberUid && creatorUid) {
        await adminDb
          .collection("subscriptions")
          .doc(subscriptionId(subscriberUid, creatorUid))
          .set({
            subscriberUid,
            creatorUid,
            status: "active",
            priceCents: amount,
            stripeSessionId: session.id,
            stripeSubscriptionId: String(session.subscription ?? ""),
            createdAt: FieldValue.serverTimestamp(),
          });
      }
    } else {
      // Per-item purchase of a single post.
      const uid = session.metadata?.uid;
      const postId = session.metadata?.postId;
      if (uid && postId) {
        await adminDb
          .collection("purchases")
          .doc(purchaseId(uid, postId))
          .set({
            uid,
            postId,
            amount,
            stripeSessionId: session.id,
            createdAt: FieldValue.serverTimestamp(),
          });

        // Bump the usage counter (drives "Most used" / Trending).
        await adminDb
          .collection("postStats")
          .doc(postId)
          .set(
            {
              purchases: FieldValue.increment(1),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );

        // Transactions ledger + fee (HANDOFF 4.3/4.4). Resolve the seller,
        // reconcile any credits their shares have earned (covers iOS-recorded
        // shares), then write the ledger entry — consuming the oldest
        // unconsumed credit, which makes this sale's platform fee $0.
        let sellerUid = session.metadata?.sellerUid ?? "";
        if (!sellerUid) {
          // Sessions created before sellerUid was added to metadata.
          const postSnap = await adminDb.collection("posts").doc(postId).get();
          sellerUid = (postSnap.data()?.ownerUid as string) ?? "";
        }
        if (sellerUid) {
          try {
            await grantCreatedAndSharedCredits(sellerUid);
          } catch (err) {
            console.error("credit reconciliation failed", err);
          }
          await recordSaleTransaction({
            stripeSessionId: session.id,
            postId,
            sellerUid,
            buyerUid: uid,
            grossCents: amount,
            serviceFeeCents: Number(session.metadata?.serviceFeeCents ?? 0),
          });
        }

        // Bounty auto-fulfill: if this post was offered to a bounty and the
        // BUYER is that bounty's requester, the purchase IS the acceptance —
        // append the winner (requesters may accept more than one) and set
        // the legacy single fulfilledBy fields on the first accept only.
        const offers = await adminDb
          .collection("requestResponses")
          .where("postId", "==", postId)
          .get();
        for (const offer of offers.docs) {
          const { requestId, responderUid, refUid } = offer.data() as {
            requestId?: string;
            responderUid?: string;
            refUid?: string;
          };
          if (!requestId || !responderUid) continue;
          const requestRef = adminDb.collection("requests").doc(requestId);
          const requestSnap = await requestRef.get();
          const request = requestSnap.data();
          if (!requestSnap.exists || !request) continue;
          if (request.requesterUid !== uid || request.status === "closed") continue;

          const isFirstAccept =
            !(request.acceptedPostIds ?? []).length && !request.fulfilledByPostId;
          await requestRef.update({
            acceptedPostIds: FieldValue.arrayUnion(postId),
            acceptedUids: FieldValue.arrayUnion(responderUid),
            status: "fulfilled",
            updatedAt: FieldValue.serverTimestamp(),
            ...(isFirstAccept
              ? { fulfilledByPostId: postId, fulfilledByUid: responderUid }
              : {}),
          });

          // Share-converted waiver credit (HANDOFF 4.4): the winning response
          // arrived via someone's ?ref link and the bounty ended in this real
          // purchase — the sharer earns a credit. Self/buyer refs grant nothing
          // (enforced inside the helper); deterministic id makes retries safe.
          if (refUid) {
            try {
              await grantShareConvertedCredit({
                refUid,
                requestId,
                responderUid,
                buyerUid: uid,
                label: (request.title as string) ?? "",
              });
            } catch (err) {
              console.error("share-converted credit grant failed", err);
            }
          }
        }
      }
    }
  }

  // Minimal lifecycle: when a subscription ends (cancellation / non-payment),
  // mark the record canceled so gated posts re-lock. Full renewal tracking
  // (invoice.paid → currentPeriodEnd) is a follow-up.
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const subscriberUid = sub.metadata?.subscriberUid;
    const creatorUid = sub.metadata?.creatorUid;
    if (subscriberUid && creatorUid) {
      await adminDb
        .collection("subscriptions")
        .doc(subscriptionId(subscriberUid, creatorUid))
        .set({ status: "canceled" }, { merge: true });
    }
  }

  return NextResponse.json({ received: true });
}
