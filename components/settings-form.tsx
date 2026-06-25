"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Feed } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  getFeedClient,
  updateFeed,
  updateUserProfile,
  uploadPublicImage,
} from "@/lib/db/client";
import { CATEGORIES, MAX_IMAGE_BYTES } from "@/lib/constants";

export function SettingsForm() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [feed, setFeed] = useState<Feed | null>(null);
  const [feedName, setFeedName] = useState("");
  const [feedCategory, setFeedCategory] = useState<string>(CATEGORIES[0]);
  const [about, setAbout] = useState("");
  // RequireAuth guarantees `profile` is loaded before this form mounts.
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getFeedClient(user.uid).then((f) => {
      if (!f) return;
      setFeed(f);
      setFeedName(f.feedName);
      setFeedCategory(f.feedCategory || CATEGORIES[0]);
      setAbout(f.about);
      setAvatar(f.profileImageURL);
      setBanner(f.backgroundImageURL);
    });
  }, [user]);

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "avatar" | "banner",
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }
    setError("");
    const url = await uploadPublicImage(user.uid, file, kind);
    if (kind === "avatar") setAvatar(url);
    else setBanner(url);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateFeed(user.uid, {
        feedName: feedName.trim(),
        feedCategory,
        about: about.trim(),
        profileImageURL: avatar,
        backgroundImageURL: banner,
      });
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        photoURL: avatar,
        backgroundImageURL: banner,
        about: about.trim(),
      });
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!feed) {
    return <p className="text-zinc-500">Loading your feed…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div
        className="relative h-40 rounded-xl bg-cover bg-center"
        style={
          banner
            ? { backgroundImage: `url(${banner})` }
            : { background: "linear-gradient(135deg,#fce7f0,#fbcfe8)" }
        }
      >
        <label className="absolute right-3 top-3 cursor-pointer rounded bg-black/60 px-3 py-1 text-xs text-white">
          Change banner
          <input
            type="file"
            accept="image/*"
            onChange={(e) => upload(e, "banner")}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-zinc-200">
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <label className="btn-secondary cursor-pointer">
          Change avatar
          <input
            type="file"
            accept="image/*"
            onChange={(e) => upload(e, "avatar")}
            className="hidden"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Feed name</span>
        <input
          value={feedName}
          onChange={(e) => setFeedName(e.target.value)}
          className="input"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Primary category</span>
        <select
          value={feedCategory}
          onChange={(e) => setFeedCategory(e.target.value)}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">About</span>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={4}
          className="input"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved!</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
