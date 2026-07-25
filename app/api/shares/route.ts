import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { grantCreatedAndSharedCredits } from "@/lib/server/waiverCredits";

// Record a share event and grant any waiver credit it earns (HANDOFF 4.1/4.4).
// The webapp shares through here (server-side, Admin SDK) so the
// "created-and-shared" credit can be granted in the same request; the iOS app
// writes `shares` docs directly under the client rule and its credits are
// reconciled when the sharer next sells (webhook) or shares on the web.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, postId } = (await req.json().catch(() => ({}))) as {
    requestId?: string;
    postId?: string;
  };
  if (!requestId && !postId) {
    return NextResponse.json({ error: "Nothing to share" }, { status: 400 });
  }

  await adminDb.collection("shares").add({
    sharerUid: uid,
    requestId: requestId ?? "",
    ...(postId ? { postId } : {}),
    platform: "web",
    createdAt: FieldValue.serverTimestamp(),
  });

  // Sharing your own bounty earns a fee-waiver credit (capped monthly).
  // Best-effort: a failure here must not make the share itself fail.
  if (requestId) {
    try {
      await grantCreatedAndSharedCredits(uid);
    } catch (err) {
      console.error("waiver credit grant failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
