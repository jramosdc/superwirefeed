"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useAuth } from "@/lib/firebase/auth";
import { createPost, updatePost, type PostInput } from "@/lib/db/posts";
import { uploadGatedAsset } from "@/lib/storage";
import { LICENSE_LIST } from "@/lib/licenses";
import { CATEGORIES, FORMATS } from "@/types";
import type {
  Category,
  LicenseKey,
  PostDoc,
  PostFormat,
  EmbedPreview,
  SourceRef,
} from "@/types";

const MAX_ASSET_BYTES = 25 * 1024 * 1024; // 25 MB for non-CSV deliverables
import { RichEditor } from "./RichEditor";
import { ImageUploader } from "./ImageUploader";

const TYPE_OPTIONS = ["Article", "Dataset", "Media", "Photo", "Video", "Document"];
const SOURCE_KINDS: SourceRef["kind"][] = ["primary", "data", "reporting", "other"];

// Extract a post id from a pasted /posts/<id> URL, or accept a raw id.
function parseDerivedFrom(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/posts\/([^/?#]+)/);
      return m ? m[1] : s;
    });
}

function emptyInput(): PostInput {
  return {
    title: "",
    detailHtml: "",
    license: "CC_BY",
    category: "Breaking News",
    format: "Article",
    types: [],
    breaking: false,
    coverImage: "",
    mainUrl: "",
    embed: null,
    imageURLs: [],
    assetPath: null,
    assetName: null,
    csvPreview: null,
    sources: [],
    derivedFrom: [],
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
          format: existing.format,
          types: existing.types,
          breaking: existing.breaking,
          coverImage: existing.coverImage,
          mainUrl: existing.mainUrl,
          embed: existing.embed,
          imageURLs: existing.imageURLs,
          assetPath: existing.assetPath,
          assetName: existing.assetName,
          csvPreview: existing.csvPreview,
          sources: existing.sources,
          derivedFrom: existing.derivedFrom,
        }
      : emptyInput(),
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [derivedText, setDerivedText] = useState(
    existing?.derivedFrom.join("\n") ?? "",
  );
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

  function addSource() {
    setForm((f) => ({
      ...f,
      sources: [...f.sources, { url: "", label: "", kind: "primary" }],
    }));
  }
  function updateSource(i: number, patch: Partial<SourceRef>) {
    setForm((f) => ({
      ...f,
      sources: f.sources.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }
  function removeSource(i: number) {
    setForm((f) => ({ ...f, sources: f.sources.filter((_, idx) => idx !== i) }));
  }

  function onDerivedChange(text: string) {
    setDerivedText(text);
    set("derivedFrom", parseDerivedFrom(text));
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

  // Generic gated deliverable (PDF, image pack, video, audio…) for non-CSV formats.
  function onAssetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ASSET_BYTES) {
      setError("File must be 25MB or smaller.");
      return;
    }
    setError("");
    setAssetFile(file);
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
      // Drop blank source rows before saving.
      const cleaned: PostInput = {
        ...form,
        sources: form.sources.filter((s) => s.url.trim()),
      };
      // Create first (need the id for the asset path), then upload + patch.
      const postId = existing
        ? existing.id
        : await createPost(user.uid, cleaned);

      let patch: Partial<PostInput> = cleaned;
      const gatedFile = form.format === "Dataset" ? csvFile : assetFile;
      if (gatedFile) {
        const assetPath = await uploadGatedAsset(gatedFile, user.uid, postId);
        patch = { ...patch, assetPath, assetName: gatedFile.name };
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

      <div className="grid gap-4 sm:grid-cols-3">
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
        <div>
          <label className="mb-1 block text-sm font-medium">Format</label>
          <select
            value={form.format}
            onChange={(e) => set("format", e.target.value as PostFormat)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {FORMATS.map((f) => (
              <option key={f}>{f}</option>
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

      {form.format === "Dataset" ? (
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
            <p className="mt-1 text-sm text-slate-500">
              Current file: {existing.assetName}
            </p>
          )}
        </div>
      ) : form.format !== "Article" ? (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Deliverable file ({form.format}, max 25MB) — the gated download buyers
            receive
          </label>
          <input type="file" onChange={onAssetFile} />
          {assetFile && (
            <p className="mt-1 text-sm text-slate-500">Selected: {assetFile.name}</p>
          )}
          {existing?.assetName && !assetFile && (
            <p className="mt-1 text-sm text-slate-500">
              Current file: {existing.assetName}
            </p>
          )}
        </div>
      ) : null}

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium">Provenance</legend>

        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Sources — where this information came from.
          </p>
          {form.sources.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select
                value={s.kind}
                onChange={(e) =>
                  updateSource(i, { kind: e.target.value as SourceRef["kind"] })
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              >
                {SOURCE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input
                value={s.label}
                onChange={(e) => updateSource(i, { label: e.target.value })}
                placeholder="Label"
                className="w-32 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                value={s.url}
                onChange={(e) => updateSource(i, { url: e.target.value })}
                placeholder="https://…"
                className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeSource(i)}
                className="text-sm text-red-600 hover:underline"
              >
                remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSource}
            className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            + Add source
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">
            Builds on — post links or IDs this work derives from (one per line)
          </label>
          <textarea
            value={derivedText}
            onChange={(e) => onDerivedChange(e.target.value)}
            rows={2}
            placeholder="https://…/posts/abc123"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </fieldset>

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
