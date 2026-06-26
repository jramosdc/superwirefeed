"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getFeed } from "@/lib/db/feeds";
import { listPostsByFeed } from "@/lib/db/posts";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { RatingStars } from "@/components/RatingStars";
import type { FeedDoc, PostDoc } from "@/types";

export default function FeedDetailPage({
  params,
}: {
  params: Promise<{ feedId: string }>;
}) {
  const { feedId } = use(params);
  const [feed, setFeed] = useState<(FeedDoc & { id: string }) | null>(null);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getFeed(feedId), listPostsByFeed(feedId)])
      .then(([f, p]) => {
        if (!f) {
          setNotFound(true);
          return;
        }
        setFeed(f);
        setPosts(p);
      })
      .finally(() => setLoading(false));
  }, [feedId]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (notFound) return <p className="text-slate-500">Wire not found.</p>;

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-6">
        {feed?.coverImageURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={feed.coverImageURL}
            alt=""
            className="mb-4 h-40 w-full rounded object-cover"
          />
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{feed?.name || "Untitled wire"}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <RatingStars value={feed?.ratingAvg ?? 0} />
              <span>
                {(feed?.ratingCount ?? 0) > 0
                  ? `${feed?.ratingAvg} · ${feed?.ratingCount} review${(feed?.ratingCount ?? 0) > 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
              <span>· ♥ {feed?.likes}</span>
            </div>
            <Link
              href={`/profile/${feedId}`}
              className="mt-1 inline-block text-sm text-blue-700 hover:underline"
            >
              View seller profile
            </Link>
          </div>
          <FollowButton targetUid={feedId} />
        </div>
      </header>

      <h2 className="text-lg font-semibold">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-slate-500">This wire has no posts yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
