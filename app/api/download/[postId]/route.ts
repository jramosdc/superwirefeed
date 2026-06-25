import { NextResponse } from "next/server";
import { getUidFromRequest } from "@/lib/server-auth";
import { getPost, hasPurchased } from "@/lib/db/server";
import { getLicense } from "@/lib/licenses";
import { adminStorage } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// Serves a gated asset by returning a short-lived signed URL — but only after
// verifying the requester is entitled to it (free license, owner, or buyer).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("file");
  if (!filePath) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const post = await getPost(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // The requested path must be one of the post's own gated assets.
  const allowed = new Set<string>([
    ...(post.csvFile ? [post.csvFile.storagePath] : []),
    ...post.pdfFiles.map((f) => f.storagePath),
  ]);
  if (!allowed.has(filePath)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const license = getLicense(post.license);
  if (license.paid) {
    const uid = await getUidFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const entitled = uid === post.owner.uid || (await hasPurchased(uid, postId));
    if (!entitled) {
      return NextResponse.json(
        { error: "Purchase required" },
        { status: 402 },
      );
    }
  }

  try {
    const [url] = await adminStorage
      .bucket()
      .file(filePath)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 },
    );
  }
}
