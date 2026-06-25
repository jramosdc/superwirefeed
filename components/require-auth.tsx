"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/firebase/auth-context";

// Gates client pages that require a signed-in, onboarded user.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <p className="px-4 py-16 text-center text-zinc-500">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-zinc-600">You need an account to do that.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <p className="px-4 py-16 text-center text-zinc-500">
        Finishing account setup…
      </p>
    );
  }
  return <>{children}</>;
}
