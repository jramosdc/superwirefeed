// Client-side data access via the Firebase client SDK (subject to security
// rules). Used inside Client Components for mutations and live subscriptions.
"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  type UploadMetadata,
} from "firebase/storage";
import type { User as FirebaseUser } from "firebase/auth";
import { db, storage } from "@/lib/firebase/client";
import { serializeComment, serializeFeed, serializePost } from "./serialize";
import type { Comment, Feed, Post, PostFile } from "@/types";

// ---- Onboarding: create the user profile + their feed ----

export interface OnboardingInput {
  feedName: string;
  feedCategory: string;
  about: string;
  interests: string[];
}

export async function createUserAndFeed(
  user: FirebaseUser,
  input: OnboardingInput,
): Promise<void> {
  const uid = user.uid;
  const displayName = user.displayName || input.feedName || user.email || "";
  const photoURL = user.photoURL || "";

  await setDoc(doc(db, "users", uid), {
    email: user.email || "",
    displayName,
    photoURL,
    backgroundImageURL: "",
    about: input.about,
    interests: input.interests,
    feedId: uid,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "feeds", uid), {
    ownerUid: uid,
    feedName: input.feedName,
    feedCategory: input.feedCategory,
    about: input.about,
    profileImageURL: photoURL,
    backgroundImageURL: "",
    postCategories: [],
    likes: 0,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<{
    displayName: string;
    photoURL: string;
    backgroundImageURL: string;
    about: string;
    interests: string[];
  }>,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), data);
}

export async function updateFeed(
  feedId: string,
  data: Partial<{
    feedName: string;
    feedCategory: string;
    about: string;
    profileImageURL: string;
    backgroundImageURL: string;
    postCategories: string[];
  }>,
): Promise<void> {
  await updateDoc(doc(db, "feeds", feedId), { ...data, updatedAt: serverTimestamp() });
}

// ---- Posts ----

export interface PostInput {
  title: string;
  detail: string;
  priority: boolean;
  license: string;
  category: string;
  types: string[];
  coverImage: string;
  images: string[];
  pdfFiles: PostFile[];
  pdfLink: string;
  csvFile: PostFile | null;
  csvPreview: string[][];
  csvRowCount: number;
  gsheetLink: string;
  mainUrl: string;
  embed: Post["embed"];
  owner: Post["owner"];
}

export async function createPost(input: PostInput): Promise<string> {
  const postRef = doc(collection(db, "posts"));
  await setDoc(postRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Bump the feed so it sorts to the top of "latest feeds".
  await updateDoc(doc(db, "feeds", input.owner.feedId), {
    updatedAt: serverTimestamp(),
  }).catch(() => {});
  return postRef.id;
}

export async function updatePost(
  postId: string,
  input: Partial<PostInput>,
): Promise<void> {
  await updateDoc(doc(db, "posts", postId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, "posts", postId));
}

export async function getPostOnce(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? serializePost(snap.id, snap.data()) : null;
}

export async function getFeedOnce(
  feedId: string,
): Promise<{ feedName: string; profileImageURL: string } | null> {
  const snap = await getDoc(doc(db, "feeds", feedId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    feedName: typeof d.feedName === "string" ? d.feedName : "",
    profileImageURL:
      typeof d.profileImageURL === "string" ? d.profileImageURL : "",
  };
}

export async function getFeedClient(feedId: string): Promise<Feed | null> {
  const snap = await getDoc(doc(db, "feeds", feedId));
  return snap.exists() ? serializeFeed(snap.id, snap.data()) : null;
}

// ---- Comments ----

export async function addComment(input: {
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  text: string;
}): Promise<void> {
  const ref = doc(collection(db, "comments"));
  await setDoc(ref, { ...input, createdAt: serverTimestamp() });
}

export function subscribeToComments(
  postId: string,
  cb: (comments: Comment[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => serializeComment(d.id, d.data())));
  });
}

// ---- Follows ----

export async function isFollowing(
  followerUid: string,
  followingUid: string,
): Promise<boolean> {
  const snap = await getDoc(
    doc(db, "follows", `${followerUid}_${followingUid}`),
  );
  return snap.exists();
}

export async function toggleFollow(
  followerUid: string,
  followingUid: string,
): Promise<boolean> {
  const id = `${followerUid}_${followingUid}`;
  const ref = doc(db, "follows", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, {
    followerUid,
    followingUid,
    createdAt: serverTimestamp(),
  });
  return true;
}

/** Posts authored by everyone the user follows, newest first. */
export async function getFollowingTimeline(uid: string): Promise<Post[]> {
  const followSnap = await getDocs(
    query(collection(db, "follows"), where("followerUid", "==", uid)),
  );
  const followingUids = followSnap.docs
    .map((d) => d.data().followingUid)
    .filter((v): v is string => typeof v === "string");
  if (followingUids.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < followingUids.length; i += 30) {
    chunks.push(followingUids.slice(i, i + 30));
  }
  const results = await Promise.all(
    chunks.map((chunk) =>
      getDocs(query(collection(db, "posts"), where("owner.uid", "in", chunk))),
    ),
  );
  return results
    .flatMap((snap) => snap.docs)
    .map((d) => serializePost(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFollowCounts(
  uid: string,
): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    getDocs(query(collection(db, "follows"), where("followingUid", "==", uid))),
    getDocs(query(collection(db, "follows"), where("followerUid", "==", uid))),
  ]);
  return { followers: followers.size, following: following.size };
}

// ---- Purchases ----

export async function hasPurchasedClient(
  buyerUid: string,
  postId: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, "purchases", `${buyerUid}_${postId}`));
  return snap.exists();
}

// ---- Storage uploads ----

/** Upload a public presentational image; returns its download URL. */
export async function uploadPublicImage(
  uid: string,
  file: Blob,
  kind: "avatar" | "banner" | "cover" | "inline",
): Promise<string> {
  const ext = file.type.split("/")[1] || "png";
  const path = `public/${uid}/${kind}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  const metadata: UploadMetadata = { contentType: file.type || "image/png" };
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

/**
 * Upload a gated downloadable asset (CSV/PDF). Returns the storage path only —
 * never a public URL, since these are served through the purchase-gated route.
 */
export async function uploadGatedAsset(
  uid: string,
  postLocalId: string,
  file: File,
): Promise<PostFile> {
  const path = `posts/${uid}/assets/${postLocalId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return {
    name: file.name,
    storagePath: path,
    size: file.size,
    contentType: file.type,
  };
}
