"use client";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase/client";

function rand(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Upload a publicly-readable image (cover, gallery, profile, background) and
// return its download URL. Replaces authService.uploadPostImg/uploadUserImg
// (which did manual base64 -> blob). Callers pass a real File/Blob now.
export async function uploadImage(
  blob: Blob,
  folder: "posts" | "profile" | "background" | "feeds",
  uid: string,
): Promise<string> {
  const path = `images/${folder}/${uid}/${rand()}.png`;
  const snap = await uploadBytes(ref(storage, path), blob);
  return getDownloadURL(snap.ref);
}

// Upload a GATED asset (CSV/PDF). Returns the storage PATH (not a URL): the file
// is never directly readable; it is served by the purchase-gated download route.
export async function uploadGatedAsset(
  file: File,
  uid: string,
  postId: string,
): Promise<string> {
  const path = `assets/${uid}/${postId}/${file.name}`;
  await uploadBytes(ref(storage, path), file);
  return path;
}

export async function deleteByPath(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // already gone — ignore
  }
}
