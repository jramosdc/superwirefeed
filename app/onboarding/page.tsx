"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { createUserAndFeed } from "@/lib/db/client";
import { CATEGORIES, INTERESTS } from "@/lib/constants";

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [feedName, setFeedName] = useState("");
  const [feedCategory, setFeedCategory] = useState<string>(CATEGORIES[0]);
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Guard: must be signed in; if onboarding already done, leave.
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/register");
    else if (profile) router.replace(`/feeds/${user.uid}`);
  }, [loading, user, profile, router]);

  if (loading || !user || profile) {
    return <p className="px-4 py-16 text-center text-zinc-500">Loading…</p>;
  }

  function toggleInterest(i: string) {
    setInterests((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i],
    );
  }

  const steps = ["Interests", "Feed name", "Category", "About"];

  function next() {
    if (step === 1 && !feedName.trim()) {
      setError("Please name your feed.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    if (!feedName.trim()) {
      setError("Please name your feed.");
      setStep(1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createUserAndFeed(user!, {
        feedName: feedName.trim(),
        feedCategory,
        about: about.trim(),
        interests,
      });
      router.replace(`/feeds/${user!.uid}`);
    } catch {
      setError("Could not create your feed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Step dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`h-2 w-10 rounded-full ${
              i <= step ? "bg-brand" : "bg-zinc-200"
            }`}
            title={label}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold">What are you into?</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Pick a few topics to personalize your feed.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    interests.includes(i)
                      ? "border-brand bg-brand text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
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
            <h2 className="text-xl font-bold">Name your feed</h2>
            <p className="mt-1 text-sm text-zinc-500">
              This is your public wire service name.
            </p>
            <input
              autoFocus
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              placeholder="e.g. Capitol Dispatch"
              className="input mt-5"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">Primary category</h2>
            <p className="mt-1 text-sm text-zinc-500">
              What kind of content will you mostly publish?
            </p>
            <select
              value={feedCategory}
              onChange={(e) => setFeedCategory(e.target.value)}
              className="input mt-5"
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
            <p className="mt-1 text-sm text-zinc-500">
              A short bio that builds trust with potential buyers.
            </p>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="Independent journalist covering local government…"
              className="input mt-5"
            />
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn-secondary disabled:invisible"
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary">
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? "Creating…" : "Create my feed"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
