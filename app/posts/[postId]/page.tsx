import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/db/server";
import { PostBody } from "@/components/post-body";
import { BuyDownload } from "@/components/buy-download";
import { CommentsSection } from "@/components/comments-section";
import { PostOwnerActions } from "@/components/post-owner-actions";
import { LicenseBadge } from "@/components/license-badge";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPost(postId).catch(() => null);
  return { title: post ? `${post.title} — SuperWire` : "Post — SuperWire" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPost(postId).catch(() => null);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <article>
          <div className="flex items-center gap-2">
            {post.priority && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                Breaking
              </span>
            )}
            <LicenseBadge license={post.license} />
            <span className="text-xs text-zinc-400">
              {relativeTime(post.createdAt)}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight">
            {post.title}
          </h1>

          <div className="mt-3 flex items-center justify-between">
            <Link
              href={`/feeds/${post.owner.feedId}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
                {post.owner.photoURL && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.owner.photoURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <span className="font-semibold hover:text-brand">
                {post.owner.feedName}
              </span>
            </Link>
            <PostOwnerActions
              postId={post.id}
              ownerUid={post.owner.uid}
              feedId={post.owner.feedId}
            />
          </div>

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="mt-5 w-full rounded-xl border border-zinc-200"
            />
          )}

          <div className="mt-6">
            <PostBody post={post} />
          </div>

          <CommentsSection postId={post.id} />
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BuyDownload post={post} />
          {post.category && (
            <p className="mt-3 text-center text-xs text-zinc-400">
              Category: {post.category}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
