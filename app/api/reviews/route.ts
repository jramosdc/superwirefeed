import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Reviews are written ONLY here (rules block client writes) so the seller's
// denormalized rating aggregate on their feed stays consistent. One review per
// author per seller (doc id `${authorUid}_${sellerUid}`); re-submitting updates
// the existing rating and re-derives the average in a transaction.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sellerUid: string | undefined = body.sellerUid;
  const rating = Number(body.rating);
  const text: string = typeof body.text === "string" ? body.text.slice(0, 2000) : "";
  const authorName: string =
    typeof body.authorName === "string" && body.authorName ? body.authorName : "Anon";

  if (!sellerUid || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  if (sellerUid === uid) {
    return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
  }

  const reviewRef = adminDb.collection("reviews").doc(`${uid}_${sellerUid}`);
  const feedRef = adminDb.collection("feeds").doc(sellerUid);

  try {
    await adminDb.runTransaction(async (tx) => {
      const [reviewSnap, feedSnap] = await Promise.all([
        tx.get(reviewRef),
        tx.get(feedRef),
      ]);

      const prev = reviewSnap.exists ? Number(reviewSnap.data()?.rating ?? 0) : null;
      const feed = feedSnap.data() ?? {};
      let count = Number(feed.ratingCount ?? 0);
      let sum = Number(feed.ratingAvg ?? 0) * count;

      if (prev === null) {
        count += 1;
        sum += rating;
      } else {
        sum += rating - prev;
      }
      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

      tx.set(reviewRef, {
        sellerUid,
        authorUid: uid,
        authorName,
        rating: Math.round(rating),
        text,
        createdAt: FieldValue.serverTimestamp(),
      });

      if (feedSnap.exists) {
        tx.update(feedRef, { ratingAvg: avg, ratingCount: count });
      }
    });
  } catch {
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
