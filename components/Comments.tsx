"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { addComment, listComments } from "@/lib/db/comments";
import { getUser } from "@/lib/db/users";
import type { CommentDoc } from "@/types";

export function Comments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setComments(await listComments(postId));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!text.trim()) return;
    setBusy(true);
    try {
      const profile = await getUser(user.uid);
      await addComment(postId, {
        authorUid: user.uid,
        authorName: profile?.displayName ?? user.email ?? "Anon",
        text: text.trim(),
      });
      setText("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? "Add a comment…" : "Log in to comment"}
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Post
        </button>
      </form>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium">{c.authorName}</p>
            <p className="text-sm text-slate-700">{c.text}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-slate-500">Be the first to comment.</li>
        )}
      </ul>
    </section>
  );
}
