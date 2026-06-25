"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getUser, updateUser } from "@/lib/db/users";
import { getFeed, updateFeed } from "@/lib/db/feeds";
import { ImageUploader } from "@/components/ImageUploader";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [profileImageURL, setProfileImageURL] = useState("");
  const [backgroundImageURL, setBackgroundImageURL] = useState("");
  const [feedName, setFeedName] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUser(user.uid), getFeed(user.uid)]).then(([u, f]) => {
      if (u) {
        setDisplayName(u.displayName);
        setProfileImageURL(u.profileImageURL);
        setBackgroundImageURL(u.backgroundImageURL);
      }
      if (f) {
        setFeedName(f.name);
        setCoverImageURL(f.coverImageURL);
      }
      setReady(true);
    });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    try {
      await Promise.all([
        updateUser(user.uid, { displayName, profileImageURL, backgroundImageURL }),
        updateFeed(user.uid, { name: feedName, coverImageURL }),
      ]);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !ready) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={save} className="space-y-6">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Profile</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Profile image</label>
            {profileImageURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImageURL} alt="" className="mb-2 h-20 w-20 rounded-full object-cover" />
            )}
            <ImageUploader folder="profile" aspect={1} label="Change avatar" onUploaded={setProfileImageURL} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Background image</label>
            <ImageUploader folder="background" aspect={3} label="Change background" onUploaded={setBackgroundImageURL} />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Your wire</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Wire name</label>
            <input
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cover image</label>
            {coverImageURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageURL} alt="" className="mb-2 h-28 w-full rounded object-cover" />
            )}
            <ImageUploader folder="feeds" label="Change cover" onUploaded={setCoverImageURL} />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/profile/${user.uid}`)}
            className="text-sm text-slate-600 hover:underline"
          >
            View profile
          </button>
          {saved && <span className="text-sm text-green-700">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}
