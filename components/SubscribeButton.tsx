"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getIdToken } from "@/lib/firebase/token";
import { hasActiveSubscription } from "@/lib/db/subscriptions";
import { formatPrice } from "@/lib/licenses";

// Subscribe to a creator's feed (recurring). Used on the feed header and inline
// on gated post pages. Price is monthly; checkout runs server-side in Stripe
// `subscription` mode. Mirrors PostActions' buy flow.
export function SubscribeButton({
  creatorUid,
  priceCents,
  variant = "primary",
}: {
  creatorUid: string;
  priceCents: number;
  variant?: "primary" | "secondary";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (user && user.uid !== creatorUid) {
      hasActiveSubscription(user.uid, creatorUid).then(setSubscribed);
    }
  }, [user, creatorUid]);

  // The owner never subscribes to their own feed.
  if (user?.uid === creatorUid) return null;

  async function subscribe() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await getIdToken();
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ creatorUid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Subscription failed");
      setBusy(false);
    }
  }

  if (subscribed) {
    return (
      <span className="inline-flex items-center rounded bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
        Subscribed ✓
      </span>
    );
  }

  const label = `Subscribe — ${formatPrice(priceCents)}/mo`;

  if (variant === "secondary") {
    return (
      <div>
        <button
          onClick={subscribe}
          disabled={busy}
          className="text-sm font-medium text-blue-700 hover:underline disabled:opacity-50"
        >
          {busy ? "Redirecting…" : `or ${label}`}
        </button>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={subscribe}
        disabled={busy}
        className="rounded bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-50"
      >
        {busy ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
