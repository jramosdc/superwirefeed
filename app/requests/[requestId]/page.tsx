"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";
import { listPostsByFeed } from "@/lib/db/posts";
import {
  addResponse,
  getRequest,
  listResponses,
  updateRequestStatus,
} from "@/lib/db/requests";
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
  const canRespond = !!user && !isRequester && req.status === "open";

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
    setBusy(true);
    try {
      await updateRequestStatus(requestId, "fulfilled", {
        postId: r.postId,
        uid: r.responderUid,
      });
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

        {req.status === "fulfilled" && req.fulfilledByPostId && (
          <p className="mt-3 text-sm text-emerald-700">
            ✓ Fulfilled by{" "}
            <Link href={`/posts/${req.fulfilledByPostId}`} className="underline">
              this post
            </Link>
            .
          </p>
        )}

        {isRequester && req.status === "open" && (
          <button
            onClick={close}
            disabled={busy}
            className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            Close request
          </button>
        )}
      </header>

      {/* Respond */}
      {canRespond && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-2 font-semibold">Respond with one of your posts</h2>
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
                {isRequester && req.status === "open" && (
                  <button
                    onClick={() => accept(r)}
                    disabled={busy}
                    className="shrink-0 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
