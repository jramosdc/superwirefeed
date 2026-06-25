// Server-side data access via the Admin SDK. Used by Server Components and
// route handlers. All reads return serialized (client-safe) domain objects.
import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import {
  serializeComment,
  serializeFeed,
  serializeFollow,
  serializePost,
  serializeReview,
  serializeUser,
} from "./serialize";
import type { Comment, Feed, Post, Review, UserProfile } from "@/types";

const FEEDS = "feeds";
const POSTS = "posts";
const USERS = "users";
const REVIEWS = "reviews";
const COMMENTS = "comments";
const FOLLOWS = "follows";
const PURCHASES = "purchases";

export async function getFeeds(): Promise<Feed[]> {
  const snap = await adminDb
    .collection(FEEDS)
    .orderBy("updatedAt", "desc")
    .limit(100)
    .get();
  return snap.docs.map((d) => serializeFeed(d.id, d.data()));
}

export async function getFeed(feedId: string): Promise<Feed | null> {
  const snap = await adminDb.collection(FEEDS).doc(feedId).get();
  return snap.exists ? serializeFeed(snap.id, snap.data()!) : null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await adminDb.collection(USERS).doc(uid).get();
  return snap.exists ? serializeUser(snap.id, snap.data()!) : null;
}

export async function getPost(postId: string): Promise<Post | null> {
  const snap = await adminDb.collection(POSTS).doc(postId).get();
  return snap.exists ? serializePost(snap.id, snap.data()!) : null;
}

export async function getPostsByFeed(feedId: string): Promise<Post[]> {
  const snap = await adminDb
    .collection(POSTS)
    .where("owner.feedId", "==", feedId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => serializePost(d.id, d.data()));
}

export async function getRecentPosts(max = 30): Promise<Post[]> {
  const snap = await adminDb
    .collection(POSTS)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => serializePost(d.id, d.data()));
}

/** Posts authored by any of the given owners (for the following timeline). */
export async function getPostsByOwners(uids: string[]): Promise<Post[]> {
  if (uids.length === 0) return [];
  // Firestore "in" supports up to 30 values; chunk to be safe.
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));
  const results = await Promise.all(
    chunks.map((chunk) =>
      adminDb.collection(POSTS).where("owner.uid", "in", chunk).get(),
    ),
  );
  const posts = results
    .flatMap((snap) => snap.docs)
    .map((d) => serializePost(d.id, d.data()));
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReviewsForSeller(sellerUid: string): Promise<Review[]> {
  const snap = await adminDb
    .collection(REVIEWS)
    .where("sellerUid", "==", sellerUid)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => serializeReview(d.id, d.data()));
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const snap = await adminDb
    .collection(COMMENTS)
    .where("postId", "==", postId)
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => serializeComment(d.id, d.data()));
}

export async function getFollowing(uid: string): Promise<string[]> {
  const snap = await adminDb
    .collection(FOLLOWS)
    .where("followerUid", "==", uid)
    .get();
  return snap.docs.map((d) => serializeFollow(d.id, d.data()).followingUid);
}

export async function getFollowers(uid: string): Promise<string[]> {
  const snap = await adminDb
    .collection(FOLLOWS)
    .where("followingUid", "==", uid)
    .get();
  return snap.docs.map((d) => serializeFollow(d.id, d.data()).followerUid);
}

export async function hasPurchased(
  buyerUid: string,
  postId: string,
): Promise<boolean> {
  const snap = await adminDb
    .collection(PURCHASES)
    .doc(`${buyerUid}_${postId}`)
    .get();
  return snap.exists;
}

export async function getProfiles(uids: string[]): Promise<UserProfile[]> {
  if (uids.length === 0) return [];
  const refs = uids.map((uid) => adminDb.collection(USERS).doc(uid));
  const snaps = await adminDb.getAll(...refs);
  return snaps
    .filter((s) => s.exists)
    .map((s) => serializeUser(s.id, s.data()!));
}
