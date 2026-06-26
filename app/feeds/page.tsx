"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllPosts } from "@/lib/db/posts";
import { listFeeds } from "@/lib/db/feeds";
import { listAccuracyMap, listTrustMap } from "@/lib/db/accuracy";
import { listCertificationMap } from "@/lib/db/certifications";
import { listStatsMap, usageScore } from "@/lib/db/stats";
import { isHumanReviewed } from "@/lib/trust";
import {
  searchByTitle,
  filterByCategory,
  filterByFormat,
  filterByPrice,
  orderByNewest,
  type PriceFilter,
} from "@/lib/search";
import { priceCents } from "@/lib/licenses";
import { TRUSTED_THRESHOLD } from "@/lib/trust";
import { PostCard } from "@/components/PostCard";
import { CategoryBar } from "@/components/CategoryBar";
import { FORMATS } from "@/types";
import type {
  PostDoc,
  FeedDoc,
  CategoryFilter,
  FormatFilter,
  PostCertificationDoc,
  PostStatsDoc,
} from "@/types";

type TrustFilter = "all" | "corroborated" | "trusted";
type SortKey = "newest" | "used" | "corroborated" | "trust" | "price";

export default function FeedsPage() {
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [feeds, setFeeds] = useState<(FeedDoc & { id: string })[]>([]);
  const [accuracy, setAccuracy] = useState<
    Record<string, { score: number; corroborations: number }>
  >({});
  const [trust, setTrust] = useState<Record<string, number>>({});
  const [certs, setCerts] = useState<Record<string, PostCertificationDoc>>({});
  const [stats, setStats] = useState<Record<string, PostStatsDoc>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [queryStr, setQueryStr] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [format, setFormat] = useState<FormatFilter>("All");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [trustFilter, setTrustFilter] = useState<TrustFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [breakingOnly, setBreakingOnly] = useState(false);
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      listAllPosts(),
      listFeeds(),
      listAccuracyMap(),
      listTrustMap(),
      listCertificationMap(),
      listStatsMap(),
    ])
      .then(([p, f, acc, tr, ce, st]) => {
        setPosts(p);
        setFeeds(f);
        setAccuracy(acc);
        setTrust(tr);
        setCerts(ce);
        setStats(st);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    let result = filterByPrice(
      filterByFormat(
        filterByCategory(searchByTitle(posts, queryStr), category),
        format,
      ),
      price,
    );

    if (trustFilter === "corroborated") {
      result = result.filter((p) => (accuracy[p.id]?.corroborations ?? 0) > 0);
    } else if (trustFilter === "trusted") {
      result = result.filter((p) => (trust[p.ownerUid] ?? 0) >= TRUSTED_THRESHOLD);
    }

    if (breakingOnly) result = result.filter((p) => p.breaking);

    if (certifiedOnly) {
      result = result.filter((p) => {
        const c = certs[p.id];
        return c && isHumanReviewed(c.authoredCount, c.curatedCount, c.aiFlagged);
      });
    }

    const sorted = [...result];
    if (sort === "newest") return orderByNewest(sorted);
    if (sort === "used")
      return sorted.sort(
        (a, b) => usageScore(stats[b.id]) - usageScore(stats[a.id]),
      );
    if (sort === "corroborated")
      return sorted.sort(
        (a, b) =>
          (accuracy[b.id]?.corroborations ?? 0) -
          (accuracy[a.id]?.corroborations ?? 0),
      );
    if (sort === "trust")
      return sorted.sort(
        (a, b) => (trust[b.ownerUid] ?? 0) - (trust[a.ownerUid] ?? 0),
      );
    // price: free first, then ascending
    return sorted.sort((a, b) => priceCents(a.license) - priceCents(b.license));
  }, [posts, queryStr, category, format, price, trustFilter, sort, breakingOnly, certifiedOnly, accuracy, trust, certs, stats]);

  // Trending: top posts by weighted usage (purchases/downloads/views).
  const trending = useMemo(() => {
    return [...posts]
      .filter((p) => usageScore(stats[p.id]) > 0)
      .sort((a, b) => usageScore(stats[b.id]) - usageScore(stats[a.id]))
      .slice(0, 6);
  }, [posts, stats]);

  const selectCls =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">The wire</h1>
        <p className="text-slate-600">
          Browse data, signals and reporting from every wire service. Buy a
          license to republish; corroborate what you trust.
        </p>
      </div>

      {trending.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            🔥 Trending now
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((p) => (
              <PostCard key={p.id} post={p} cert={certs[p.id]} stats={stats[p.id]} />
            ))}
          </div>
        </section>
      )}

      <input
        type="search"
        placeholder="Search by title…"
        value={queryStr}
        onChange={(e) => setQueryStr(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2"
      />

      <CategoryBar active={category} onChange={setCategory} />

      <div className="flex flex-wrap gap-2">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as FormatFilter)}
          className={selectCls}
          aria-label="Format"
        >
          <option value="All">All formats</option>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          value={price}
          onChange={(e) => setPrice(e.target.value as PriceFilter)}
          className={selectCls}
          aria-label="Price"
        >
          <option value="all">Any price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={trustFilter}
          onChange={(e) => setTrustFilter(e.target.value as TrustFilter)}
          className={selectCls}
          aria-label="Trust"
        >
          <option value="all">Any trust</option>
          <option value="corroborated">Corroborated</option>
          <option value="trusted">Trusted sources</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={selectCls}
          aria-label="Sort"
        >
          <option value="newest">Newest</option>
          <option value="used">Most used</option>
          <option value="corroborated">Most corroborated</option>
          <option value="trust">Highest trust</option>
          <option value="price">Price (low→high)</option>
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={breakingOnly}
            onChange={(e) => setBreakingOnly(e.target.checked)}
          />
          🔴 Breaking
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={certifiedOnly}
            onChange={(e) => setCertifiedOnly(e.target.checked)}
          />
          ✓ Human-reviewed
        </label>
      </div>

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
                {f.ratingCount > 0 ? ` · ★ ${f.ratingAvg}` : ""}
                {(trust[f.id] ?? 0) >= TRUSTED_THRESHOLD ? " · ✓" : ""}
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
          <PostCard key={p.id} post={p} cert={certs[p.id]} stats={stats[p.id]} />
        ))}
      </div>
    </div>
  );
}
