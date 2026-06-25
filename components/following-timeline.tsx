"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { getFollowingTimeline } from "@/lib/db/client";
import { PostCard } from "@/components/post-card";

export function FollowingTimeline() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getFollowingTimeline(user.uid)
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [user]);

  if (loading) {
    return <p className="py-16 text-center text-zinc-500">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-600">Sign in to see posts from sources you follow.</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }
  if (posts === null) {
    return <p className="py-16 text-center text-zinc-500">Loading your feed…</p>;
  }
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-600">
          Your following feed is empty. Discover sources to follow.
        </p>
        <Link href="/feeds" className="btn-primary mt-4 inline-flex">
          Browse feeds
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
