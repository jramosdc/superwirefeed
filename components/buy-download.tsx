"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/types";
import { getLicense } from "@/lib/licenses";
import { formatUsd } from "@/lib/format";
import { useAuth } from "@/lib/firebase/auth-context";
import { getIdToken } from "@/lib/firebase/auth-context";
import { hasPurchasedClient } from "@/lib/db/client";

export function BuyDownload({
  post,
  purchasedInitial = false,
}: {
  post: Post;
  purchasedInitial?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const license = getLicense(post.license);
  const [purchased, setPurchased] = useState(purchasedInitial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasFiles = !!post.csvFile || post.pdfFiles.length > 0;
  const unlocked = !license.paid || purchased;

  useEffect(() => {
    if (!license.paid || !user) return;
    hasPurchasedClient(user.uid, post.id).then(setPurchased).catch(() => {});
  }, [user, post.id, license.paid]);

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
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(false);
    }
  }

  const [downloading, setDownloading] = useState("");

  async function download(storagePath: string) {
    setDownloading(storagePath);
    setError("");
    try {
      const token = await getIdToken();
      const res = await fetch(
        `/api/download/${post.id}?file=${encodeURIComponent(storagePath)}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Download failed");
      window.open(data.url, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setDownloading("");
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">License & rights</h3>
        {license.paid && (
          <span className="text-lg font-bold text-brand-dark">
            {formatUsd(license.priceUsd)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">{license.label}</p>
      <p className="mt-1 text-sm text-zinc-600">{license.rights}</p>

      <div className="mt-4">
        {unlocked ? (
          hasFiles ? (
            <div className="space-y-2">
              {license.paid && purchased && (
                <p className="text-sm font-medium text-emerald-700">
                  ✓ Purchased — your downloads are ready
                </p>
              )}
              {post.csvFile && (
                <button
                  onClick={() => download(post.csvFile!.storagePath)}
                  disabled={downloading === post.csvFile.storagePath}
                  className="btn-primary w-full"
                >
                  {downloading === post.csvFile.storagePath
                    ? "Preparing…"
                    : `Download dataset (${post.csvFile.name})`}
                </button>
              )}
              {post.pdfFiles.map((f) => (
                <button
                  key={f.storagePath}
                  onClick={() => download(f.storagePath)}
                  disabled={downloading === f.storagePath}
                  className="btn-secondary w-full"
                >
                  {downloading === f.storagePath
                    ? "Preparing…"
                    : `Download ${f.name}`}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No downloadable files attached to this post.
            </p>
          )
        ) : (
          <button onClick={buy} disabled={busy} className="btn-primary w-full">
            {busy ? "Starting checkout…" : `Buy for ${formatUsd(license.priceUsd)}`}
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {(post.pdfLink || post.gsheetLink || post.mainUrl) && (
        <div className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-sm">
          {post.mainUrl && (
            <a
              href={post.mainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-brand hover:underline"
            >
              Source link ↗
            </a>
          )}
          {post.gsheetLink && (
            <a
              href={post.gsheetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-brand hover:underline"
            >
              Linked spreadsheet ↗
            </a>
          )}
          {post.pdfLink && (
            <a
              href={post.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-brand hover:underline"
            >
              Linked PDF ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
