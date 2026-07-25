import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { createFeed } from "./feeds";
import { getStoredRef } from "@/lib/referral";
import type { UserDoc } from "@/types";

// Bootstrap a brand-new user: profile doc + an empty feed keyed by uid.
// Mirrors the old createUserProfile + feed creation, collapsed onto one uid.
export async function bootstrapUser(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  // Referral attribution: if this signup arrived through a ?ref share link,
  // stamp the sharer once at creation (first ref wins; self-refs ignored).
  const storedRef = getStoredRef();
  const referredBy =
    storedRef && storedRef.refUid !== uid ? storedRef.refUid : "";

  await setDoc(ref, {
    uid,
    email,
    displayName: displayName || email.split("@")[0],
    profileImageURL: "",
    backgroundImageURL: "",
    useBackgroundImage: true,
    interests: [],
    about: "",
    onboarded: false,
    ...(referredBy ? { referredBy } : {}),
    createdAt: serverTimestamp(),
  });

  await createFeed(uid, displayName || email.split("@")[0]);
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateUser(
  uid: string,
  patch: Partial<UserDoc>,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), patch);
}
