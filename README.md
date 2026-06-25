# SuperWire

A marketplace for **user-created wire services**: publish content (articles, datasets,
media) under explicit licenses and sell it for republication, with ratings and a follow
graph to surface reliable sources.

This is a ground-up rewrite of the original 2016–2017 Angular 2 / AngularFire / Webpack app
(now parked under [`legacy/`](./legacy)) on a modern stack:

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS 4**
- **Firebase** Auth, Firestore, Storage (client SDK for UI/auth; Admin SDK on the server)
- **Stripe** Checkout + webhooks for paid licenses
- Deploy target: **Vercel**

## Feature parity

| Area | Implementation |
|---|---|
| Auth | Firebase email/password + email verification + password reset (`app/(auth)/*`) |
| Feeds | One wire per user, keyed by `uid` (`app/feeds`, `lib/db/feeds.ts`) |
| Posts | Rich body (Tiptap), cover/gallery images, link embed, CSV dataset (`app/posts/*`) |
| Licensing | `CC_BY` / `CC_BY_ND` (free) · `SELL_ATTRIBUTION` ($35) · `SELL_EXCLUSIVE` ($200) — `lib/licenses.ts` |
| Payments | Server-priced Stripe Checkout → webhook writes the purchase (`app/api/stripe/*`) |
| Downloads | Purchase-gated signed URL; asset never client-readable (`app/api/download/[postId]`) |
| Reviews/ratings | Per-seller reviews + aggregate (`lib/db/reviews.ts`, `app/profile/[uid]`) |
| Comments | Per-post comments (`lib/db/comments.ts`, `components/Comments.tsx`) |
| Social | Follow graph + "from sellers you follow" feed (`lib/db/follows.ts`, `app/following`) |
| Search | Title search + category filter (`lib/search.ts`, ports the old Angular pipes) |

## Architecture notes

- **Data access** lives in small typed modules under `lib/db/*` (one per collection),
  replacing the original monolithic `authService.ts`.
- **Single identity:** `uid` is the user, their feed id, and their profile doc id. The old
  app juggled three separate keys (`uid` / `userid` / `feedid`).
- **Security (new):** the original shipped with no rules and computed payment amounts in the
  browser. Here, `firestore.rules` / `storage.rules` scope all writes to the owner; the
  Stripe **webhook** is the only writer of `purchases`; and the gated download route verifies
  the caller's ID token + a matching purchase before returning a short-lived signed URL.

```
app/      routes + API route handlers          lib/firebase/  client + admin SDK + auth provider
components/ UI                                  lib/db/        typed Firestore accessors
types/    shared domain types                   lib/licenses.ts  license enum / pricing (server-trusted)
firestore.rules  storage.rules                  rules/         emulator-based rules tests
```

## Local development

1. **Install:** `npm install`
2. **Configure:** copy `.env.example` → `.env.local` and fill in Firebase + Stripe keys.
   For an all-local loop, set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=1` and start the emulators:
   ```bash
   npm run emulators        # Auth :9099  Firestore :8080  Storage :9199
   npm run dev              # http://localhost:3000
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. **Smoke-test the core loop:** register → verify email → (your wire is auto-created) →
   publish a paid post with a CSV → as a second user buy with test card
   `4242 4242 4242 4242` → the webhook writes the purchase → download unlocks → leave a
   review → follow the seller.

## Verification

```bash
npm run typecheck                        # tsc --noEmit
npm run build                            # full Next.js production build
firebase emulators:exec --only firestore,storage "npx vitest run rules"   # security rules
```

The rules tests assert a non-purchaser cannot forge a `purchases` doc, cannot read another
user's purchase, cannot publish a post owned by someone else, and cannot read a gated asset.

## Deploy (Vercel)

1. Import the repo into Vercel; set the env vars from `.env.example` (production Firebase web
   config, `FIREBASE_ADMIN_*`, Stripe live keys, `NEXT_PUBLIC_BASE_URL`).
2. Deploy `firestore.rules` / `storage.rules` with the Firebase CLI:
   `firebase deploy --only firestore:rules,storage`.
3. In the Stripe dashboard, add a webhook endpoint pointing at
   `https://<your-domain>/api/stripe/webhook` and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.

## Open items (intentional defaults)

- **Payouts:** single platform Stripe account for now (matches the original). Stripe Connect
  for seller payouts is a later addition.
- **Pricing:** fixed $35 / $200 tiers for parity, centralized in `lib/licenses.ts` so moving
  to seller-set prices is a one-file change.
