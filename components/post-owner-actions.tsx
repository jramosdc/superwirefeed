"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { deletePost } from "@/lib/db/client";

// Edit/delete controls shown only to a post's author.
export function PostOwnerActions({
  postId,
  ownerUid,
  feedId,
}: {
  postId: string;
  ownerUid: string;
  feedId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user || user.uid !== ownerUid) return null;

  async function onDelete() {
    setBusy(true);
    try {
      await deletePost(postId);
      router.push(`/feeds/${feedId}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/posts/${postId}/edit`} className="btn-secondary">
        Edit
      </Link>
      {confirming ? (
        <>
          <button
            onClick={onDelete}
            disabled={busy}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Confirm delete"}
          </button>
          <button onClick={() => setConfirming(false)} className="btn-secondary">
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
