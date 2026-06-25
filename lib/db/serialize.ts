// Converts raw Firestore document data into plain, client-safe domain objects.
// Crucially this turns Firestore Timestamps into epoch-millisecond numbers so
// the objects can be passed from Server Components to Client Components.
//
// Works with both the client and admin SDKs (both Timestamp implementations
// expose toMillis()).

import type {
  Comment,
  Feed,
  Follow,
  Post,
  PostFile,
  Purchase,
  Review,
  UserProfile,
} from "@/types";
import type { LicenseKey } from "@/lib/licenses";

type AnyData = Record<string, unknown>;

interface TimestampLike {
  toMillis: () => number;
}

function isTimestampLike(v: unknown): v is TimestampLike {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { toMillis?: unknown }).toMillis === "function"
  );
}

export function toMs(v: unknown): number {
  if (typeof v === "number") return v;
  if (isTimestampLike(v)) return v.toMillis();
  return 0;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}
function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function serializeUser(id: string, d: AnyData): UserProfile {
  return {
    uid: id,
    email: str(d.email),
    displayName: str(d.displayName),
    photoURL: str(d.photoURL),
    backgroundImageURL: str(d.backgroundImageURL),
    about: str(d.about),
    interests: strArr(d.interests),
    feedId: str(d.feedId, id),
    createdAt: toMs(d.createdAt),
  };
}

export function serializeFeed(id: string, d: AnyData): Feed {
  return {
    id,
    ownerUid: str(d.ownerUid, id),
    feedName: str(d.feedName),
    feedCategory: str(d.feedCategory),
    about: str(d.about),
    profileImageURL: str(d.profileImageURL),
    backgroundImageURL: str(d.backgroundImageURL),
    postCategories: strArr(d.postCategories),
    likes: num(d.likes),
    ratingAvg: num(d.ratingAvg),
    ratingCount: num(d.ratingCount),
    createdAt: toMs(d.createdAt),
    updatedAt: toMs(d.updatedAt),
  };
}

function serializeFile(v: unknown): PostFile | null {
  if (typeof v !== "object" || v === null) return null;
  const f = v as AnyData;
  if (!f.storagePath) return null;
  return {
    name: str(f.name),
    storagePath: str(f.storagePath),
    size: num(f.size),
    contentType: str(f.contentType),
  };
}

export function serializePost(id: string, d: AnyData): Post {
  const ownerRaw = (d.owner as AnyData) ?? {};
  const csvRows = Array.isArray(d.csvPreview)
    ? (d.csvPreview as unknown[]).map((row) => strArr(row))
    : [];
  return {
    id,
    owner: {
      uid: str(ownerRaw.uid),
      feedId: str(ownerRaw.feedId),
      feedName: str(ownerRaw.feedName),
      photoURL: str(ownerRaw.photoURL),
    },
    title: str(d.title),
    detail: str(d.detail),
    priority: bool(d.priority),
    license: (str(d.license, "CC_BY") as LicenseKey),
    category: str(d.category),
    types: strArr(d.types),
    coverImage: str(d.coverImage),
    images: strArr(d.images),
    pdfFiles: Array.isArray(d.pdfFiles)
      ? (d.pdfFiles as unknown[])
          .map(serializeFile)
          .filter((f): f is PostFile => f !== null)
      : [],
    pdfLink: str(d.pdfLink),
    csvFile: serializeFile(d.csvFile),
    csvPreview: csvRows,
    csvRowCount: num(d.csvRowCount),
    gsheetLink: str(d.gsheetLink),
    mainUrl: str(d.mainUrl),
    embed:
      typeof d.embed === "object" && d.embed !== null
        ? {
            url: str((d.embed as AnyData).url),
            title: str((d.embed as AnyData).title),
            description: str((d.embed as AnyData).description),
            imageUrl: str((d.embed as AnyData).imageUrl),
            faviconUrl: str((d.embed as AnyData).faviconUrl),
            siteName: str((d.embed as AnyData).siteName),
          }
        : null,
    createdAt: toMs(d.createdAt),
    updatedAt: toMs(d.updatedAt),
  };
}

export function serializePurchase(id: string, d: AnyData): Purchase {
  return {
    id,
    buyerUid: str(d.buyerUid),
    postId: str(d.postId),
    sellerUid: str(d.sellerUid),
    license: str(d.license, "CC_BY") as LicenseKey,
    amountUsd: num(d.amountUsd),
    stripeSessionId: str(d.stripeSessionId),
    createdAt: toMs(d.createdAt),
  };
}

export function serializeReview(id: string, d: AnyData): Review {
  return {
    id,
    sellerUid: str(d.sellerUid),
    authorUid: str(d.authorUid),
    authorName: str(d.authorName),
    authorPhoto: str(d.authorPhoto),
    rating: num(d.rating),
    text: str(d.text),
    createdAt: toMs(d.createdAt),
  };
}

export function serializeComment(id: string, d: AnyData): Comment {
  return {
    id,
    postId: str(d.postId),
    authorUid: str(d.authorUid),
    authorName: str(d.authorName),
    authorPhoto: str(d.authorPhoto),
    text: str(d.text),
    createdAt: toMs(d.createdAt),
  };
}

export function serializeFollow(id: string, d: AnyData): Follow {
  return {
    id,
    followerUid: str(d.followerUid),
    followingUid: str(d.followingUid),
    createdAt: toMs(d.createdAt),
  };
}
