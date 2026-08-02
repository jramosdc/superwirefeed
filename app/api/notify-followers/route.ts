import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { NOTIFY_FOLLOWERS_FEE_CENTS } from "@/lib/fees";

// Push-notify a seller's followers about their breaking post. This route is
// deliberately the ONLY way a notification blast happens (no Firestore
// triggers): it is the choke point where the future per-use charge will be
// enforced (owner decision — free during beta, see NOTIFY_FOLLOWERS_FEE_CENTS)
// and the postNotifications marker it writes is one-per-post, so a post can
// never be used to spam followers twice.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = (await req.json().catch(() => ({}))) as { postId?: string };
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const postSnap = await adminDb.collection("posts").doc(postId).get();
  const post = postSnap.data();
  if (!postSnap.exists || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.ownerUid !== uid) {
    return NextResponse.json({ error: "Not your post" }, { status: 403 });
  }
  // Scope: breaking posts only — the one trigger followers opted into by
  // following a wire. (A paid tier may widen this later.)
  if (!post.breaking) {
    return NextResponse.json({ error: "Only breaking posts notify" }, { status: 400 });
  }

  const markerRef = adminDb.collection("postNotifications").doc(postId);
  if ((await markerRef.get()).exists) {
    return NextResponse.json({ error: "Followers already notified for this post" }, { status: 409 });
  }

  // ---- Premium seam (future): when notify becomes paid, charge/entitle here
  // (waiver credits / Stripe), BEFORE any send. Free during beta.
  const feeCents = NOTIFY_FOLLOWERS_FEE_CENTS;

  // Followers → device tokens. Both bounded; 'in' queries take ≤30 ids per
  // batch. Fan-out is capped at 1000 followers for now (log-worthy if hit).
  const followersSnap = await adminDb
    .collection("users").doc(uid).collection("followers").limit(1000).get();
  const followerUids = followersSnap.docs.map((d) => d.id);

  const tokens: string[] = [];
  for (let i = 0; i < followerUids.length; i += 30) {
    const batch = followerUids.slice(i, i + 30);
    const tokSnap = await adminDb
      .collection("fcmTokens").where("uid", "in", batch).get();
    tokSnap.docs.forEach((d) => tokens.push(d.id));
  }

  // Seller name for the notification title (best effort).
  const seller = (await adminDb.collection("users").doc(uid).get()).data();
  const sellerName = (seller?.displayName as string) || "A wire you follow";

  let successCount = 0;
  if (tokens.length > 0) {
    const messaging = getMessaging();
    // FCM multicast takes ≤500 tokens per call.
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const res = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: `🔴 Breaking from ${sellerName}`,
          body: (post.title as string) || "New breaking post on the wire",
        },
        apns: { payload: { aps: { sound: "default" } } },
        data: { postId },
      });
      successCount += res.successCount;
      // Prune tokens FCM says are dead so future blasts stay clean.
      await Promise.all(
        res.responses.map((r, idx) =>
          r.error?.code === "messaging/registration-token-not-registered"
            ? adminDb.collection("fcmTokens").doc(batch[idx]).delete()
            : Promise.resolve(),
        ),
      );
    }
  }

  await markerRef.set({
    postId,
    ownerUid: uid,
    followerCount: followerUids.length,
    deviceCount: tokens.length,
    sentCount: successCount,
    feeCents,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    followers: followerUids.length,
    devices: tokens.length,
    delivered: successCount,
  });
}
