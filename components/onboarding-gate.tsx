"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

// Routes a signed-in user who hasn't finished onboarding to the wizard.
const EXEMPT = ["/onboarding", "/login", "/register", "/reset"];

export function OnboardingGate() {
  const { needsOnboarding } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (needsOnboarding && !EXEMPT.some((p) => pathname.startsWith(p))) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, pathname, router]);

  return null;
}
