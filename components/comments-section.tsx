"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Comment } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { addComment, subscribeToComments } from "@/lib/db/client";
import { relativeTime } from "@/lib/format";

export function CommentsSection({ postId }: { postId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToComments(postId, setComments), [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setBusy(true);
    try {
      await addComment({
        postId,
        authorUid: user.uid,
        authorName: profile?.displayName || user.email || "Anonymous",
        authorPhoto: profile?.photoURL || "",
        text: text.trim(),
      });
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {user ? (
        <form onSubmit={submit} className="mb-6 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="input flex-1"
          />
          <button type="submit" disabled={busy || !text.trim()} className="btn-primary">
            Post
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-zinc-500">
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200">
              {c.authorPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.authorPhoto} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-semibold">{c.authorName}</span>{" "}
                <span className="text-xs text-zinc-400">
                  {relativeTime(c.createdAt)}
                </span>
              </p>
              <p className="text-sm text-zinc-700">{c.text}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-zinc-500">No comments yet.</li>
        )}
      </ul>
    </section>
  );
}
