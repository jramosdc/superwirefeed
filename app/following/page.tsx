"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { listFollowing } from "@/lib/db/follows";
import { listPostsByFeed } from "@/lib/db/posts";
import { orderByNewest } from "@/lib/search";
import { PostCard } from "@/components/PostCard";
import type { PostDoc } from "@/types";

// Equivalent of the old subscription route: posts from every seller I follow,
// newest first. (Old getFollowingFeedsPosts, authService.ts:488.)
export default function FollowingPage() {
  const { user, loading } = useRequireAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [busy, setBusy] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const targets = await listFollowing(user.uid);
      if (targets.length === 0) {
        setEmpty(true);
        setBusy(false);
        return;
      }
      // Each followed user owns one feed keyed by their uid.
      const lists = await Promise.all(targets.map((t) => listPostsByFeed(t)));
      setPosts(orderByNewest(lists.flat()));
      setBusy(false);
    })();
  }, [user]);

  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">From sellers you follow</h1>

      {busy && <p className="text-slate-500">Loading…</p>}
      {empty && (
        <p className="text-slate-500">
          You don&apos;t follow anyone yet.{" "}
          <Link href="/feeds" className="text-blue-700 hover:underline">
            Browse the wire
          </Link>{" "}
          and follow some sources.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
