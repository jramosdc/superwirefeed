import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { touchFeed } from "./feeds";
import { isGated } from "@/lib/licenses";
import type { PostDoc } from "@/types";

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

// Firestore forbids directly-nested arrays, so the CSV preview (string[][]) is
// stored as a JSON string and decoded on read.
function parseCsvPreview(v: unknown): string[][] | null {
  if (typeof v === "string") {
    try {
      const arr = JSON.parse(v);
      return Array.isArray(arr) ? (arr as string[][]) : null;
    } catch {
      return null;
    }
  }
  if (Array.isArray(v)) return v as string[][]; // tolerate legacy/raw values
  return null;
}

function toPost(id: string, data: Record<string, unknown>): PostDoc {
  return {
    id,
    ownerUid: (data.ownerUid as string) ?? "",
    feedId: (data.feedId as string) ?? "",
    title: (data.title as string) ?? "",
    detailHtml: (data.detailHtml as string) ?? "",
    license: (data.license as PostDoc["license"]) ?? "CC_BY",
    category: (data.category as PostDoc["category"]) ?? "Breaking News",
    format: (data.format as PostDoc["format"]) ?? "Article",
    types: (data.types as string[]) ?? [],
    breaking: Boolean(data.breaking),
    coverImage: (data.coverImage as string) ?? "",
    mainUrl: (data.mainUrl as string) ?? "",
    embed: (data.embed as PostDoc["embed"]) ?? null,
    imageURLs: (data.imageURLs as string[]) ?? [],
    assetPath: (data.assetPath as string) ?? null,
    assetName: (data.assetName as string) ?? null,
    csvPreview: parseCsvPreview(data.csvPreview),
    sources: (data.sources as PostDoc["sources"]) ?? [],
    derivedFrom: (data.derivedFrom as string[]) ?? [],
    createdAt: tsToMillis(data.createdAt),
    updatedAt: tsToMillis(data.updatedAt),
  };
}

// Fields a client is allowed to author. assetPath/csvPreview are written here
// too, but the gated file itself is never exposed for reading (storage rules).
export type PostInput = Omit<
  PostDoc,
  "id" | "createdAt" | "updatedAt" | "ownerUid" | "feedId"
>;

export async function createPost(
  uid: string,
  input: PostInput,
): Promise<string> {
  const ref = doc(collection(db, "posts"));
  await setDoc(ref, {
    ...prepareForWrite(input),
    ownerUid: uid,
    feedId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await touchFeed(uid);
  return ref.id;
}

export async function updatePost(
  postId: string,
  input: Partial<PostInput>,
): Promise<void> {
  await updateDoc(doc(db, "posts", postId), {
    ...prepareForWrite(input),
    updatedAt: serverTimestamp(),
  });
}

// For paid posts we keep a small preview only; never store the full table for a
// gated post (a buyer downloads the real file via the gated route).
function stripGatedPreview<T extends Partial<PostInput>>(input: T): T {
  if (input.license && isGated(input.license) && input.csvPreview) {
    return { ...input, csvPreview: input.csvPreview.slice(0, 50) };
  }
  return input;
}

// Encode for Firestore: csvPreview (string[][]) -> JSON string (nested arrays
// aren't allowed as raw Firestore values).
function prepareForWrite(input: Partial<PostInput>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...stripGatedPreview(input) };
  if ("csvPreview" in out) {
    out.csvPreview = out.csvPreview
      ? JSON.stringify(out.csvPreview)
      : null;
  }
  return out;
}

export async function getPost(postId: string): Promise<PostDoc | null> {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? toPost(snap.id, snap.data()) : null;
}

export async function listPostsByFeed(feedId: string): Promise<PostDoc[]> {
  const q = query(
    collection(db, "posts"),
    where("feedId", "==", feedId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

export async function listAllPosts(): Promise<PostDoc[]> {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

// Posts that build on (cite) the given post — the reverse derivation edge.
export async function listPostsBuiltOn(postId: string): Promise<PostDoc[]> {
  const q = query(
    collection(db, "posts"),
    where("derivedFrom", "array-contains", postId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, "posts", postId));
}
