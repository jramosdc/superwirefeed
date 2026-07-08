"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getFeed } from "@/lib/db/feeds";
import { listPostsByFeed } from "@/lib/db/posts";
import { statsFor } from "@/lib/db/stats";
import { getLicense, priceCents } from "@/lib/licenses";
import type { FeedDoc, PostDoc, PostStatsDoc } from "@/types";

// "My feed" — the seller-side dashboard, ported from the iOS Feed tab:
// your wire, everything you've published (with reach + earnings), and
// publishing front and center.
export default function MyFeedPage() {
  const { user, loading } = useRequireAuth();
  const [feed, setFeed] = useState<(FeedDoc & { id: string }) | null>(null);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [stats, setStats] = useState<Record<string, PostStatsDoc>>({});
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [f, p] = await Promise.all([
        getFeed(user.uid),
        listPostsByFeed(user.uid),
      ]);
      setFeed(f);
      setPosts(p);
      setStats(await statsFor(p.map((x) => x.id)));
      setBusy(false);
    })();
  }, [user]);

  if (loading || !user || busy) {
    return <p className="text-slate-500">Loading your wire…</p>;
  }

  const earnedCents = (p: PostDoc) =>
    (stats[p.id]?.purchases ?? 0) * priceCents(p.license);
  const totals = posts.reduce(
    (acc, p) => ({
      views: acc.views + (stats[p.id]?.views ?? 0),
      downloads: acc.downloads + (stats[p.id]?.downloads ?? 0),
      earned: acc.earned + earnedCents(p),
    }),
    { views: 0, downloads: 0, earned: 0 },
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{feed?.name || "My feed"}</h1>
          {feed?.about && <p className="mt-1 text-sm text-slate-500">{feed.about}</p>}
        </div>
        <div className="flex shrink-0 gap-3 text-sm">
          <Link href={`/feeds/${user.uid}`} className="text-blue-700 hover:underline">
            Public page
          </Link>
          <Link href="/settings" className="text-blue-700 hover:underline">
            Settings
          </Link>
        </div>
      </header>

      {/* The standing prompt to publish — the reason this page exists. */}
      <Link
        href="/posts/new"
        className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-700 hover:bg-blue-100"
      >
        <span className="text-xl">✏️</span>
        <span className="font-medium">What have you got? Publish to your wire.</span>
      </Link>

      {/* Reach + earnings summary. */}
      <div className="grid grid-cols-4 gap-3 rounded-lg border border-slate-200 bg-white p-4 text-center">
        <div>
          <p className="text-xl font-bold">{posts.length}</p>
          <p className="text-xs text-slate-500">{posts.length === 1 ? "post" : "posts"}</p>
        </div>
        <div>
          <p className="text-xl font-bold">{totals.views}</p>
          <p className="text-xs text-slate-500">views</p>
        </div>
        <div>
          <p className="text-xl font-bold">{totals.downloads}</p>
          <p className="text-xs text-slate-500">downloads</p>
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-600">${totals.earned / 100}</p>
          <p className="text-xs text-slate-500">earned</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
          <p className="font-semibold">Nothing on your wire yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Publish articles, datasets, photos or findings — buyers license
            them and you get paid.
          </p>
          <Link
            href="/posts/new"
            className="mt-4 inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Publish your first post
          </Link>
        </div>
      ) : (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Published ({posts.length})
          </h2>
          <ul className="space-y-2">
            {posts.map((p) => {
              const s = stats[p.id];
              const sold = s?.purchases ?? 0;
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/posts/${p.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {getLicense(p.license).shortLabel} · {s?.views ?? 0} views ·{" "}
                      {s?.downloads ?? 0} downloads
                      {sold > 0 && ` · ${sold} sold · $${earnedCents(p) / 100} earned`}
                    </p>
                  </div>
                  <Link
                    href={`/posts/${p.id}/edit`}
                    className="shrink-0 text-sm text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
