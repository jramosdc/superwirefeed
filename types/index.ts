// Shared domain types for SuperWire.
// Timestamps are stored as Firestore Timestamps but surfaced to the client as
// millisecond epoch numbers (see lib/db serializers) so they cross the
// server/client boundary cleanly.

import type { LicenseKey } from "@/lib/licenses";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  /** Profile avatar (Storage URL). */
  photoURL: string;
  /** Banner used on the profile/feed page. */
  backgroundImageURL: string;
  about: string;
  interests: string[];
  /** Every user owns exactly one feed; feedId === uid. */
  feedId: string;
  createdAt: number;
}

export interface Feed {
  id: string; // === owner uid
  ownerUid: string;
  feedName: string;
  feedCategory: string;
  about: string;
  profileImageURL: string;
  backgroundImageURL: string;
  /** Categories this seller publishes under. */
  postCategories: string[];
  likes: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: number;
  /** Bumped whenever the owner publishes; drives "latest feeds" sort. */
  updatedAt: number;
}

/** A downloadable file attached to a post and gated behind purchase. */
export interface PostFile {
  name: string;
  /** Storage object path (never a public URL for paid assets). */
  storagePath: string;
  size: number;
  contentType: string;
}

/** Parsed/extracted preview of an external link (replaces Embedly). */
export interface LinkEmbed {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  faviconUrl: string;
  siteName: string;
}

export interface PostOwner {
  uid: string;
  feedId: string;
  feedName: string;
  photoURL: string;
}

export interface Post {
  id: string;
  owner: PostOwner;
  title: string;
  /** Rich-text HTML body. */
  detail: string;
  /** "Breaking" flag. */
  priority: boolean;
  license: LicenseKey;
  category: string;
  /** Content types (e.g. Article, Photo, Dataset); at least one required. */
  types: string[];

  /** Public cover image URL. */
  coverImage: string;
  /** Public inline image URLs. */
  images: string[];

  /** Gated downloadable PDFs. */
  pdfFiles: PostFile[];
  pdfLink: string;

  /** Gated CSV/dataset file. */
  csvFile: PostFile | null;
  /** First rows of the CSV, stored inline for a public table preview. */
  csvPreview: string[][];
  /** Total row count of the dataset (so previews can say "+N more"). */
  csvRowCount: number;
  gsheetLink: string;

  mainUrl: string;
  embed: LinkEmbed | null;

  createdAt: number;
  updatedAt: number;
}

export interface Purchase {
  id: string; // `${buyerUid}_${postId}`
  buyerUid: string;
  postId: string;
  sellerUid: string;
  license: LicenseKey;
  amountUsd: number;
  stripeSessionId: string;
  createdAt: number;
}

export interface Review {
  id: string;
  /** Seller/feed being reviewed (=== feedId). */
  sellerUid: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  rating: number; // 1..5
  text: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  createdAt: number;
}

export interface Follow {
  id: string; // `${followerUid}_${followingUid}`
  followerUid: string;
  followingUid: string;
  createdAt: number;
}
