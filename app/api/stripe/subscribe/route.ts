import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { subscriptionId } from "@/lib/db/subscriptions";

// Create a Stripe Checkout session for a recurring subscription to a creator's
// feed. The PRICE is read from the creator's feed on the server — never trusted
// from the client (same principle as the per-item checkout route).
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const subscriberUid = await verifyIdToken(token);
  if (!subscriberUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorUid } = await req.json().catch(() => ({}));
  if (!creatorUid) return NextResponse.json({ error: "Missing creatorUid" }, { status: 400 });

  if (creatorUid === subscriberUid) {
    return NextResponse.json({ error: "You can't subscribe to yourself" }, { status: 400 });
  }

  const snap = await adminDb.collection("feeds").doc(creatorUid).get();
  if (!snap.exists) return NextResponse.json({ error: "Wire not found" }, { status: 404 });
  const feed = snap.data() as {
    name?: string;
    subscriptionEnabled?: boolean;
    subscriptionPriceCents?: number;
  };

  const priceCents = feed.subscriptionPriceCents ?? 0;
  if (!feed.subscriptionEnabled || priceCents <= 0) {
    return NextResponse.json({ error: "This wire has no subscription" }, { status: 400 });
  }

  // Already subscribed (active)? Short-circuit.
  const existing = await adminDb
    .collection("subscriptions")
    .doc(subscriptionId(subscriberUid, creatorUid))
    .get();
  if (existing.exists && existing.data()?.status === "active") {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const metadata = { subscriberUid, creatorUid, amount: String(priceCents) };
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    success_url: `${base}/feeds/${creatorUid}?subscribe=success`,
    cancel_url: `${base}/feeds/${creatorUid}?subscribe=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          recurring: { interval: "month" },
          product_data: {
            name: `${feed.name || "SuperWire"} — subscription`,
            description: "Monthly access to all gated posts in this wire.",
          },
        },
      },
    ],
    // The webhook uses session.metadata to write the subscription record;
    // subscription_data.metadata lets a future deletion webhook map back.
    metadata,
    subscription_data: { metadata },
  });

  return NextResponse.json({ url: session.url });
}
