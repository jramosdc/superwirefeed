"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllPosts } from "@/lib/db/posts";
import { listFeeds } from "@/lib/db/feeds";
import { searchByTitle, filterByCategory, orderByNewest } from "@/lib/search";
import { PostCard } from "@/components/PostCard";
import { CategoryBar } from "@/components/CategoryBar";
import type { PostDoc, FeedDoc, CategoryFilter } from "@/types";

export default function FeedsPage() {
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [feeds, setFeeds] = useState<(FeedDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryStr, setQueryStr] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  useEffect(() => {
    Promise.all([listAllPosts(), listFeeds()])
      .then(([p, f]) => {
        setPosts(p);
        setFeeds(f);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Search by title + filter by category, then newest-first (porting the pipes).
  const visible = useMemo(() => {
    return orderByNewest(filterByCategory(searchByTitle(posts, queryStr), category));
  }, [posts, queryStr, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">The wire</h1>
        <p className="text-slate-600">
          Browse content from every wire service. Buy a license to republish.
        </p>
      </div>

      <input
        type="search"
        placeholder="Search by title…"
        value={queryStr}
        onChange={(e) => setQueryStr(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2"
      />
      <CategoryBar active={category} onChange={setCategory} />

      {feeds.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Wire services
          </h2>
          <div className="flex flex-wrap gap-2">
            {feeds.map((f) => (
              <Link
                key={f.id}
                href={`/feeds/${f.id}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
              >
                {f.name || "Untitled wire"} · ♥ {f.likes}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && visible.length === 0 && (
        <p className="text-slate-500">No posts match your filters yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
