import type { PostCertificationDoc } from "@/types";

// Presentational chips: "Human Authored" (created by a person), "Curated" (a
// human reviewed the data), and/or a "Likely AI-generated" caution. Derived from
// the server-maintained certification summary.
export function HumanCertifiedBadge({
  cert,
  size = "sm",
}: {
  cert: PostCertificationDoc | null | undefined;
  size?: "sm" | "xs";
}) {
  if (!cert) return null;
  const authored = cert.authoredCount > 0 && !cert.aiFlagged;
  const curated = cert.curatedCount > 0;
  if (!authored && !curated && !cert.aiFlagged) return null;

  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {authored && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 font-semibold text-emerald-700 ${pad}`}
          title="Created by a person (journalist, writer, artist, photographer)"
        >
          ✍ Human Authored
        </span>
      )}
      {curated && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-sky-100 font-semibold text-sky-700 ${pad}`}
          title="A human reviewed this data (source not necessarily human-created)"
        >
          ✓ Curated
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
