"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";
import { getFeed } from "@/lib/db/feeds";
import { listReviewsForSeller, aggregateRating } from "@/lib/db/reviews";
import { listFollowers, listFollowing } from "@/lib/db/follows";
import { FollowButton } from "@/components/FollowButton";
import { RatingStars } from "@/components/RatingStars";
import { ReviewForm } from "@/components/ReviewForm";
import type { UserDoc, FeedDoc, ReviewDoc } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [feed, setFeed] = useState<(FeedDoc & { id: string }) | null>(null);
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(() => {
    listReviewsForSeller(uid).then(setReviews);
  }, [uid]);

  useEffect(() => {
    Promise.all([
      getUser(uid),
      getFeed(uid),
      listReviewsForSeller(uid),
      listFollowers(uid),
      listFollowing(uid),
    ])
      .then(([u, f, r, fr, fg]) => {
        setProfile(u);
        setFeed(f);
        setReviews(r);
        setFollowers(fr);
        setFollowing(fg);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!profile) return <p className="text-slate-500">User not found.</p>;

  const rating = aggregateRating(reviews);
  const isSelf = user?.uid === uid;

  return (
    <div className="space-y-6">
      <header
        className="rounded-lg border border-slate-200 bg-white p-6"
        style={
          profile.backgroundImageURL
            ? {
                backgroundImage: `linear-gradient(rgba(255,255,255,.85),rgba(255,255,255,.95)), url(${profile.backgroundImageURL})`,
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.profileImageURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profileImageURL}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-500">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <RatingStars value={rating.avg} />
                <span>{rating.count > 0 ? `${rating.avg} (${rating.count})` : "No reviews"}</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {followers.length} follower{followers.length === 1 ? "" : "s"} ·{" "}
                {following.length} following
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isSelf ? (
              <Link href="/settings" className="rounded border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-100">
                Edit profile
              </Link>
            ) : (
              <FollowButton targetUid={uid} />
            )}
            {feed && (
              <Link href={`/feeds/${uid}`} className="text-sm text-blue-700 hover:underline">
                View their wire →
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.authorName}</span>
                <RatingStars value={r.rating} size="text-sm" />
              </div>
              {r.text && <p className="mt-1 text-sm text-slate-700">{r.text}</p>}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {!isSelf && <ReviewForm sellerUid={uid} onSubmitted={loadReviews} />}
          <FollowList title="Followers" uids={followers} />
          <FollowList title="Following" uids={following} />
        </div>
      </section>
    </div>
  );
}

function FollowList({ title, uids }: { title: string; uids: string[] }) {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(uids.map((u) => getUser(u))).then((users) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      users.forEach((u, i) => {
        if (u) map[uids[i]] = u.displayName;
      });
      setNames(map);
    });
    return () => {
      cancelled = true;
    };
  }, [uids]);

  if (uids.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {uids.map((u) => (
          <Link key={u} href={`/profile/${u}`} className="text-sm text-blue-700 hover:underline">
            {names[u] ?? `${u.slice(0, 8)}…`}
          </Link>
        ))}
      </div>
    </div>
  );
}
