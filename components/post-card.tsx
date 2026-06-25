import Link from "next/link";
import type { Post } from "@/types";
import { LicenseBadge } from "./license-badge";
import { relativeTime, truncate } from "@/lib/format";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      {post.coverImage ? (
        <div
          className="h-40 bg-zinc-100 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverImage})` }}
        />
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          {post.priority && (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Breaking
            </span>
          )}
          <LicenseBadge license={post.license} />
        </div>
        <h3 className="mt-2 font-bold leading-snug group-hover:text-brand">
          {post.title || "Untitled"}
        </h3>
        {post.detail && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
            {truncate(post.detail, 140)}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-zinc-400">
          <span className="truncate">{post.owner.feedName}</span>
          <span>{relativeTime(post.createdAt)}</span>
        </div>
        {post.types.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.types.map((t) => (
              <span
                key={t}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
