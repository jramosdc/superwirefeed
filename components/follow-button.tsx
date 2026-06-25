"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { isFollowing, toggleFollow } from "@/lib/db/client";

export function FollowButton({ targetUid }: { targetUid: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.uid === targetUid) return;
    let active = true;
    isFollowing(user.uid, targetUid).then((f) => {
      if (active) setFollowing(f);
    });
    return () => {
      active = false;
    };
  }, [user, targetUid]);

  // Don't show a follow button on your own feed.
  if (user && user.uid === targetUid) return null;

  async function onClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const now = await toggleFollow(user.uid, targetUid);
      setFollowing(now);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={following ? "btn-secondary" : "btn-primary"}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
