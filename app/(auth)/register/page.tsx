"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/auth-errors";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Fire-and-forget verification email (parity with old app).
      sendEmailVerification(cred.user).catch(() => {});
      router.push("/onboarding");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Start your feed</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create an account to publish and sell your content.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
