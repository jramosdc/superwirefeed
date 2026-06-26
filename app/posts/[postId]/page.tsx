"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getPost, deletePost } from "@/lib/db/posts";
import { getFeed } from "@/lib/db/feeds";
import { hasPurchased } from "@/lib/db/purchases";
import { isGated } from "@/lib/licenses";
import { readingTime } from "@/lib/search";
import { PostActions } from "@/components/PostActions";
import { CsvTable } from "@/components/CsvTable";
import { Comments } from "@/components/Comments";
import { ProvenancePanel } from "@/components/ProvenancePanel";
import { AccuracyPanel } from "@/components/AccuracyPanel";
import { CertificationPanel } from "@/components/CertificationPanel";
import type { PostDoc, FeedDoc } from "@/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [feed, setFeed] = useState<(FeedDoc & { id: string }) | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPost(postId)
      .then(async (p) => {
        if (!p) {
          setNotFound(true);
          return;
        }
        setPost(p);
        getFeed(p.feedId).then(setFeed);
        // Unlock when the license is free, the viewer owns it, or they bought it.
        if (!isGated(p.license)) {
          setUnlocked(true);
        } else if (user) {
          if (user.uid === p.ownerUid) setUnlocked(true);
          else setUnlocked(await hasPurchased(user.uid, p.id));
        }
      })
      .finally(() => setLoading(false));
  }, [postId, user]);

  async function onDelete() {
    if (!post || !confirm("Delete this post permanently?")) return;
    await deletePost(post.id);
    router.push(`/feeds/${post.feedId}`);
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (notFound || !post) return <p className="text-slate-500">Post not found.</p>;

  const isOwner = user?.uid === post.ownerUid;
  const fullAccess = !isGated(post.license) || unlocked;
  // Non-buyers of a gated dataset see only the creator-set number of rows.
  const csvRows =
    post.csvPreview &&
    (fullAccess
      ? post.csvPreview
      : post.csvPreview.slice(0, post.freePreviewRows));
  const showCsv = csvRows && csvRows.length > 0;
  // Creator's teaser, shown to those who haven't unlocked the post.
  const showTeaser = !fullAccess && !!post.previewText;

  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link href={`/feeds/${post.feedId}`} className="text-blue-700 hover:underline">
          ← {feed?.name || "wire"}
        </Link>
        {isOwner && (
          <div className="flex gap-3">
            <Link href={`/posts/${post.id}/edit`} className="text-blue-700 hover:underline">
              Edit
            </Link>
            <button onClick={onDelete} className="text-red-600 hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>

      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {post.breaking && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
              BREAKING
            </span>
          )}
          <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700">
            {post.format}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
            {post.category}
          </span>
          {post.types.map((t) => (
            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
              {t}
            </span>
          ))}
          <span className="text-slate-400">{readingTime(post.detailHtml)}</span>
        </div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className="w-full rounded-lg object-cover" />
      )}

      <div
        className="prose-body max-w-none"
        dangerouslySetInnerHTML={{ __html: post.detailHtml }}
      />

      {post.imageURLs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {post.imageURLs.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="rounded object-cover" />
          ))}
        </div>
      )}

      {post.embed && (
        <a
          href={post.embed.url}
          target="_blank"
          rel="noreferrer"
          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300"
        >
          {post.embed.imageURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.embed.imageURL} alt="" className="h-16 w-16 rounded object-cover" />
          )}
          <span>
            <span className="block font-medium">{post.embed.title || post.embed.url}</span>
            <span className="block text-sm text-slate-600">{post.embed.description}</span>
          </span>
        </a>
      )}

      {showTeaser && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Preview
          </p>
          <p className="text-sm text-slate-700">{post.previewText}</p>
        </section>
      )}

      <PostActions post={post} unlocked={unlocked} />

      {showCsv && csvRows && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            {fullAccess ? "Dataset preview" : "Dataset sample"}
          </h2>
          <CsvTable rows={csvRows} />
          {!fullAccess && (
            <p className="text-sm text-slate-500">
              Showing {csvRows.length} sample row{csvRows.length === 1 ? "" : "s"}.
              Buy a license for the full dataset.
            </p>
          )}
        </section>
      )}
      {post.csvPreview && isGated(post.license) && !unlocked && !showCsv && (
        <p className="text-sm text-slate-500">
          Buy a license to preview and download the full dataset.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ProvenancePanel post={post} />
        <AccuracyPanel post={post} />
      </div>

      <CertificationPanel post={post} />

      <Comments postId={post.id} />
    </article>
  );
}
