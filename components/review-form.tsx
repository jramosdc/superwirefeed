"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getIdToken } from "@/lib/firebase/auth-context";

export function ReviewForm({ sellerUid }: { sellerUid: string }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (user && user.uid === sellerUid) return null;

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>{" "}
        to rate this source.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await getIdToken();
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sellerUid,
          rating,
          text,
          authorName: profile?.displayName || user!.email,
          authorPhoto: profile?.photoURL || "",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-emerald-600">Thanks for your review!</p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={
              n <= (hover || rating) ? "text-amber-400" : "text-zinc-300"
            }
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Share your experience with this source (optional)…"
        className="input"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
