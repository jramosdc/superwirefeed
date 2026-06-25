import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { assertStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Stripe calls this after a successful payment. We verify the signature, then
// write the purchase record with the Admin SDK (clients can never forge one).
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = assertStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata || {};
    const buyerUid = m.buyerUid;
    const postId = m.postId;

    if (buyerUid && postId) {
      await adminDb
        .collection("purchases")
        .doc(`${buyerUid}_${postId}`)
        .set({
          buyerUid,
          postId,
          sellerUid: m.sellerUid || "",
          license: m.license || "",
          amountUsd: Number(m.amountUsd || 0),
          stripeSessionId: session.id,
          createdAt: FieldValue.serverTimestamp(),
        });
    }
  }

  return NextResponse.json({ received: true });
}
