"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { OnboardingGate } from "@/components/onboarding-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OnboardingGate />
      {children}
    </AuthProvider>
  );
}
