"use client";

import { useMemo, useState } from "react";
import type { Feed } from "@/types";
import { FeedCard } from "./feed-card";
import { ALL_CATEGORY, CATEGORIES } from "@/lib/constants";

export function FeedsBrowser({
  feeds,
  initialQuery = "",
}: {
  feeds: Feed[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState<string>(ALL_CATEGORY);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return feeds.filter((f) => {
      const matchesTerm = !term || f.feedName.toLowerCase().includes(term);
      const matchesCat =
        category === ALL_CATEGORY ||
        f.feedCategory === category ||
        f.postCategories.includes(category);
      return matchesTerm && matchesCat;
    });
  }, [feeds, q, category]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search feeds by name…"
          className="input max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {[ALL_CATEGORY, ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-sm ${
                category === c
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">No feeds found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <FeedCard key={f.id} feed={f} />
          ))}
        </div>
      )}
    </div>
  );
}
