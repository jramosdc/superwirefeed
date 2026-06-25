import { notFound } from "next/navigation";
import { getPost } from "@/lib/db/server";
import { EditPostClient } from "@/components/edit-post-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit post — SuperWire" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPost(postId).catch(() => null);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit post</h1>
      <EditPostClient post={post} />
    </div>
  );
}
