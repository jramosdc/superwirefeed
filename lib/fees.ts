// Platform economics — single source of truth (HANDOFF Phase 4, decided
// 2026-07-09). Client components may import the constants for display, but the
// amounts that reach Stripe are ALWAYS computed server-side (checkout route /
// webhook) — never trusted from the client.

// Seller-side platform fee, % of the post's gross price. Waived (0%) on a sale
// that consumes one of the seller's waiver credits.
export const PLATFORM_FEE_PCT = 5;

// Buyer-side service fee, added as its own Stripe line item at checkout.
// Owner-confirmed default; change here to change it everywhere.
export const SERVICE_FEE_CENTS = 75;

// Waiver-credit cap: max "created-and-shared" credits a user can earn per
// calendar month. ("share-converted" credits are uncapped — they require a
// real purchase verified in the webhook.)
export const CREATED_AND_SHARED_MONTHLY_CAP = 3;

// Push-notifying your followers about a breaking post. FREE during beta;
// the owner's plan is to make this a paid per-use feature later — when that
// happens, this constant becomes the price and /api/notify-followers (the
// single choke point) charges it before sending. The postNotifications
// marker doc already records feeCents per send, so history stays honest.
export const NOTIFY_FOLLOWERS_FEE_CENTS = 0;

export function platformFeeCents(grossCents: number): number {
  return Math.round((grossCents * PLATFORM_FEE_PCT) / 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
