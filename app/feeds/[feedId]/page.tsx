import Link from "next/link";
import { notFound } from "next/navigation";
import { getFeed, getPostsByFeed } from "@/lib/db/server";
import { PostCard } from "@/components/post-card";
import { RatingStars } from "@/components/rating-stars";
import { FollowButton } from "@/components/follow-button";
import { OwnerActions } from "@/components/owner-actions";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ feedId: string }>;
}) {
  const { feedId } = await params;
  const feed = await getFeed(feedId).catch(() => null);
  if (!feed) notFound();

  const posts = await getPostsByFeed(feedId).catch(() => []);

  return (
    <div>
      {/* Banner */}
      <div
        className="h-44 bg-cover bg-center"
        style={
          feed.backgroundImageURL
            ? { backgroundImage: `url(${feed.backgroundImageURL})` }
            : { background: "linear-gradient(135deg,#fce7f0,#fbcfe8)" }
        }
      />
      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-200">
              {feed.profileImageURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={feed.profileImageURL}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-extrabold">{feed.feedName}</h1>
              <p className="text-sm text-zinc-500">{feed.feedCategory}</p>
              <div className="mt-1">
                <RatingStars value={feed.ratingAvg} count={feed.ratingCount} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            <Link
              href={`/profile/${feed.ownerUid}`}
              className="btn-secondary"
            >
              Profile
            </Link>
            <FollowButton targetUid={feed.ownerUid} />
            <OwnerActions ownerUid={feed.ownerUid} />
          </div>
        </div>

        {feed.about && (
          <p className="mt-4 max-w-2xl text-zinc-600">{feed.about}</p>
        )}

        <h2 className="mb-4 mt-8 text-lg font-bold">
          Posts {posts.length > 0 && `(${posts.length})`}
        </h2>
        {posts.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">
            No posts yet from this feed.
          </p>
        ) : (
          <div className="grid gap-5 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
