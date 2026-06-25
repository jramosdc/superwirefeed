import "server-only";
import Stripe from "stripe";

// Lazily-created server-side Stripe client. Deferred so that building the app
// without env vars present (e.g. CI page-data collection) doesn't instantiate
// the SDK with an empty key. The secret key never reaches the browser.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}
