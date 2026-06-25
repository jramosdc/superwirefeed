"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getIdToken } from "@/lib/firebase/token";
import { getLicense, formatPrice } from "@/lib/licenses";
import type { PostDoc } from "@/types";

// Buy + download controls for the post view. Mirrors viewpost.onStripeBtnClick /
// download, but the price is decided server-side and the file is gated.
export function PostActions({
  post,
  unlocked,
}: {
  post: PostDoc;
  unlocked: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const license = getLicense(post.license);

  async function buy() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  async function download() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/download/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download failed");
      window.open(data.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{license.label}</span>
        <span className="text-lg font-bold">{formatPrice(license.priceCents)}</span>
      </div>
      <p className="mb-3 text-sm text-slate-600">{license.rights}</p>

      {!license.gated || unlocked ? (
        post.assetPath ? (
          <button
            onClick={download}
            disabled={busy}
            className="w-full rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {busy ? "Preparing…" : `Download ${post.assetName ?? "file"}`}
          </button>
        ) : (
          <p className="text-sm text-slate-500">No downloadable file attached.</p>
        )
      ) : (
        <button
          onClick={buy}
          disabled={busy}
          className="w-full rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {busy ? "Redirecting…" : `Buy to unlock — ${formatPrice(license.priceCents)}`}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
