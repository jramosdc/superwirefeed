import type { PostCertificationDoc } from "@/types";
import { isHumanCertified } from "@/lib/trust";

// Presentational chips: "Human Certified" and/or a "Likely AI-generated"
// caution, derived from the server-maintained certification summary.
export function HumanCertifiedBadge({
  cert,
  size = "sm",
}: {
  cert: PostCertificationDoc | null | undefined;
  size?: "sm" | "xs";
}) {
  if (!cert) return null;
  const certified = isHumanCertified(
    cert.authoredCount,
    cert.verifiedCount,
    cert.aiFlagged,
  );
  if (!certified && !cert.aiFlagged) return null;

  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  const detail =
    cert.authoredCount > 0 && !cert.aiFlagged
      ? "Human-authored"
      : cert.verifiedCount > 0
        ? "Human-verified"
        : "";

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {certified && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 font-semibold text-emerald-700 ${pad}`}
          title={`Human Certified${detail ? ` · ${detail}` : ""}`}
        >
          ✓ Human Certified
        </span>
      )}
      {cert.aiFlagged && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-amber-100 font-semibold text-amber-800 ${pad}`}
          title={cert.aiFlagReason || "Flagged as likely AI-generated"}
        >
          ⚠ Likely AI-generated
        </span>
      )}
    </span>
  );
}
