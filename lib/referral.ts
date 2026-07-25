// Referral attribution (HANDOFF 4.2). Share links carry ?ref={sharerUid}; on
// landing we persist it and later stamp it on signup (users.referredBy) and on
// bounty responses (requestResponses.refUid). First ref wins — an existing
// stored ref is never overwritten, so a later visit through someone else's
// link can't steal attribution.

const KEY = "superwire.ref";

export interface StoredRef {
  refUid: string;
  // The bounty the visitor landed on, "" if the link wasn't a bounty link.
  requestId: string;
}

/** Read ?ref from the current URL and persist it (no-op without one). */
export function captureRefFromLocation(): void {
  if (typeof window === "undefined") return;
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    if (localStorage.getItem(KEY)) return; // first ref wins
    const match = window.location.pathname.match(/^\/requests\/([^/]+)/);
    const stored: StoredRef = { refUid: ref, requestId: match?.[1] ?? "" };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode etc.) — attribution is best-effort.
  }
}

export function getStoredRef(): StoredRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    return parsed.refUid ? parsed : null;
  } catch {
    return null;
  }
}
