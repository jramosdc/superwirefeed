// Licensing model — preserves the exact tiers from the original app
// (newpost.ts line 25): CC-BY (free), CC-BY-ND, Selling/Attribution ($35),
// Selling/Exclusive ($200). Prices are centralized here so opening up
// seller-set pricing later is a one-file change.

export type LicenseKey =
  | "CC_BY"
  | "CC_BY_ND"
  | "SELL_ATTRIBUTION"
  | "SELL_EXCLUSIVE";

export interface License {
  key: LicenseKey;
  label: string;
  /** Whether the content requires payment to download. */
  paid: boolean;
  /** Price in whole US dollars (0 for free licenses). */
  priceUsd: number;
  /** Plain-language description of the republication rights granted. */
  rights: string;
}

export const LICENSES: Record<LicenseKey, License> = {
  CC_BY: {
    key: "CC_BY",
    label: "CC-BY (free)",
    paid: false,
    priceUsd: 0,
    rights:
      "Free to republish, including commercially, with attribution to the original source.",
  },
  CC_BY_ND: {
    key: "CC_BY_ND",
    label: "CC-BY-ND",
    paid: false,
    priceUsd: 0,
    rights:
      "Free to republish with attribution, but no derivatives or modifications are permitted.",
  },
  SELL_ATTRIBUTION: {
    key: "SELL_ATTRIBUTION",
    label: "Selling / Attribution",
    paid: true,
    priceUsd: 35,
    rights:
      "Paid license to republish with attribution to the original source.",
  },
  SELL_EXCLUSIVE: {
    key: "SELL_EXCLUSIVE",
    label: "Selling / Exclusive",
    paid: true,
    priceUsd: 200,
    rights:
      "Paid exclusive license for republication. Highest tier of usage rights.",
  },
};

export const LICENSE_LIST: License[] = Object.values(LICENSES);

export function getLicense(key: LicenseKey): License {
  return LICENSES[key] ?? LICENSES.CC_BY;
}

export function isPaidLicense(key: LicenseKey): boolean {
  return getLicense(key).paid;
}

export function licensePriceCents(key: LicenseKey): number {
  return getLicense(key).priceUsd * 100;
}
