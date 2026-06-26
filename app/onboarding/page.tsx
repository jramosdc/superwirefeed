"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getUser, updateUser } from "@/lib/db/users";
import { getFeed, updateFeed } from "@/lib/db/feeds";
import { CATEGORIES } from "@/types";

const INTERESTS = [
  "News",
  "Marketing",
  "Research",
  "Data",
  "Design",
  "Visuals",
  "Technology",
];

const STEPS = ["Interests", "Wire name", "Category", "About"];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [wireName, setWireName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Guard + prefill. If already onboarded, leave.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/register");
      return;
    }
    let active = true;
    Promise.all([getUser(user.uid), getFeed(user.uid)]).then(([u, f]) => {
      if (!active) return;
      if (u?.onboarded) {
        router.replace(`/feeds/${user.uid}`);
        return;
      }
      if (u?.interests?.length) setInterests(u.interests);
      if (f?.name) setWireName(f.name);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [user, loading, router]);

  if (loading || !ready) {
    return <p className="text-slate-500">Loading…</p>;
  }

  function toggleInterest(i: string) {
    setInterests((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i],
    );
  }

  function next() {
    if (step === 1 && !wireName.trim()) {
      setError("Please name your wire.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function finish() {
    if (!user) return;
    if (!wireName.trim()) {
      setError("Please name your wire.");
      setStep(1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await Promise.all([
        updateUser(user.uid, {
          interests,
          about: about.trim(),
          onboarded: true,
        }),
        updateFeed(user.uid, {
          name: wireName.trim(),
          category,
          about: about.trim(),
        }),
      ]);
      router.replace(`/feeds/${user.uid}`);
    } catch {
      setError("Could not save. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            title={label}
            className={`h-2 w-10 rounded-full ${
              i <= step ? "bg-blue-700" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold">What are you into?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a few topics to personalize your experience.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    interests.includes(i)
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">Name your wire</h2>
            <p className="mt-1 text-sm text-slate-500">
              This is your public wire service name.
            </p>
            <input
              autoFocus
              value={wireName}
              onChange={(e) => setWireName(e.target.value)}
              placeholder="e.g. Capitol Dispatch"
              className="mt-4 w-full rounded border border-slate-300 px-3 py-2"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">Primary category</h2>
            <p className="mt-1 text-sm text-slate-500">
              What will you mostly publish?
            </p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-4 w-full rounded border border-slate-300 px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">Tell buyers about you</h2>
            <p className="mt-1 text-sm text-slate-500">
              A short bio that builds trust with potential buyers.
            </p>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="Independent journalist covering local government…"
              className="mt-4 w-full rounded border border-slate-300 px-3 py-2"
            />
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            className={`rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 ${
              step === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={busy}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create my wire"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
