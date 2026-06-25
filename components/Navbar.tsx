"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/feeds");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/feeds" className="text-xl font-bold tracking-tight text-blue-700">
          SuperWire
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/feeds" className="hover:text-blue-700">
            Browse
          </Link>
          {user && (
            <>
              <Link href="/following" className="hover:text-blue-700">
                Following
              </Link>
              <Link href="/posts/new" className="hover:text-blue-700">
                New post
              </Link>
              <Link href={`/profile/${user.uid}`} className="hover:text-blue-700">
                Profile
              </Link>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className="hover:text-blue-700">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded bg-blue-700 px-3 py-1.5 font-medium text-white hover:bg-blue-800"
              >
                Sign up
              </Link>
            </>
          )}

          {!loading && user && (
            <button
              onClick={handleLogout}
              className="rounded border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100"
            >
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
