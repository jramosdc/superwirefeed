"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { getIdToken } from "@/lib/firebase/token";

// Share a bounty or post: native share sheet where available, copy-link
// fallback elsewhere. The link carries ?ref={uid} — the attribution seed for
// the fee-waiver economy — and the share event is recorded server-side
// (/api/shares) so sharing your own bounty can earn a waiver credit.
// Mirrors the iOS client (BountyDetailView/PostDetailView share buttons).
export function ShareButton({
  requestId,
  postId,
  title,
}: {
  requestId?: string;
  postId?: string;
  title: string;
}) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const path = requestId ? `/requests/${requestId}` : `/posts/${postId}`;

  async function share() {
    const url = new URL(path, window.location.origin);
    if (user) url.searchParams.set("ref", user.uid);

    // Record the event (best-effort; anonymous shares aren't recorded).
    if (user) {
      getIdToken()
        .then((token) =>
          fetch("/api/shares", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ requestId, postId }),
          }),
        )
        .catch(() => {});
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, url: url.toString() });
        return;
      } catch {
        // User dismissed the sheet — fall through to nothing.
        return;
      }
    }
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
    >
      {copied ? "✓ Link copied" : "Share"}
    </button>
  );
}
