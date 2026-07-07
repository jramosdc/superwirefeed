"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { PostForm } from "@/components/PostForm";

// Reads ?requestId=… (arriving from a bounty's "create a new post for this
// bounty" link) and threads it into the form as provenance.
function NewPostForm() {
  const requestId = useSearchParams().get("requestId") ?? undefined;
  return <PostForm requestId={requestId} />;
}

export default function NewPostPage() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New post</h1>
      <Suspense>
        <NewPostForm />
      </Suspense>
    </div>
  );
}
