"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { isFollowing, toggleFollow } from "@/lib/db/follows";

export function FollowButton({ targetUid }: { targetUid: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && user.uid !== targetUid) {
      isFollowing(user.uid, targetUid).then(setFollowing);
    }
  }, [user, targetUid]);

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
      className={`rounded px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
        following
          ? "border border-slate-300 bg-white hover:bg-slate-100"
          : "bg-blue-700 text-white hover:bg-blue-800"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
