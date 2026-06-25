import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Mirrors the old multipath follow system (authService.toggleFollowSystem):
//   users/{me}/following/{target}  +  users/{target}/followers/{me}
// written/removed together as a batch.

export async function isFollowing(me: string, target: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", me, "following", target));
  return snap.exists();
}

export async function toggleFollow(me: string, target: string): Promise<boolean> {
  if (me === target) return false;
  const followingRef = doc(db, "users", me, "following", target);
  const followerRef = doc(db, "users", target, "followers", me);
  const exists = (await getDoc(followingRef)).exists();

  if (exists) {
    const batch = writeBatch(db);
    batch.delete(followingRef);
    batch.delete(followerRef);
    await batch.commit();
    return false;
  }

  const batch = writeBatch(db);
  batch.set(followingRef, { uid: target, createdAt: serverTimestamp() });
  batch.set(followerRef, { uid: me, createdAt: serverTimestamp() });
  await batch.commit();
  return true;
}

export async function listFollowing(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", uid, "following"));
  return snap.docs.map((d) => d.id);
}

export async function listFollowers(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", uid, "followers"));
  return snap.docs.map((d) => d.id);
}

// Helpers kept for symmetry / explicit set-remove if needed elsewhere.
export async function unfollow(me: string, target: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, "users", me, "following", target)),
    deleteDoc(doc(db, "users", target, "followers", me)),
  ]);
}

export async function follow(me: string, target: string): Promise<void> {
  await Promise.all([
    setDoc(doc(db, "users", me, "following", target), {
      uid: target,
      createdAt: serverTimestamp(),
    }),
    setDoc(doc(db, "users", target, "followers", me), {
      uid: me,
      createdAt: serverTimestamp(),
    }),
  ]);
}
