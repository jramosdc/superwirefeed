// Trust/accuracy weighting constants and pure helpers, shared by the
// /api/attestations route. Centralized so the economics are easy to tune.

// A verified buyer's attestation outweighs a free account's — economic
// skin-in-the-game is the primary anti-sybil lever.
export const BUYER_WEIGHT = 3;
export const BASE_WEIGHT = 1;

// Small, capped bonus from the attester's own accumulated trust.
export const TRUST_BONUS_FACTOR = 0.1;
export const TRUST_BONUS_CAP = 3;

// A member is shown as a "trusted source" at/above this trust score.
export const TRUSTED_THRESHOLD = 10;

export function attestationWeight(
  verifiedBuyer: boolean,
  attesterTrustScore: number,
): number {
  const base = verifiedBuyer ? BUYER_WEIGHT : BASE_WEIGHT;
  const bonus = Math.min(
    Math.max(attesterTrustScore, 0) * TRUST_BONUS_FACTOR,
    TRUST_BONUS_CAP,
  );
  return base + bonus;
}

// Accuracy score in [0,1]; 0 when there are no attestations yet.
export function computeScore(corrWeight: number, dispWeight: number): number {
  const total = corrWeight + dispWeight;
  if (total <= 0) return 0;
  return Math.round((corrWeight / total) * 100) / 100;
}
