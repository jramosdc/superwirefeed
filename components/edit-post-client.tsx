"use client";

import type { Post } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { RequireAuth } from "@/components/require-auth";
import { PostForm } from "@/components/post-form";

export function EditPostClient({ post }: { post: Post }) {
  return (
    <RequireAuth>
      <OwnerOnly post={post} />
    </RequireAuth>
  );
}

function OwnerOnly({ post }: { post: Post }) {
  const { user } = useAuth();
  if (user && user.uid !== post.owner.uid) {
    return (
      <p className="py-16 text-center text-zinc-500">
        You can only edit your own posts.
      </p>
    );
  }
  return <PostForm existing={post} />;
}
