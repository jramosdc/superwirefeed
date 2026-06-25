"use client";

import { auth } from "./client";

// Fetch the current user's Firebase ID token for authenticated API calls
// (Authorization: Bearer <token>). Returns null when signed out.
export async function getIdToken(): Promise<string | null> {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
}
