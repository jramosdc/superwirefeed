"use client";

import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// postSecrets/{postId} — seller-private companion doc for a post, holding the
// EXTERNAL deliverable link (Drive/WeTransfer/…). It cannot live on the post
// itself: post docs are world-readable, so any URL stored there is public no
// matter what the UI hides — the exact leak this collection exists to close.
// Rules: only the post's owner may read/write; buyers receive the URL via the
// purchase-gated /api/download route (Admin SDK).

export async function setDeliverableUrl(
  postId: string,
  ownerUid: string,
  deliverableUrl: string,
): Promise<void> {
  const ref = doc(db, "postSecrets", postId);
  if (!deliverableUrl.trim()) {
    // Cleared by the seller — remove the secret so the route 404s honestly.
    await deleteDoc(ref).catch(() => {});
    return;
  }
  await setDoc(ref, {
    ownerUid,
    deliverableUrl: deliverableUrl.trim(),
    updatedAt: serverTimestamp(),
  });
}

/** Owner-only read, used to prefill the edit form. Others get a rules denial. */
export async function getDeliverableUrl(postId: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, "postSecrets", postId));
    return snap.exists() ? ((snap.data().deliverableUrl as string) ?? "") : "";
  } catch {
    return "";
  }
}
