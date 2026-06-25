"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { addReview } from "@/lib/db/reviews";
import { getUser } from "@/lib/db/users";
import { RatingStars } from "./RatingStars";

export function ReviewForm({
  sellerUid,
  onSubmitted,
}: {
  sellerUid: string;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // Can't review yourself.
  if (user && user.uid === sellerUid) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const profile = await getUser(user.uid);
      await addReview({
        sellerUid,
        authorUid: user.uid,
        authorName: profile?.displayName ?? user.email ?? "Anon",
        rating,
        text: text.trim(),
      });
      setText("");
      setRating(5);
      onSubmitted();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">Leave a review</h3>
      <RatingStars value={rating} onChange={setRating} size="text-2xl" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={user ? "How reliable is this source?" : "Log in to review"}
        className="w-full rounded border border-slate-300 px-3 py-2"
        rows={3}
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
