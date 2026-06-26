"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listRequests } from "@/lib/db/requests";
import { CATEGORIES, FORMATS } from "@/types";
import type { RequestDoc, RequestStatus } from "@/types";

const STATUS_STYLES: Record<RequestStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  fulfilled: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-600",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"open" | "all" | "fulfilled">("open");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "bounty">("newest");

  useEffect(() => {
    listRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    let r = requests;
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (category !== "All") r = r.filter((x) => x.category === category);
    const sorted = [...r];
    if (sort === "bounty") sorted.sort((a, b) => b.bountyUsd - a.bountyUsd);
    return sorted;
  }, [requests, statusFilter, category, sort]);

  const selectCls = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Requests &amp; bounties</h1>
          <p className="text-slate-600">
            Ask for the data or content you need — sellers can fulfill it.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="shrink-0 rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + New request
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "open" | "all" | "fulfilled")}
          className={selectCls}
        >
          <option value="open">Open</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="all">All</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectCls}
        >
          <option value="All">All topics</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "bounty")}
          className={selectCls}
        >
          <option value="newest">Newest</option>
          <option value="bounty">Highest bounty</option>
        </select>
      </div>

      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && visible.length === 0 && (
        <p className="text-slate-500">No requests yet. Be the first to post one.</p>
      )}

      <div className="space-y-3">
        {visible.map((r) => (
          <Link
            key={r.id}
            href={`/requests/${r.id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{r.title}</h3>
              <span className="flex shrink-0 items-center gap-2">
                {r.bountyUsd > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    ${r.bountyUsd} bounty
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{r.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              {r.requesterName} · wants {r.format === "Any" ? "any format" : r.format}
              {r.category !== "Any" && ` · ${r.category}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
