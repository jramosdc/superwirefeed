"use client";

import { useEffect, useState } from "react";
import { getTrust } from "@/lib/db/accuracy";
import { TRUSTED_THRESHOLD } from "@/lib/trust";

// Shows a "Trusted source" chip once a member's server-maintained trust score
// (earned via verified-buyer corroborations) crosses the threshold.
export function TrustBadge({ uid }: { uid: string }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let active = true;
    getTrust(uid).then((t) => active && setScore(t?.score ?? 0));
    return () => {
      active = false;
    };
  }, [uid]);

  if (score < TRUSTED_THRESHOLD) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
      title={`Trust score ${Math.round(score)} — earned from verified-buyer corroborations`}
    >
      ✓ Trusted source
    </span>
  );
}
