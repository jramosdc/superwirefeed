import { NextResponse } from "next/server";
import { adminDb, adminBucket, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getLicense } from "@/lib/licenses";
import { purchaseId } from "@/lib/db/purchases";
import type { LicenseKey } from "@/types";

// Purchase-gated download. Verifies the caller's Firebase ID token, confirms
// they may access the asset (free post, owner, or a matching purchase), then
// returns a short-lived signed URL. The asset file is never client-readable
// directly (storage.rules deny reads of /assets/**).
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
  };

  if (!post.assetPath) {
    return NextResponse.json({ error: "No file attached" }, { status: 404 });
  }

  const gated = getLicense(post.license).gated;
  const allowed =
    !gated ||
    post.ownerUid === uid ||
    (await adminDb.collection("purchases").doc(purchaseId(uid, postId)).get()).exists;

  if (!allowed) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const [url] = await adminBucket.file(post.assetPath).getSignedUrl({
    action: "read",
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    responseDisposition: `attachment; filename="${post.assetName ?? "download"}"`,
  });

  // Count real consumers' downloads (not the owner's own) for usage ranking.
  if (post.ownerUid !== uid) {
    await adminDb
      .collection("postStats")
      .doc(postId)
      .set(
        { downloads: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
  }

  return NextResponse.json({ url });
}
