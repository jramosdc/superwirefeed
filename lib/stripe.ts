import "server-only";
import Stripe from "stripe";

// Server-side Stripe client. The secret key never reaches the browser.
// Pin to the API version bundled with the installed stripe-node types.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
});
