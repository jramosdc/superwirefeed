import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PostStatsDoc } from "@/types";

// Usage counters (views/purchases/downloads) are WRITTEN server-side only
// (/api/view, the Stripe webhook, the download route). Clients read them here
// and report a view through /api/view.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

function toStats(d: Record<string, unknown> | undefined): PostStatsDoc {
  return {
    views: (d?.views as number) ?? 0,
    purchases: (d?.purchases as number) ?? 0,
    downloads: (d?.downloads as number) ?? 0,
    updatedAt: tsToMillis(d?.updatedAt),
  };
}

// Weighted "used" signal: a purchase/download counts far more than a view.
export function usageScore(s: PostStatsDoc | undefined | null): number {
  if (!s) return 0;
  return s.purchases * 5 + s.downloads * 3 + s.views;
}

export async function getPostStats(
  postId: string,
): Promise<PostStatsDoc | null> {
  const snap = await getDoc(doc(db, "postStats", postId));
  return snap.exists() ? toStats(snap.data()) : null;
}

export async function listStatsMap(): Promise<Record<string, PostStatsDoc>> {
  const snap = await getDocs(collection(db, "postStats"));
  const map: Record<string, PostStatsDoc> = {};
  snap.docs.forEach((d) => {
    map[d.id] = toStats(d.data());
  });
  return map;
}

// Fire-and-forget view ping (deduped per session by the caller).
export async function recordView(postId: string): Promise<void> {
  try {
    await fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
      keepalive: true,
    });
  } catch {
    /* best-effort */
  }
}
