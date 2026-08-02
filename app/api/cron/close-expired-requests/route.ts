import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Bounty auto-close (HANDOFF 3.8), run on a schedule by Vercel Cron (see
// vercel.json). Both clients already compute expiry and treat an expired
// open request as closed — this job flips the STORED status too, so
// queries and analytics over `requests` stay honest.
//
// A request auto-closes only when its deadline has passed AND nothing was
// ever accepted; a fulfilled request keeps its status.
export async function GET(req: Request) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the env
  // var is set. Refuse to run without the secret — this route mutates data.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Bounded single-field query, expiry filtered in memory — same pattern as
  // the clients, and no composite (status, expiresAt) index needed.
  const snap = await adminDb
    .collection("requests")
    .where("status", "==", "open")
    .limit(500)
    .get();

  const now = Date.now();
  const expired = snap.docs.filter((d) => {
    const data = d.data();
    const expiresAt: number | undefined = data.expiresAt?.toMillis?.();
    const accepted =
      (data.acceptedPostIds ?? []).length > 0 || data.fulfilledByPostId;
    return expiresAt != null && expiresAt < now && !accepted;
  });

  for (const doc of expired) {
    await doc.ref.update({
      status: "closed",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({ open: snap.size, closed: expired.length });
}
