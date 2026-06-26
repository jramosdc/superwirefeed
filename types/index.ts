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
  "AI & Compute",
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
