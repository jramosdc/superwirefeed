import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getIdToken } from "@/lib/firebase/token";
import type {
  CertificationDoc,
  CertificationKind,
  PostCertificationDoc,
} from "@/types";

// Certifications + AI flags are WRITTEN only by /api/certify and /api/moderate
// (Admin SDK). Clients read them here and act through the APIs.

function tsToMillis(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

function toSummary(d: Record<string, unknown> | undefined): PostCertificationDoc {
  return {
    authoredCount: (d?.authoredCount as number) ?? 0,
    curatedCount: (d?.curatedCount as number) ?? 0,
    aiFlagged: Boolean(d?.aiFlagged),
    aiFlagReason: (d?.aiFlagReason as string) ?? "",
    aiFlaggedBy: (d?.aiFlaggedBy as string) ?? "",
    updatedAt: tsToMillis(d?.updatedAt),
  };
}

export async function getPostCertification(
  postId: string,
): Promise<PostCertificationDoc | null> {
  const snap = await getDoc(doc(db, "postCertification", postId));
  return snap.exists() ? toSummary(snap.data()) : null;
}

export async function getMyCertification(
  uid: string,
  postId: string,
): Promise<CertificationDoc | null> {
  const snap = await getDoc(doc(db, "certifications", `${uid}_${postId}`));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as Omit<CertificationDoc, "id">),
    createdAt: tsToMillis(snap.data().createdAt),
  };
}

export async function listCertificationsForPost(
  postId: string,
): Promise<CertificationDoc[]> {
  const q = query(collection(db, "certifications"), where("postId", "==", postId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CertificationDoc, "id">),
      createdAt: tsToMillis(d.data().createdAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listCertificationMap(): Promise<
  Record<string, PostCertificationDoc>
> {
  const snap = await getDocs(collection(db, "postCertification"));
  const map: Record<string, PostCertificationDoc> = {};
  snap.docs.forEach((d) => {
    map[d.id] = toSummary(d.data());
  });
  return map;
}

export async function submitCertification(input: {
  postId: string;
  kind: CertificationKind;
  note?: string;
  certifierName?: string;
}): Promise<void> {
  const token = await getIdToken();
  const res = await fetch("/api/certify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error ?? "Failed to certify");
  }
}

export async function moderateAiFlag(input: {
  postId: string;
  aiFlagged: boolean;
  reason?: string;
}): Promise<void> {
  const token = await getIdToken();
  const res = await fetch("/api/moderate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error ?? "Failed to update flag");
  }
}
