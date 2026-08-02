import { NextResponse } from "next/server";
import { adminDb, adminBucket, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getLicense } from "@/lib/licenses";
import { purchaseId } from "@/lib/db/purchases";
import { subscriptionId } from "@/lib/db/subscriptions";
import type { LicenseKey } from "@/types";

// Purchase-gated download. Verifies the caller's Firebase ID token, confirms
// they may access the asset (free post, owner, or a matching purchase), then
// returns either a short-lived signed URL for an uploaded asset or the
// seller's EXTERNAL deliverable link (postSecrets/{postId} — Drive,
// WeTransfer, …). Neither is ever client-readable directly (storage.rules
// deny /assets/** reads; firestore.rules deny postSecrets reads).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb.collection("posts").doc(postId).get();
  if (!snap.exists) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const post = snap.data() as {
    license: LicenseKey;
    ownerUid: string;
    assetPath?: string | null;
    assetName?: string | null;
    hasExternalDeliverable?: boolean;
  };

  if (!post.assetPath && !post.hasExternalDeliverable) {
    return NextResponse.json({ error: "No file attached" }, { status: 404 });
  }

  const gated = getLicense(post.license).gated;
  let allowed = !gated || post.ownerUid === uid;
  // How access was granted — recorded in the user's download history.
  let accessKind: "free" | "purchase" | "subscription" = "free";
  if (!allowed) {
    // Unlocked by a per-item purchase or an active subscription to the creator.
    const [purchase, sub] = await Promise.all([
      adminDb.collection("purchases").doc(purchaseId(uid, postId)).get(),
      adminDb.collection("subscriptions").doc(subscriptionId(uid, post.ownerUid)).get(),
    ]);
    allowed = purchase.exists || (sub.exists && sub.data()?.status === "active");
    accessKind = purchase.exists ? "purchase" : "subscription";
  }

  if (!allowed) {
    return NextResponse.json({ error: "Purchase or subscription required" }, { status: 403 });
  }

  let url: string;
  if (post.assetPath) {
    [url] = await adminBucket.file(post.assetPath).getSignedUrl({
      action: "read",
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      responseDisposition: `attachment; filename="${post.assetName ?? "download"}"`,
    });
  } else {
    // External deliverable: the link lives in postSecrets, never on the
    // world-readable post doc. The ownerUid cross-check stops a stale or
    // forged secret from serving under someone else's post.
    const secret = await adminDb.collection("postSecrets").doc(postId).get();
    const external = secret.data();
    if (!secret.exists || external?.ownerUid !== post.ownerUid || !external?.deliverableUrl) {
      return NextResponse.json({ error: "No file attached" }, { status: 404 });
    }
    url = external.deliverableUrl as string;
  }

  // Count real consumers' downloads (not the owner's own) for usage ranking,
  // and record the user's download history (their "library" — one doc per
  // user+post, re-downloads bump lastAt/count). Rules let a user read only
  // their own history docs.
  if (post.ownerUid !== uid) {
    await Promise.all([
      adminDb
        .collection("postStats")
        .doc(postId)
        .set(
          { downloads: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        ),
      adminDb
        .collection("downloads")
        .doc(`${uid}_${postId}`)
        .set(
          {
            uid,
            postId,
            kind: accessKind,
            count: FieldValue.increment(1),
            lastAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        ),
    ]);
  }

  return NextResponse.json({ url });
}
