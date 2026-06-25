# SuperWire

A marketplace for **user-created wire services**: anyone can publish content
(articles, datasets, images, documents) and sell it for republication with clear
legal rights, fast payments, and ratings that surface reliable sources.

This is a ground-up rewrite of the original 2016–2017 Angular 2 / AngularFire app
(preserved under [`legacy/`](./legacy) for reference) on a modern stack.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** — Auth, Firestore, Storage (client SDK in the browser, Admin SDK on the server)
- **Stripe** — Checkout + webhooks for paid licenses
- **Tiptap** rich-text editor · **PapaParse** CSV parsing · **react-image-crop** cover cropping
- Deploys to **Vercel**; Firebase security rules deploy via the Firebase CLI

## Core concepts

- **Feed** — every user owns one feed (`feeds/{uid}`), their personal wire service.
- **Post** — multi-attachment content: rich-text body, cover + inline images, multiple
  gated PDFs, a gated CSV dataset (with an inline preview table), an external link preview,
  a "breaking" flag, content types, category, and a **license**.
- **Licenses** (`lib/licenses.ts`) — `CC-BY` (free), `CC-BY-ND` (free),
  `Selling / Attribution` ($35), `Selling / Exclusive` ($200).
- **Purchases** unlock gated downloads; written only by the Stripe webhook (Admin SDK).
- **Trust** — reviews/ratings per seller, comments per post, and a follow graph with a
  "following" timeline.

## Project layout

```
app/                 # routes (App Router) + API route handlers
components/          # UI + client components (editor, cards, forms, …)
lib/firebase/        # client SDK, Admin SDK, auth context
lib/db/              # data access: server.ts (Admin reads), client.ts (client mutations)
lib/                 # licenses, constants, formatting, stripe, server-auth
types/               # shared domain types
firestore.rules · storage.rules · firestore.indexes.json
legacy/             # original Angular app (reference only; not built)
```

## Local development

1. **Install**
   ```bash
   npm install
   ```

2. **Configure env** — copy `.env.example` to `.env.local` and fill in your Firebase
   web config, a Firebase **service account** JSON (for the Admin SDK), and Stripe
   **test** keys.

3. **Run with the Firebase emulator suite** (recommended)
   ```bash
   # terminal 1
   npm run emulators        # Auth :9099, Firestore :8080, Storage :9199
   # set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local
   # terminal 2
   npm run dev              # http://localhost:3000
   ```

4. **Stripe webhook (local)**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # copy the printed signing secret into STRIPE_WEBHOOK_SECRET
   ```

## End-to-end smoke test

Register → (verify email) → onboarding wizard creates your feed → publish a paid post
with a CSV → as a second user, **Buy** with Stripe test card `4242 4242 4242 4242` →
the webhook writes the purchase → the download unlocks → leave a review → follow the seller
and see their posts under **Following**.

## Deploy

- **App → Vercel.** Import the repo, set all env vars from `.env.example` (use Stripe
  **live** keys and your prod Firebase config). After deploy, add a Stripe webhook
  endpoint pointing at `https://<your-domain>/api/stripe/webhook` and set
  `STRIPE_WEBHOOK_SECRET`.
- **Rules & indexes → Firebase.**
  ```bash
  firebase deploy --only firestore:rules,firestore:indexes,storage
  ```
  (Set your project id in `.firebaserc`.)

## Security notes

- Paid assets live under `posts/{uid}/assets/**` in Storage and are **never** client-readable
  — they are served only through the purchase-gated `/api/download/[postId]` route, which
  returns a short-lived signed URL after verifying entitlement.
- Post prices are derived server-side from the license in `/api/stripe/checkout`; the client
  is never trusted for amounts.
- `purchases` and `reviews` are written only by server routes (Admin SDK); rules block direct
  client writes.
