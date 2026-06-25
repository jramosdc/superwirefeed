import type { LicenseKey } from "@/types";

export interface LicenseInfo {
  key: LicenseKey;
  label: string;
  shortLabel: string;
  priceCents: number;
  gated: boolean;
  rights: string;
}

// Single source of truth for licensing. Preserves the original four tiers
// ($0 / $0 / $35 / $200). Price is ALWAYS read from here on the server when
// creating a Stripe session — never trusted from the client (the old app
// computed the amount client-side, viewpost.ts:124).
export const LICENSES: Record<LicenseKey, LicenseInfo> = {
  CC_BY: {
    key: "CC_BY",
    label: "CC-BY (free)",
    shortLabel: "CC-BY",
    priceCents: 0,
    gated: false,
    rights:
      "Free to republish with attribution to the original author. No payment required.",
  },
  CC_BY_ND: {
    key: "CC_BY_ND",
    label: "CC-BY-ND (free)",
    shortLabel: "CC-BY-ND",
    priceCents: 0,
    gated: false,
    rights:
      "Free to republish with attribution, no derivatives. No payment required.",
  },
  SELL_ATTRIBUTION: {
    key: "SELL_ATTRIBUTION",
    label: "Selling / Attribution ($35)",
    shortLabel: "Attribution",
    priceCents: 3500,
    gated: true,
    rights:
      "Paid license to republish with attribution to the seller. One-time $35.",
  },
  SELL_EXCLUSIVE: {
    key: "SELL_EXCLUSIVE",
    label: "Selling / Exclusive ($200)",
    shortLabel: "Exclusive",
    priceCents: 20000,
    gated: true,
    rights:
      "Paid exclusive license to republish. One-time $200.",
  },
};

export const LICENSE_LIST: LicenseInfo[] = Object.values(LICENSES);

export function getLicense(key: LicenseKey): LicenseInfo {
  return LICENSES[key];
}

export function isGated(key: LicenseKey): boolean {
  return LICENSES[key].gated;
}

export function priceCents(key: LicenseKey): number {
  return LICENSES[key].priceCents;
}

export function formatPrice(cents: number): string {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(0)}`;
}
