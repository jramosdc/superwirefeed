import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { canCertify } from "@/lib/trust";
import type { CertificationKind } from "@/types";

// Issue a human-review certification (Human Authored or Curated). Server-only
// (rules block client writes). Only a TRUSTED THIRD PARTY may certify — never the
// creator. An AI-flagged post cannot be labeled Human Authored.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const postId: string | undefined = body.postId;
  const kind: CertificationKind = body.kind;
  const note: string = typeof body.note === "string" ? body.note.slice(0, 500) : "";
  const certifierName: string =
    typeof body.certifierName === "string" && body.certifierName
      ? body.certifierName
      : "Anon";

  if (!postId || (kind !== "authored" && kind !== "curated")) {
    return NextResponse.json({ error: "Invalid certification" }, { status: 400 });
  }

  const postSnap = await adminDb.collection("posts").doc(postId).get();
  if (!postSnap.exists) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const ownerUid = String(postSnap.data()?.ownerUid ?? "");
  if (ownerUid === uid) {
    return NextResponse.json(
      { error: "You cannot certify your own post" },
      { status: 400 },
    );
  }

  const trustScore = Number(
    (await adminDb.collection("trust").doc(uid).get()).data()?.score ?? 0,
  );
  if (!canCertify(trustScore)) {
    return NextResponse.json(
      { error: "Only trusted members can certify content" },
      { status: 403 },
    );
  }

  const certRef = adminDb.collection("certifications").doc(`${uid}_${postId}`);
  const summaryRef = adminDb.collection("postCertification").doc(postId);

  try {
    await adminDb.runTransaction(async (tx) => {
      const [certSnap, summarySnap] = await Promise.all([
        tx.get(certRef),
        tx.get(summaryRef),
      ]);

      const summary = summarySnap.data() ?? {};
      if (kind === "authored" && summary.aiFlagged) {
        throw new Error("AI_FLAGGED");
      }

      let authored = Number(summary.authoredCount ?? 0);
      let curated = Number(summary.curatedCount ?? 0);

      const prevKind = certSnap.exists
        ? (certSnap.data()?.kind as CertificationKind)
        : null;
      if (prevKind === "authored") authored -= 1;
      else if (prevKind === "curated") curated -= 1;
      if (kind === "authored") authored += 1;
      else curated += 1;

      tx.set(certRef, {
        postId,
        ownerUid,
        certifierUid: uid,
        certifierName,
        kind,
        note,
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.set(
        summaryRef,
        {
          authoredCount: Math.max(0, authored),
          curatedCount: Math.max(0, curated),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });
  } catch (e) {
    if (e instanceof Error && e.message === "AI_FLAGGED") {
      return NextResponse.json(
        { error: "AI-flagged content cannot be certified as human-authored" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Could not save certification" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
