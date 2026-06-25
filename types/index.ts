// Shared domain types for SuperWire. These describe the fresh Firestore schema
// (single `uid` identity; each user owns exactly one feed keyed by their uid).

export type LicenseKey =
  | "CC_BY"
  | "CC_BY_ND"
  | "SELL_ATTRIBUTION"
  | "SELL_EXCLUSIVE";

export const CATEGORIES = [
  "News",
  "Communications",
  "Research",
  "Data",
  "Visualizations",
  "Design",
  "Misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

// "All" is a filter sentinel only — never persisted on a post.
export type CategoryFilter = Category | "All";

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  profileImageURL: string;
  backgroundImageURL: string;
  useBackgroundImage: boolean;
  createdAt: number;
}

export interface FeedDoc {
  // Doc id === ownerUid. One feed per user.
  ownerUid: string;
  name: string;
  likes: number;
  postCategories: string[];
  coverImageURL: string;
  updatedAt: number;
}

export interface EmbedPreview {
  url: string;
  title: string;
  description: string;
  imageURL: string;
  faviconURL: string;
}

export interface PostDoc {
  id: string;
  ownerUid: string;
  feedId: string; // === ownerUid
  title: string;
  detailHtml: string;
  license: LicenseKey;
  category: Category;
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
  createdAt: number;
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
