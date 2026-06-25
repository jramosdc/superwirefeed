// Server-side Stripe client.
import "server-only";

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Instantiated lazily so the app can build without Stripe configured.
export const stripe = key
  ? new Stripe(key)
  : (null as unknown as Stripe);

export function assertStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY).");
  }
  return stripe;
}
