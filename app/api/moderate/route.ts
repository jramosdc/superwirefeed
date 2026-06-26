import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { canModerate } from "@/lib/trust";

// Moderator action: set/clear the "likely AI-generated" flag on a post. Only the
// moderator trust tier may do this. Server-only (rules block client writes).
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const postId: string | undefined = body.postId;
  const aiFlagged = Boolean(body.aiFlagged);
  const reason: string = typeof body.reason === "string" ? body.reason.slice(0, 300) : "";
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const trustScore = Number(
    (await adminDb.collection("trust").doc(uid).get()).data()?.score ?? 0,
  );
  if (!canModerate(trustScore)) {
    return NextResponse.json(
      { error: "Only moderators can flag content" },
      { status: 403 },
    );
  }

  await adminDb
    .collection("postCertification")
    .doc(postId)
    .set(
      {
        aiFlagged,
        aiFlagReason: aiFlagged ? reason || "Flagged as likely AI-generated." : "",
        aiFlaggedBy: aiFlagged ? uid : "",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return NextResponse.json({ ok: true });
}
