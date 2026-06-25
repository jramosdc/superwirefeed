"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useAuth } from "@/lib/firebase/auth";
import { createPost, updatePost, type PostInput } from "@/lib/db/posts";
import { uploadGatedAsset } from "@/lib/storage";
import { LICENSE_LIST } from "@/lib/licenses";
import { CATEGORIES } from "@/types";
import type { Category, LicenseKey, PostDoc, EmbedPreview } from "@/types";
import { RichEditor } from "./RichEditor";
import { ImageUploader } from "./ImageUploader";

const TYPE_OPTIONS = ["Article", "Dataset", "Media", "Photo", "Video", "Document"];

function emptyInput(): PostInput {
  return {
    title: "",
    detailHtml: "",
    license: "CC_BY",
    category: "News",
    types: [],
    breaking: false,
    coverImage: "",
    mainUrl: "",
    embed: null,
    imageURLs: [],
    assetPath: null,
    assetName: null,
    csvPreview: null,
  };
}

export function PostForm({ existing }: { existing?: PostDoc }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<PostInput>(
    existing
      ? {
          title: existing.title,
          detailHtml: existing.detailHtml,
          license: existing.license,
          category: existing.category,
          types: existing.types,
          breaking: existing.breaking,
          coverImage: existing.coverImage,
          mainUrl: existing.mainUrl,
          embed: existing.embed,
          imageURLs: existing.imageURLs,
          assetPath: existing.assetPath,
          assetName: existing.assetName,
          csvPreview: existing.csvPreview,
        }
      : emptyInput(),
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleType(t: string) {
    setForm((f) => ({
      ...f,
      types: f.types.includes(t)
        ? f.types.filter((x) => x !== t)
        : [...f.types, t],
    }));
  }

  // Parse the CSV client-side for the preview table (papaparse, as before).
  function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("CSV must be 1MB or smaller.");
      return;
    }
    setCsvFile(file);
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (res) => set("csvPreview", res.data.slice(0, 50)),
    });
  }

  // Fetch a server-side link preview for the embedded URL.
  async function fetchEmbed() {
    if (!form.mainUrl) return;
    try {
      const res = await fetch(`/api/embed?url=${encodeURIComponent(form.mainUrl)}`);
      if (res.ok) set("embed", (await res.json()) as EmbedPreview);
    } catch {
      /* preview is best-effort */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.types.length === 0) {
      setError("Pick at least one type.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Create first (need the id for the asset path), then upload + patch.
      const postId = existing
        ? existing.id
        : await createPost(user.uid, form);

      let patch: Partial<PostInput> = form;
      if (csvFile) {
        const assetPath = await uploadGatedAsset(csvFile, user.uid, postId);
        patch = { ...patch, assetPath, assetName: csvFile.name };
      }
      await updatePost(postId, patch);

      router.push(`/posts/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Body</label>
        <RichEditor value={form.detailHtml} onChange={(html) => set("detailHtml", html)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">License</label>
          <select
            value={form.license}
            onChange={(e) => set("license", e.target.value as LicenseKey)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {LICENSE_LIST.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Types</label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1 text-sm ${
                form.types.includes(t)
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-300 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.breaking}
          onChange={(e) => set("breaking", e.target.checked)}
        />
        Mark as breaking
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium">Cover image</label>
        {form.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.coverImage} alt="" className="mb-2 h-32 rounded object-cover" />
        )}
        <ImageUploader
          folder="posts"
          label={form.coverImage ? "Replace cover" : "Add cover"}
          onUploaded={(url) => set("coverImage", url)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Embed a link</label>
        <input
          value={form.mainUrl}
          onChange={(e) => set("mainUrl", e.target.value)}
          onBlur={fetchEmbed}
          placeholder="https://…"
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {form.embed && (
          <p className="mt-1 text-sm text-slate-500">Preview: {form.embed.title}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Dataset (CSV, max 1MB) — the gated downloadable file
        </label>
        <input type="file" accept=".csv" onChange={onCsv} />
        {form.csvPreview && (
          <p className="mt-1 text-sm text-slate-500">
            {form.csvPreview.length} preview rows parsed.
          </p>
        )}
        {existing?.assetName && !csvFile && (
          <p className="mt-1 text-sm text-slate-500">Current file: {existing.assetName}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {busy ? "Saving…" : existing ? "Save changes" : "Publish post"}
      </button>
    </form>
  );
}
