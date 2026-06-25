import { NextResponse } from "next/server";
import { getUidFromRequest } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Creates or updates a review (one per author per seller) and keeps the
// seller's feed rating aggregate consistent — all in a transaction.
export async function POST(req: Request) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    sellerUid?: string;
    rating?: number;
    text?: string;
    authorName?: string;
    authorPhoto?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sellerUid = body.sellerUid;
  const rating = Number(body.rating);
  if (!sellerUid || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  if (sellerUid === uid) {
    return NextResponse.json(
      { error: "You cannot review your own feed" },
      { status: 400 },
    );
  }

  const reviewRef = adminDb.collection("reviews").doc(`${uid}_${sellerUid}`);
  const feedRef = adminDb.collection("feeds").doc(sellerUid);

  try {
    await adminDb.runTransaction(async (tx) => {
      const [reviewSnap, feedSnap] = await Promise.all([
        tx.get(reviewRef),
        tx.get(feedRef),
      ]);

      const prevRating = reviewSnap.exists
        ? Number(reviewSnap.data()?.rating || 0)
        : null;

      const feed = feedSnap.data() || {};
      let count = Number(feed.ratingCount || 0);
      let sum = Number(feed.ratingAvg || 0) * count;

      if (prevRating === null) {
        count += 1;
        sum += rating;
      } else {
        sum += rating - prevRating;
      }
      const avg = count > 0 ? sum / count : 0;

      tx.set(reviewRef, {
        sellerUid,
        authorUid: uid,
        authorName: body.authorName || "Anonymous",
        authorPhoto: body.authorPhoto || "",
        rating,
        text: (body.text || "").slice(0, 2000),
        createdAt: FieldValue.serverTimestamp(),
      });

      if (feedSnap.exists) {
        tx.update(feedRef, { ratingCount: count, ratingAvg: avg });
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save review" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
