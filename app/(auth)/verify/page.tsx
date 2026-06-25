"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import { AuthCard } from "@/components/AuthCard";

export default function VerifyPage() {
  const { user, resendVerification } = useAuth();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      await resendVerification();
      setMsg("Verification email sent.");
    } catch {
      setMsg("Could not send — try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      router.push("/feeds");
    } else {
      setMsg("Not verified yet. Click the link in your email, then check again.");
    }
    setBusy(false);
  }

  return (
    <AuthCard title="Verify your email">
      <p className="text-sm text-slate-700">
        We sent a verification link to{" "}
        <strong>{user?.email ?? "your email"}</strong>. Verify to start publishing
        and buying.
      </p>
      {msg && <p className="mt-3 text-sm text-blue-700">{msg}</p>}
      <div className="mt-5 flex gap-3">
        <button
          onClick={refresh}
          disabled={busy}
          className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          I&apos;ve verified
        </button>
        <button
          onClick={resend}
          disabled={busy}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
        >
          Resend email
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        <Link href="/feeds" className="hover:text-blue-700">
          Browse in the meantime
        </Link>
      </p>
    </AuthCard>
  );
}
