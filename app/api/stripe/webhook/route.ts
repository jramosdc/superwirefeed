import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { purchaseId } from "@/lib/db/purchases";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";

// Stripe webhook. This is the ONLY writer of purchase records. The signature is
// verified, then on a completed checkout we write purchases/{uid}_{postId} via
// the Admin SDK (which bypasses Firestore rules — clients can never forge one).
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
    const uid = session.metadata?.uid;
    const postId = session.metadata?.postId;
    const amount = Number(session.metadata?.amount ?? session.amount_total ?? 0);

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
    }
  }

  return NextResponse.json({ received: true });
}
