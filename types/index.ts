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

// postStats/{postId} — usage counters, server-maintained (drives "Most used" /
// Trending). Server-written only.
export interface PostStatsDoc {
  views: number;
  purchases: number;
  downloads: number;
  updatedAt: number;
}

// --- Human certification & AI flagging (server-written) ---

// "authored" = made entirely by a human; "verified" = a human reviewed and
// vouches for the content's accuracy/validity.
export type CertificationKind = "authored" | "verified";

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
  verifiedCount: number;
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
