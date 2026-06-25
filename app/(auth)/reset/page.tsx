"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/auth-errors";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Reset password</h1>
      {sent ? (
        <p className="mt-4 text-sm text-zinc-600">
          If an account exists for <strong>{email}</strong>, a reset link is on
          its way. Check your inbox.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
