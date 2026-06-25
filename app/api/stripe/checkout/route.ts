import { NextResponse } from "next/server";
import { getUidFromRequest } from "@/lib/server-auth";
import { getPost, hasPurchased } from "@/lib/db/server";
import { getLicense } from "@/lib/licenses";
import { assertStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Creates a Stripe Checkout session for a paid post. The price is derived
// server-side from the post's license — never trusted from the client.
export async function POST(req: Request) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let postId: string;
  try {
    ({ postId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const post = await getPost(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const license = getLicense(post.license);
  if (!license.paid) {
    return NextResponse.json({ error: "This post is free" }, { status: 400 });
  }
  if (post.owner.uid === uid) {
    return NextResponse.json(
      { error: "You already own this content" },
      { status: 400 },
    );
  }
  if (await hasPurchased(uid, postId)) {
    return NextResponse.json(
      { error: "You have already purchased this" },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const stripe = assertStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: license.priceUsd * 100,
          product_data: {
            name: post.title,
            description: license.label,
          },
        },
      },
    ],
    success_url: `${siteUrl}/posts/${postId}?purchased=1`,
    cancel_url: `${siteUrl}/posts/${postId}`,
    // Carried back by the webhook to write the purchase record.
    metadata: {
      buyerUid: uid,
      postId,
      sellerUid: post.owner.uid,
      license: post.license,
      amountUsd: String(license.priceUsd),
    },
  });

  return NextResponse.json({ url: session.url });
}
