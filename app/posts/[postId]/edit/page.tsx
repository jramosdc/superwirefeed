"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getPost } from "@/lib/db/posts";
import { PostForm } from "@/components/PostForm";
import type { PostDoc } from "@/types";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "missing">(
    "loading",
  );

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    getPost(postId).then((p) => {
      if (!p) return setState("missing");
      if (p.ownerUid !== user.uid) return setState("denied");
      setPost(p);
      setState("ready");
    });
  }, [postId, user, loading]);

  if (state === "loading") return <p className="text-slate-500">Loading…</p>;
  if (state === "missing") return <p className="text-slate-500">Post not found.</p>;
  if (state === "denied") {
    router.replace(`/posts/${postId}`);
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit post</h1>
      {post && <PostForm existing={post} />}
    </div>
  );
}
