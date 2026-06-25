import Link from "next/link";
import type { Feed } from "@/types";
import { RatingStars } from "./rating-stars";
import { relativeTime } from "@/lib/format";

export function FeedCard({ feed }: { feed: Feed }) {
  return (
    <Link
      href={`/feeds/${feed.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      <div
        className="h-24 bg-zinc-100 bg-cover bg-center"
        style={
          feed.backgroundImageURL
            ? { backgroundImage: `url(${feed.backgroundImageURL})` }
            : { background: "linear-gradient(135deg,#fce7f0,#fbcfe8)" }
        }
      />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="-mt-8 h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-200">
            {feed.profileImageURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={feed.profileImageURL}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold group-hover:text-brand">
              {feed.feedName || "Untitled feed"}
            </h3>
            <p className="text-xs text-zinc-500">{feed.feedCategory}</p>
          </div>
        </div>
        {feed.about && (
          <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{feed.about}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <RatingStars value={feed.ratingAvg} count={feed.ratingCount} />
          <span className="text-xs text-zinc-400">
            {relativeTime(feed.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
