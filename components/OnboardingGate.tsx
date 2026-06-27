"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";

// Routes a signed-in user who hasn't finished onboarding to the wizard.
const EXEMPT = ["/onboarding", "/login", "/register", "/reset", "/verify"];

export function OnboardingGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  // Once a user is known onboarded they never un-onboard, so we cache it and
  // stop reading. Without this the gate would re-query on every navigation.
  const knownOnboarded = useRef(false);

  // Re-resolve on user OR route change. Re-resolving on route change is what
  // breaks the post-onboarding redirect loop: after the wizard writes
  // onboarded:true and navigates to the feed, the gate would otherwise keep a
  // stale `false` and bounce the user back to /onboarding forever.
  useEffect(() => {
    if (!user) {
      knownOnboarded.current = false;
      setOnboarded(null);
      return;
    }
    if (knownOnboarded.current) {
      setOnboarded(true);
      return;
    }
    let active = true;
    // Hold redirects (null) until a fresh read resolves for this route, so we
    // never act on a stale value mid-navigation.
    setOnboarded(null);
    getUser(user.uid)
      .then((u) => {
        if (!active) return;
        const ob = u ? !!u.onboarded : false;
        if (ob) knownOnboarded.current = true;
        setOnboarded(ob);
      })
      // Fail open: a transient/denied read must never trap the user in a loop.
      .catch(() => {
        if (active) setOnboarded(true);
      });
    return () => {
      active = false;
    };
  }, [user, pathname]);

  useEffect(() => {
    if (loading || !user || onboarded === null || onboarded) return;
    if (!EXEMPT.some((p) => pathname.startsWith(p))) {
      router.replace("/onboarding");
    }
  }, [loading, user, onboarded, pathname, router]);

  return null;
}
