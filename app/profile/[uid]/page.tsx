import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFeed,
  getFollowers,
  getFollowing,
  getReviewsForSeller,
  getUserProfile,
} from "@/lib/db/server";
import { RatingStars } from "@/components/rating-stars";
import { FollowButton } from "@/components/follow-button";
import { ReviewForm } from "@/components/review-form";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const [profile, feed] = await Promise.all([
    getUserProfile(uid).catch(() => null),
    getFeed(uid).catch(() => null),
  ]);
  if (!profile && !feed) notFound();

  const [reviews, followers, following] = await Promise.all([
    getReviewsForSeller(uid).catch(() => []),
    getFollowers(uid).catch(() => []),
    getFollowing(uid).catch(() => []),
  ]);

  const name = feed?.feedName || profile?.displayName || "Source";
  const avatar = profile?.photoURL || feed?.profileImageURL || "";
  const about = profile?.about || feed?.about || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-200">
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{name}</h1>
          {feed && (
            <div className="mt-1">
              <RatingStars value={feed.ratingAvg} count={feed.ratingCount} size="md" />
            </div>
          )}
          <p className="mt-2 flex gap-4 text-sm text-zinc-500">
            <span>
              <strong className="text-zinc-800">{followers.length}</strong> followers
            </span>
            <span>
              <strong className="text-zinc-800">{following.length}</strong> following
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <FollowButton targetUid={uid} />
          <Link href={`/feeds/${uid}`} className="btn-secondary">
            View feed
          </Link>
        </div>
      </div>

      {about && <p className="mt-4 text-zinc-700">{about}</p>}

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">Reviews</h2>
        <div className="card mb-6">
          <ReviewForm sellerUid={uid} />
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="card">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
                    {r.authorPhoto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.authorPhoto} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.authorName}</p>
                    <RatingStars value={r.rating} />
                  </div>
                  <span className="ml-auto text-xs text-zinc-400">
                    {relativeTime(r.createdAt)}
                  </span>
                </div>
                {r.text && <p className="mt-2 text-sm text-zinc-700">{r.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
