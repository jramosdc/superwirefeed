"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getUser } from "@/lib/db/users";
import { createRequest } from "@/lib/db/requests";
import { CATEGORIES, FORMATS } from "@/types";

export default function NewRequestPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Any");
  const [format, setFormat] = useState("Any");
  const [bounty, setBounty] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      setError("Give your request a title.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const profile = await getUser(user.uid);
      const id = await createRequest({
        requesterUid: user.uid,
        requesterName: profile?.displayName ?? user.email ?? "Anon",
        title: title.trim(),
        description: description.trim(),
        category,
        format,
        bountyUsd: Math.max(0, Math.round(bounty) || 0),
      });
      router.push(`/requests/${id}`);
    } catch {
      setError("Could not post the request. Please try again.");
      setBusy(false);
    }
  }

  const inputCls = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Post a request</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need? e.g. Hourly air-quality data for São Paulo"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Coverage, timeframe, format, licensing needs…"
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Topic</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="Any">Any</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={inputCls}
            >
              <option value="Any">Any</option>
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Bounty (USD)</label>
            <input
              type="number"
              min={0}
              value={bounty}
              onChange={(e) => setBounty(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post request"}
        </button>
      </form>
      <p className="text-xs text-slate-400">
        A bounty is a stated amount that signals what you&apos;ll pay — payment is
        arranged when you accept a fulfilling post.
      </p>
    </div>
  );
}
