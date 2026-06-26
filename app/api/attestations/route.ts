import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { attestationWeight, computeScore } from "@/lib/trust";
import type { AttestationVerdict } from "@/types";

// Accuracy attestations are written ONLY here (rules block client writes). In one
// transaction we record the attestation, update the post's accuracy aggregate, and
// bump the seller's trust score. Attestation weight favors VERIFIED BUYERS — the
// primary anti-sybil lever (faking it costs real money). Only verified-buyer
// corroborations contribute to a seller's trust score.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const uid = await verifyIdToken(token);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const postId: string | undefined = body.postId;
  const verdict: AttestationVerdict = body.verdict;
  const evidenceUrl: string =
    typeof body.evidenceUrl === "string" ? body.evidenceUrl.slice(0, 500) : "";
  const attesterName: string =
    typeof body.attesterName === "string" && body.attesterName
      ? body.attesterName
      : "Anon";

  if (!postId || (verdict !== "corroborate" && verdict !== "dispute")) {
    return NextResponse.json({ error: "Invalid attestation" }, { status: 400 });
  }

  const postSnap = await adminDb.collection("posts").doc(postId).get();
  if (!postSnap.exists) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const sellerUid = String(postSnap.data()?.ownerUid ?? "");
  if (!sellerUid || sellerUid === uid) {
    return NextResponse.json(
      { error: "You cannot attest to your own post" },
      { status: 400 },
    );
  }

  const verifiedBuyer = (
    await adminDb.collection("purchases").doc(`${uid}_${postId}`).get()
  ).exists;

  const attestationRef = adminDb.collection("attestations").doc(`${uid}_${postId}`);
  const accuracyRef = adminDb.collection("postAccuracy").doc(postId);
  const sellerTrustRef = adminDb.collection("trust").doc(sellerUid);
  const attesterTrustRef = adminDb.collection("trust").doc(uid);

  try {
    await adminDb.runTransaction(async (tx) => {
      const [attSnap, accSnap, sellerTrustSnap, attesterTrustSnap] =
        await Promise.all([
          tx.get(attestationRef),
          tx.get(accuracyRef),
          tx.get(sellerTrustRef),
          tx.get(attesterTrustRef),
        ]);

      const attesterTrust = Number(attesterTrustSnap.data()?.score ?? 0);
      const weight = attestationWeight(verifiedBuyer, attesterTrust);

      // Previous contribution (when re-submitting / changing a verdict).
      const prev = attSnap.exists
        ? {
            verdict: attSnap.data()?.verdict as AttestationVerdict,
            weight: Number(attSnap.data()?.weight ?? 0),
            verifiedBuyer: Boolean(attSnap.data()?.verifiedBuyer),
          }
        : null;

      const acc = accSnap.data() ?? {};
      let corroborations = Number(acc.corroborations ?? 0);
      let disputes = Number(acc.disputes ?? 0);
      let corrWeight = Number(acc.corrWeight ?? 0);
      let dispWeight = Number(acc.dispWeight ?? 0);

      // Remove the previous contribution.
      if (prev) {
        if (prev.verdict === "corroborate") {
          corroborations -= 1;
          corrWeight -= prev.weight;
        } else {
          disputes -= 1;
          dispWeight -= prev.weight;
        }
      }
      // Add the new contribution.
      if (verdict === "corroborate") {
        corroborations += 1;
        corrWeight += weight;
      } else {
        disputes += 1;
        dispWeight += weight;
      }
      corrWeight = Math.max(0, corrWeight);
      dispWeight = Math.max(0, dispWeight);

      // Trust counts ONLY verified-buyer corroborations (economic skin-in-the-game).
      const newTrust = verdict === "corroborate" && verifiedBuyer ? weight : 0;
      const oldTrust =
        prev?.verdict === "corroborate" && prev.verifiedBuyer ? prev.weight : 0;
      const sellerTrustDelta = newTrust - oldTrust;

      tx.set(attestationRef, {
        attesterUid: uid,
        attesterName,
        postId,
        sellerUid,
        verdict,
        evidenceUrl,
        weight,
        verifiedBuyer,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(accuracyRef, {
        corroborations: Math.max(0, corroborations),
        disputes: Math.max(0, disputes),
        corrWeight,
        dispWeight,
        score: computeScore(corrWeight, dispWeight),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (sellerTrustDelta !== 0) {
        const current = Number(sellerTrustSnap.data()?.score ?? 0);
        tx.set(
          sellerTrustRef,
          {
            score: Math.max(0, current + sellerTrustDelta),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save attestation" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
