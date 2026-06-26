"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPost, listPostsBuiltOn } from "@/lib/db/posts";
import type { PostDoc } from "@/types";

const KIND_LABEL: Record<string, string> = {
  primary: "Primary source",
  data: "Data",
  reporting: "Prior reporting",
  other: "Source",
};

// Transparent provenance: where this post's info came from, what it builds on,
// and what has been built on it — no editor, just an auditable trail.
export function ProvenancePanel({ post }: { post: PostDoc }) {
  const [builtOn, setBuiltOn] = useState<{ id: string; title: string }[]>([]);
  const [builtUpon, setBuiltUpon] = useState<PostDoc[]>([]);

  useEffect(() => {
    let active = true;
    if (post.derivedFrom.length > 0) {
      Promise.all(post.derivedFrom.map((id) => getPost(id))).then((posts) => {
        if (!active) return;
        setBuiltOn(
          posts
            .map((p, i) =>
              p ? { id: p.id, title: p.title } : { id: post.derivedFrom[i], title: "(removed post)" },
            ),
        );
      });
    }
    listPostsBuiltOn(post.id).then((p) => active && setBuiltUpon(p));
    return () => {
      active = false;
    };
  }, [post.id, post.derivedFrom]);

  const firstSeen = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Provenance</h2>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-slate-700">Sources</p>
          {post.sources.length === 0 ? (
            <p className="text-slate-400">No sources listed.</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {post.sources.map((s, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {KIND_LABEL[s.kind] ?? "Source"}
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-blue-700 hover:underline"
                  >
                    {s.label || s.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {builtOn.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Builds on</p>
            <ul className="mt-1 space-y-1">
              {builtOn.map((b) => (
                <li key={b.id}>
                  <Link href={`/posts/${b.id}`} className="text-blue-700 hover:underline">
                    {b.title || "Untitled"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {builtUpon.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">
              Built upon by {builtUpon.length}
            </p>
            <ul className="mt-1 space-y-1">
              {builtUpon.map((b) => (
                <li key={b.id}>
                  <Link href={`/posts/${b.id}`} className="text-blue-700 hover:underline">
                    {b.title || "Untitled"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {firstSeen && (
          <p className="text-xs text-slate-400">First published {firstSeen}</p>
        )}
      </div>
    </section>
  );
}
