// Verifies a Firebase ID token from the Authorization header of an API request.
import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

export async function getUidFromRequest(
  req: Request,
): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}
