"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";
import { listPostsByFeed } from "@/lib/db/posts";
import {
  acceptResponse,
  addResponse,
  getRequest,
  isExpired,
  listResponses,
  updateRequestStatus,
} from "@/lib/db/requests";
import { ShareButton } from "@/components/ShareButton";
import type { PostDoc, RequestDoc, RequestResponseDoc } from "@/types";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const { user } = useAuth();
  const [req, setReq] = useState<RequestDoc | null>(null);
  const [responses, setResponses] = useState<RequestResponseDoc[]>([]);
  const [myPosts, setMyPosts] = useState<PostDoc[]>([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    getRequest(requestId).then(setReq);
    listResponses(requestId).then(setResponses);
  }, [requestId]);

  useEffect(() => {
    reload();
    setLoading(false);
  }, [reload]);

  useEffect(() => {
    if (user) listPostsByFeed(user.uid).then(setMyPosts);
  }, [user]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!req) return <p className="text-slate-500">Request not found.</p>;

  const isRequester = user?.uid === req.requesterUid;
  const expired = isExpired(req);
  // Same rule as before, plus: not past its deadline.
  const canRespond = !!user && !isRequester && req.status === "open" && !expired;

  // Full-sentence deadline line for the header (matches the iOS client).
  function deadlineSentence(r: RequestDoc): string {
    if (r.expiresAt == null) return "";
    const date = new Date(r.expiresAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!isExpired(r)) return `Closes ${date}`;
    const noProposals = r.acceptedPostIds.length === 0 && !r.fulfilledByPostId;
    return noProposals
      ? `Expired ${date} — no accepted proposals`
      : `Deadline passed (${date})`;
  }

  async function respond() {
    if (!user || !selectedPost) return;
    setBusy(true);
    setError("");
    try {
      const profile = await getUser(user.uid);
      const post = myPosts.find((p) => p.id === selectedPost);
      await addResponse({
        requestId,
        responderUid: user.uid,
        responderName: profile?.displayName ?? user.email ?? "Anon",
        postId: selectedPost,
        postTitle: post?.title ?? "",
        note: note.trim(),
      });
      setNote("");
      setSelectedPost("");
      reload();
    } catch {
      setError("Could not submit your response.");
    } finally {
      setBusy(false);
    }
  }

  async function accept(r: RequestResponseDoc) {
    if (!req) return;
    setBusy(true);
    try {
      // Multi-winner: each accept appends; the first also sets the legacy
      // single fulfilledBy fields.
      await acceptResponse(
        requestId,
        r.postId,
        r.responderUid,
        req.acceptedPostIds.length === 0 && !req.fulfilledByPostId,
      );
      reload();
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    setBusy(true);
    try {
      await updateRequestStatus(requestId, "closed");
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/requests" className="text-sm text-blue-700 hover:underline">
        ← All requests
      </Link>

      <header className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{req.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {req.bountyUsd > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                ${req.bountyUsd} bounty
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {req.status}
            </span>
          </div>
        </div>
        {req.description && (
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{req.description}</p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          {req.requesterName} · wants {req.format === "Any" ? "any format" : req.format}
          {req.category !== "Any" && ` · ${req.category}`}
        </p>

        {req.expiresAt != null && (
          <p
            className={`mt-2 text-sm font-medium ${
              expired ? "text-slate-500" : "text-amber-700"
            }`}
          >
            {expired ? "⏳ " : "🕑 "}
            {deadlineSentence(req)}
          </p>
        )}

        {req.status === "fulfilled" &&
          (req.acceptedPostIds.length > 0 || req.fulfilledByPostId) && (
            <p className="mt-3 text-sm text-emerald-700">
              ✓ Fulfilled by {Math.max(req.acceptedPostIds.length, 1)} accepted{" "}
              {Math.max(req.acceptedPostIds.length, 1) === 1 ? "post" : "posts"}.
            </p>
          )}

        <div className="mt-3 flex items-center gap-2">
          <ShareButton requestId={requestId} title={req.title} />
          {isRequester && req.status !== "closed" && (
            <button
              onClick={close}
              disabled={busy}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Close request
            </button>
          )}
        </div>
        {isRequester && req.status === "open" && (
          <p className="mt-2 text-xs text-slate-400">
            Share your bounty to reach more sellers — sharing it earns a
            fee-waiver credit on your next sale.
          </p>
        )}
      </header>

      {/* Respond — an existing post, or a new one created for this bounty.
          One offer per user: re-submitting replaces the previous one. */}
      {canRespond && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-2 font-semibold">Respond with one of your posts</h2>
          <p className="mb-3 text-sm text-slate-500">
            Or{" "}
            <Link
              href={`/posts/new?requestId=${requestId}`}
              className="text-blue-700 hover:underline"
            >
              create a new post for this bounty
            </Link>{" "}
            — it stays yours to sell on the open market either way.
          </p>
          {myPosts.length === 0 ? (
            <p className="text-sm text-slate-500">
              You don&apos;t have any posts yet to offer.
            </p>
          ) : (
            <div className="space-y-2">
              <select
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Choose a post…</option>
                {myPosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note to the requester (optional)"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={respond}
                disabled={busy || !selectedPost}
                className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Submit response
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tell a would-be responder why they can't offer a post. */}
      {expired && !isRequester && !!user && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          ⏳ This bounty has expired and is no longer accepting proposals.
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Responses */}
      <section>
        <h2 className="mb-2 font-semibold">
          Responses {responses.length > 0 && `(${responses.length})`}
        </h2>
        {responses.length === 0 ? (
          <p className="text-sm text-slate-500">No responses yet.</p>
        ) : (
          <ul className="space-y-2">
            {responses.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/posts/${r.postId}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {r.postTitle || "View post"}
                  </Link>
                  <p className="text-xs text-slate-500">
                    by {r.responderName}
                    {r.note && ` — ${r.note}`}
                  </p>
                </div>
                {req.acceptedPostIds.includes(r.postId) ||
                req.fulfilledByPostId === r.postId ? (
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">
                    ✓ Accepted
                  </span>
                ) : (
                  isRequester &&
                  req.status !== "closed" && (
                    <button
                      onClick={() => accept(r)}
                      disabled={busy}
                      className="shrink-0 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
