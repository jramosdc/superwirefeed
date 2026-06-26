import "server-only";

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import type { Bucket } from "@google-cloud/storage";

// Admin SDK — server only. Lazily initialised so building without credentials
// (CI page-data collection) doesn't try to parse an empty service account.
let _app: App | null = null;

function adminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApp();
    return _app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  // Emulator mode: when the *_EMULATOR_HOST vars are present the Admin SDK talks
  // to the local emulator and needs no real service-account credential.
  if (
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    _app = initializeApp({
      projectId: projectId ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return _app;
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Private key is stored with literal "\n"; convert back to real newlines.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return _app;
}

// Build a lazy proxy that resolves the real object on first access and binds
// methods to it (so `this` is preserved when calling e.g. adminDb.collection).
function lazyProxy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_t, prop) {
      const target = resolve();
      const value = Reflect.get(target as object, prop);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const adminAuth: Auth = lazyProxy(() => getAuth(adminApp()));
export const adminDb: Firestore = lazyProxy(() => getFirestore(adminApp()));

export function adminBucketRef(): Bucket {
  return (getStorage(adminApp()) as Storage).bucket();
}

// Convenience proxy so callers can use `adminBucket.file(...)` directly.
export const adminBucket: Bucket = lazyProxy(() => adminBucketRef());

// Verify a Firebase ID token sent from the client (Authorization: Bearer ...).
export async function verifyIdToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
