import {
  addDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { CommentDoc } from "@/types";

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

// comments/{postId}/items/{id}
export async function addComment(
  postId: string,
  input: { authorUid: string; authorName: string; text: string },
): Promise<void> {
  await addDoc(collection(db, "comments", postId, "items"), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function listComments(postId: string): Promise<CommentDoc[]> {
  const q = query(
    collection(db, "comments", postId, "items"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CommentDoc, "id">),
    createdAt: tsToMillis(d.data().createdAt),
  }));
}
