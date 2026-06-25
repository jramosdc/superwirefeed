import { RequireAuth } from "@/components/require-auth";
import { PostForm } from "@/components/post-form";

export const metadata = { title: "New post — SuperWire" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New post</h1>
      <RequireAuth>
        <PostForm />
      </RequireAuth>
    </div>
  );
}
