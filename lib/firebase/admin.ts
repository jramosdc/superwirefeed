// Firebase Admin SDK — server-only. Used by route handlers and server actions
// to verify sessions, write privileged docs (purchases), and stream gated files.
import "server-only";

import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function createAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (raw) {
    const serviceAccount = JSON.parse(raw);
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId ?? serviceAccount.project_id,
      storageBucket,
    });
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS / emulator defaults.
  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket,
  });
}

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
