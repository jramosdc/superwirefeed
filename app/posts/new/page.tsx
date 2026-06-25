"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";
import { PostForm } from "@/components/PostForm";

export default function NewPostPage() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New post</h1>
      <PostForm />
    </div>
  );
}
