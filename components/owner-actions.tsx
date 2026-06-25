"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";

// Renders feed-management actions only for the feed's owner.
export function OwnerActions({ ownerUid }: { ownerUid: string }) {
  const { user } = useAuth();
  if (!user || user.uid !== ownerUid) return null;
  return (
    <>
      <Link href="/posts/new" className="btn-primary">
        New post
      </Link>
      <Link href="/settings/feed" className="btn-secondary">
        Edit feed
      </Link>
    </>
  );
}
