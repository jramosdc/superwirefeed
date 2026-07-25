// Shared domain types for SuperWire. These describe the fresh Firestore schema
// (single `uid` identity; each user owns exactly one feed keyed by their uid).

export type LicenseKey =
  | "CC_BY"
  | "CC_BY_ND"
  | "SELL_ATTRIBUTION"
  | "SELL_EXCLUSIVE";

// Information-market categories. Beyond journalism: the tradeable commodity here
// is data, signals and foresight. Spans timely news → raw data/sensor feeds →
// AI artifacts → predictions → frontier science, with provenance/trust central.
export const CATEGORIES = [
  "Markets & Signals",
  "Science & Research",
  "Datasets & Sensors",
  "Geospatial & Satellite",
  "AI & Prompts",
  "Forecasts & Predictions",
  "Intelligence & OSINT",
  "Health & Biotech",
  "Climate & Environment",
  "Space & Frontier",
  "Culture & Society",
] as const;

export type Category = (typeof CATEGORIES)[number];

// "All" is a filter sentinel only — never persisted on a post.
export type CategoryFilter = Category | "All";

// Sellable formats — the kind of deliverable a buyer receives.
export const FORMATS = [
  "Article",
  "Investigation",
  "Dataset",
  "Document",
  "Photo set",
  "Video",
  "Audio",
] as const;

export type PostFormat = (typeof FORMATS)[number];

// "All" is a filter sentinel only.
export type FormatFilter = PostFormat | "All";

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  profileImageURL: string;
  backgroundImageURL: string;
  useBackgroundImage: boolean;
  // Onboarding wizard fields (interests/about + completion flag).
  interests: string[];
  about: string;
  onboarded: boolean;
  // Referral attribution: uid of the sharer whose ?ref link brought this user
  // here. Stamped once at signup — first ref wins, never overwritten.
  referredBy?: string;
  createdAt: number;
}

export interface FeedDoc {
  // Doc id === ownerUid. One feed per user.
  ownerUid: string;
  name: string;
  category: string;
  about: string;
  likes: number;
  postCategories: string[];
  coverImageURL: string;
  // Denormalized seller rating, kept consistent server-side by /api/reviews.
  ratingAvg: number;
  ratingCount: number;
  // Recurring subscription to this feed. When enabled, a subscriber unlocks ALL
  // gated posts in the feed; per-item purchases still coexist and free CC posts
  // stay open to everyone. Price is monthly, in cents (0 when disabled).
  subscriptionEnabled: boolean;
  subscriptionPriceCents: number;
  updatedAt: number;
}

export interface EmbedPreview {
  url: string;
  title: string;
  description: string;
  imageURL: string;
  faviconURL: string;
}

// A structured provenance entry — where a post's information came from.
export interface SourceRef {
  url: string;
  label: string;
  kind: "primary" | "data" | "reporting" | "other";
}

export interface PostDoc {
  id: string;
  ownerUid: string;
  feedId: string; // === ownerUid
  title: string;
  detailHtml: string;
  license: LicenseKey;
  category: Category;
  // Sellable deliverable format (Article, Dataset, Photo set, …).
  format: PostFormat;
  types: string[];
  breaking: boolean;
  coverImage: string;
  mainUrl: string;
  embed: EmbedPreview | null;
  imageURLs: string[];
  // Storage path of the gated downloadable asset (CSV/PDF). Never returned to
  // the client directly — only served via the purchase-gated download route.
  assetPath: string | null;
  assetName: string | null;
  // First N rows of the parsed CSV, shown free for CC licenses / after purchase.
  csvPreview: string[][] | null;
  // Creator-controlled preview shown to non-buyers of gated posts.
  previewText: string;
  // How many CSV rows non-buyers may see before purchase (0 = none).
  freePreviewRows: number;
  // Provenance (author-stated, public/auditable claims).
  sources: SourceRef[];
  // Derivation-graph edges: postIds this post builds on.
  derivedFrom: string[];
  // Provenance: the bounty/request this post was created for ("" = none).
  requestId: string;
  createdAt: number;
  updatedAt: number;
}

// --- Gatekeeper-less accuracy trust (server-written collections) ---

export type AttestationVerdict = "corroborate" | "dispute";

// attestations/{attesterUid}_{postId} — one per member per post.
export interface AttestationDoc {
  id: string; // `${attesterUid}_${postId}`
  attesterUid: string;
  attesterName: string;
  postId: string;
  sellerUid: string;
  verdict: AttestationVerdict;
  evidenceUrl: string;
  // Weight at write time: higher for verified buyers (economic skin-in-the-game).
  weight: number;
  verifiedBuyer: boolean;
  createdAt: number;
}

// postAccuracy/{postId} — denormalized accuracy aggregate, server-maintained.
export interface PostAccuracyDoc {
  corroborations: number;
  disputes: number;
  corrWeight: number;
  dispWeight: number;
  // corrWeight / (corrWeight + dispWeight), 0..1.
  score: number;
  updatedAt: number;
}

// trust/{uid} — member trust signal, server-maintained.
export interface TrustDoc {
  score: number;
  updatedAt: number;
}

// --- Requests / bounties (demand side) ---

export type RequestStatus = "open" | "fulfilled" | "closed";

