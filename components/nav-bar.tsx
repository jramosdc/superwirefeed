"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";

export function NavBar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  async function handleSignOut() {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/feeds?q=${encodeURIComponent(q.trim())}` : "/feeds");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight">
          super<span className="text-brand">wire</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 sm:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search feeds…"
            className="w-full max-w-sm rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/feeds" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Feeds
          </Link>

          {!loading && user && (
            <>
              <Link
                href="/following"
                className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline"
              >
                Following
              </Link>
              <Link
                href="/posts/new"
                className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                + New post
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-sm font-semibold"
                  aria-label="Account menu"
                >
                  {profile?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (profile?.displayName || user.email || "?").charAt(0).toUpperCase()
                  )}
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link
                      href={`/profile/${user.uid}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-zinc-50"
                    >
                      My profile
                    </Link>
                    <Link
                      href={`/feeds/${user.uid}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-zinc-50"
                    >
                      My feed
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
