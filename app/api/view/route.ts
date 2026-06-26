import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Records a post view (no auth — anyone browsing). Server-only write keeps the
// counter un-spoofable from the client; the page deduplicates per session.
export async function POST(req: Request) {
  const { postId } = await req.json().catch(() => ({}));
  if (!postId || typeof postId !== "string") {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  await adminDb
    .collection("postStats")
    .doc(postId)
    .set(
      { views: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

  return NextResponse.json({ ok: true });
}