// requests/{requestId} — a buyer asks for content/data, optionally with a bounty.
export interface RequestDoc {
  id: string;
  requesterUid: string;
  requesterName: string;
  title: string;
  description: string;
  category: string; // a Category or "Any"
  format: string; // a PostFormat or "Any"
  bountyUsd: number; // 0 = no stated bounty
  status: RequestStatus;
  fulfilledByPostId: string;
  fulfilledByUid: string;
  // All accepted responses — the requester may pick MORE THAN ONE winner.
  // fulfilledByPostId/-Uid stay as the first accepted pair for back-compat.
  acceptedPostIds: string[];
  acceptedUids: string[];
  // Optional deadline (millis). Past it, an unfulfilled request is treated as
  // closed — no new responses. undefined = no deadline. Stored in Firestore as
  // a Timestamp so the iOS client reads it too.
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

// requestResponses/{id} — a seller offers one of their posts to fulfill a request.
export interface RequestResponseDoc {
  id: string;
  requestId: string;
  responderUid: string;
  responderName: string;
  postId: string;
  postTitle: string;
  note: string;
  // Referral attribution: the sharer whose ?ref link brought this responder to
  // the bounty ("" = arrived organically). Read by the Stripe webhook to grant
  // share-converted waiver credits when the bounty ends in a purchase.
  refUid?: string;
  createdAt: number;
}

// --- Growth & monetization (Phase 4) ---

// shares/{autoId} — a share event, create-only for clients (never readable).
// Same shape the iOS client writes (FirestoreService.recordShare).
export interface ShareDoc {
  sharerUid: string;
  requestId: string; // "" when the share was of a post, not a bounty
  postId?: string;
  platform: "web" | "ios";
  createdAt: number;
}

export type WaiverCreditSource = "created-and-shared" | "share-converted";

// waiverCredits/{id} — a fee-waiver credit: the platform fee on the holder's
// next sale is $0. Server-written only; a user may read their own.
export interface WaiverCreditDoc {
  id: string;
  uid: string;
  source: WaiverCreditSource;
  requestId: string; // the bounty it came from ("" if none)
  // Transaction that spent this credit; null = still available.
  consumedByTransactionId: string | null;
  // Bounty/sale title, denormalized for display (iOS Rewards shows this).
  label: string;
  createdAt: number;
}

// transactions/{stripeSessionId} — the money ledger, written ONLY by the Stripe
// webhook. Source of truth for what sellers are owed (payouts are manual until
// volume justifies automation — HANDOFF 4.6). Doc id === the Stripe session id
// so webhook retries can never double-write.
export interface TransactionDoc {
  id: string;
  postId: string;
  sellerUid: string;
  buyerUid: string;
  grossCents: number; // post price (excludes the buyer service fee)
  serviceFeeCents: number; // buyer-side fee, kept by the platform
  feeCents: number; // seller-side platform fee (0 when a credit was consumed)
  waiverCreditId: string | null;
  netCents: number; // grossCents - feeCents — what the seller is owed
  stripeSessionId: string;
  createdAt: number;
}

// payouts/{autoId} — money actually sent to a seller, written by the owner via
// the Admin SDK. Balance owed = sum(net) - sum(payouts).
export interface PayoutDoc {
  id: string;
  uid: string;
  amountCents: number;
  method: string; // "paypal" | "wise" | "bank" | ...
  reference: string;
  createdAt: number;
}

// postStats/{postId} — usage counters, server-maintained (drives "Most used" /
// Trending). Server-written only.
export interface PostStatsDoc {
  views: number;
  purchases: number;
  downloads: number;
  updatedAt: number;
}

// --- Human certification & AI flagging (server-written) ---

// "authored" = content created by a person (journalist, writer, artist,
// photographer). "curated" = a human reviewed the data, even if the source
// isn't human-created.
export type CertificationKind = "authored" | "curated";

// certifications/{certifierUid}_{postId} — one per certifier per post. Issued
// only by trusted third parties (never the creator).
export interface CertificationDoc {
  id: string; // `${certifierUid}_${postId}`
  postId: string;
  ownerUid: string;
  certifierUid: string;
  certifierName: string;
  kind: CertificationKind;
  note: string;
  createdAt: number;
}

// postCertification/{postId} — denormalized summary, server-maintained.
export interface PostCertificationDoc {
  authoredCount: number;
  curatedCount: number;
  // Set by a moderator or the SuperWire audit. Blocks the "authored" claim.
  aiFlagged: boolean;
  aiFlagReason: string;
  aiFlaggedBy: string;
  updatedAt: number;
}

export interface PurchaseDoc {
  // Doc id === `${uid}_${postId}`.
  uid: string;
  postId: string;
  amount: number; // cents
  stripeSessionId: string;
  createdAt: number;
}

// subscriptions/{subscriberUid}_{creatorUid} — a buyer's recurring subscription
// to a creator's feed. WRITTEN only by the Stripe webhook (Admin SDK); the
// client reads its own to decide whether a feed's gated posts are unlocked.
export interface SubscriptionDoc {
  // Doc id === `${subscriberUid}_${creatorUid}`.
  subscriberUid: string;
  creatorUid: string; // === feedId
  status: "active" | "canceled";
  priceCents: number; // monthly
  stripeSessionId: string;
  stripeSubscriptionId: string;
  createdAt: number;
}

export interface ReviewDoc {
  id: string;
  sellerUid: string;
  authorUid: string;
  authorName: string;
  rating: number; // 1..5
  text: string;
  createdAt: number;
}

export interface CommentDoc {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
}
