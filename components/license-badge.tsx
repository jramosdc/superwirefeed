import { getLicense, type LicenseKey } from "@/lib/licenses";
import { formatUsd } from "@/lib/format";

export function LicenseBadge({ license }: { license: LicenseKey }) {
  const l = getLicense(license);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        l.paid
          ? "bg-brand/10 text-brand-dark"
          : "bg-emerald-50 text-emerald-700"
      }`}
      title={l.rights}
    >
      {l.label}
      {l.paid && <span>· {formatUsd(l.priceUsd)}</span>}
    </span>
  );
}
