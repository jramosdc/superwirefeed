import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { getLicense } from "@/lib/licenses";
import { purchaseId } from "@/lib/db/purchases";
import type { LicenseKey } from "@/types";

// Create a Stripe Checkout session for a post. The PRICE is read from the post's
// license on the server — never trusted from the client (the old app computed
// the amount in the browser, viewpost.ts:124).
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json().catch(() => ({}));
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const snap = await adminDb.collection("posts").doc(postId).get();
  if (!snap.exists) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const post = snap.data() as { title: string; license: LicenseKey; ownerUid: string };

  const license = getLicense(post.license);
  if (!license.gated) {
    return NextResponse.json({ error: "This post is free" }, { status: 400 });
  }
  if (post.ownerUid === uid) {
    return NextResponse.json({ error: "You own this post" }, { status: 400 });
  }

  // Already purchased? Short-circuit.
  const existing = await adminDb.collection("purchases").doc(purchaseId(uid, postId)).get();
  if (existing.exists) {
    return NextResponse.json({ error: "Already purchased" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    success_url: `${base}/posts/${postId}?purchase=success`,
    cancel_url: `${base}/posts/${postId}?purchase=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: license.priceCents,
          product_data: {
            name: post.title || "SuperWire post",
            description: license.label,
          },
        },
      },
    ],
    // The webhook uses this metadata to write the purchase record.
    metadata: { uid, postId, amount: String(license.priceCents) },
  });

  return NextResponse.json({ url: session.url });
}
