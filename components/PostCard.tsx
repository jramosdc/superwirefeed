import Link from "next/link";
import type { PostDoc, PostCertificationDoc, PostStatsDoc } from "@/types";
import { getLicense, formatPrice } from "@/lib/licenses";
import { truncateText, readingTime } from "@/lib/search";
import { HumanCertifiedBadge } from "./HumanCertifiedBadge";

export function PostCard({
  post,
  cert,
  stats,
}: {
  post: PostDoc;
  cert?: PostCertificationDoc | null;
  stats?: PostStatsDoc | null;
}) {
  const license = getLicense(post.license);
  const used = stats ? stats.purchases + stats.downloads : 0;
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
    >
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mb-3 h-40 w-full rounded object-cover"
        />
      )}
      <div className="mb-1 flex items-center gap-2 text-xs">
        {post.breaking && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
            BREAKING
          </span>
        )}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
          {post.category}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 ${
            license.gated ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
          }`}
        >
          {formatPrice(license.priceCents)}
        </span>
      </div>
      <h3 className="font-semibold leading-snug">{post.title}</h3>
      {cert && (
        <div className="mt-1">
          <HumanCertifiedBadge cert={cert} size="xs" />
        </div>
      )}
      <p className="mt-1 text-sm text-slate-600">{truncateText(post.detailHtml, 140)}</p>
      <p className="mt-2 text-xs text-slate-400">
        {readingTime(post.detailHtml)}
        {stats && ` · 👁 ${stats.views}`}
        {used > 0 && ` · ↓ ${used} used`}
      </p>
    </Link>
  );
}
