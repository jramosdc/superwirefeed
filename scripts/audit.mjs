// SuperWire platform audit: scans negatively-scored posts and flags likely
// AI-generated content. Admin-triggerable (run against the emulator).
//
// The detector here is a STUB mirroring lib/ai-detect.ts — swap in a real
// provider later. SAFETY: targets the EMULATOR only (forced host vars below).
//
// Usage: emulator running, then `npm run audit`.

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PROJECT_ID = "superwire-7872c";
const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);

// Mirror of lib/ai-detect.ts (kept inline so this script needs no TS loader).
function detectAiGenerated({ accuracyScore, disputes }) {
  if (disputes > 0 && accuracyScore < 0.5) {
    return {
      flagged: true,
      reason: "Audit: disputed with low corroboration — flagged pending review.",
    };
  }
  return { flagged: false, reason: "" };
}

async function run() {
  console.log(`SuperWire audit (emulator, project ${PROJECT_ID})…`);
  const accSnap = await db.collection("postAccuracy").get();

  let flagged = 0;
  for (const d of accSnap.docs) {
    const a = d.data();
    const result = detectAiGenerated({
      accuracyScore: Number(a.score ?? 0),
      disputes: Number(a.disputes ?? 0),
    });
    if (!result.flagged) continue;

    await db.collection("postCertification").doc(d.id).set(
      {
        aiFlagged: true,
        aiFlagReason: result.reason,
        aiFlaggedBy: "superwire-audit",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    flagged += 1;
    console.log(`  ⚠ flagged ${d.id} (score ${a.score}, disputes ${a.disputes})`);
  }

  console.log(`✓ Audit complete. Flagged ${flagged} post(s).`);
}

run().then(
  () => process.exit(0),
  (e) => {
    console.error("Audit failed:", e);
    process.exit(1);
  },
);
