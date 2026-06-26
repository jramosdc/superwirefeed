"use client";

import { useEffect, useState } from "react";
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

  // Resolve onboarding status whenever the signed-in user changes.
  useEffect(() => {
    if (!user) {
      setOnboarded(null);
      return;
    }
    let active = true;
    getUser(user.uid).then((u) => {
      if (active) setOnboarded(u ? !!u.onboarded : false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (loading || !user || onboarded === null || onboarded) return;
    if (!EXEMPT.some((p) => pathname.startsWith(p))) {
      router.replace("/onboarding");
    }
  }, [loading, user, onboarded, pathname, router]);

  return null;
}
