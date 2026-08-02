"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useAuth } from "@/lib/firebase/auth";
import { createPost, updatePost, type PostInput } from "@/lib/db/posts";
import { addResponse } from "@/lib/db/requests";
import { getUser } from "@/lib/db/users";
import { getDeliverableUrl, setDeliverableUrl } from "@/lib/db/postSecrets";
import { uploadGatedAsset } from "@/lib/storage";
import { LICENSE_LIST, isGated } from "@/lib/licenses";
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

// Default type tag per format, so Types is an optional refinement rather than
// a second required decision that mostly restates Format (photographer-in-a-
// hurry friction).
const FORMAT_DEFAULT_TYPE: Record<PostFormat, string> = {
  Article: "Article",
  Investigation: "Article",
  Dataset: "Dataset",
  Document: "Document",
  "Photo set": "Photo",
  Video: "Video",
  Audio: "Media",
};

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
    // No biased default — the author must pick a topic (validated on submit).
    category: "" as Category,
    format: "Article",
    types: [],
    breaking: false,
    coverImage: "",
    mainUrl: "",
    embed: null,
    imageURLs: [],
    assetPath: null,
    assetName: null,
    hasExternalDeliverable: false,
    csvPreview: null,
    previewText: "",
    freePreviewRows: 5,
    sources: [],
    derivedFrom: [],
    requestId: "",
  };
}

// `requestId` links a brand-new post to the bounty it's created for
// (arrives via /posts/new?requestId=…): it's stamped on the post as
// provenance and the post is auto-offered as a response on publish.
export function PostForm({
  existing,
  requestId,
}: {
  existing?: PostDoc;
  requestId?: string;
}) {
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
          hasExternalDeliverable: existing.hasExternalDeliverable,
          csvPreview: existing.csvPreview,
          previewText: existing.previewText,
          freePreviewRows: existing.freePreviewRows,
          sources: existing.sources,
          derivedFrom: existing.derivedFrom,
          requestId: existing.requestId,
        }
      : { ...emptyInput(), requestId: requestId ?? "" },
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  // External deliverable link (buyers only). Lives in postSecrets, not on the
  // world-readable post doc — see lib/db/postSecrets.ts.
  const [deliverableUrl, setDeliverableUrlState] = useState("");
  const [derivedText, setDerivedText] = useState(
    existing?.derivedFrom.join("\n") ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Prefill the seller-private deliverable link when editing (owner-only read).
  useEffect(() => {
    if (existing?.hasExternalDeliverable) {
      getDeliverableUrl(existing.id).then(setDeliverableUrlState);
    }
  }, [existing]);

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
    if (!form.category) {
      setError("Pick a category.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const trimmedLink = deliverableUrl.trim();
      // Drop blank source rows; default Types from Format when left empty
      // (Types is an optional refinement, not a second required decision).
      const cleaned: PostInput = {
        ...form,
        types:
          form.types.length > 0 ? form.types : [FORMAT_DEFAULT_TYPE[form.format]],
        sources: form.sources.filter((s) => s.url.trim()),
        hasExternalDeliverable: Boolean(trimmedLink),
      };
      // Create first (need the id for the asset path), then upload + patch.
      const postId = existing
        ? existing.id
        : await createPost(user.uid, cleaned);

      // Seller-private deliverable link — written to postSecrets AFTER the
      // post exists (the create rule verifies post ownership).
      if (trimmedLink || existing?.hasExternalDeliverable) {
        await setDeliverableUrl(postId, user.uid, trimmedLink);
      }

      let patch: Partial<PostInput> = cleaned;
      const gatedFile = form.format === "Dataset" ? csvFile : assetFile;
      if (gatedFile) {
        const assetPath = await uploadGatedAsset(gatedFile, user.uid, postId);
        patch = { ...patch, assetPath, assetName: gatedFile.name };
      }
      await updatePost(postId, patch);

      // Created for a bounty → auto-offer it as a response (one per user;
      // re-publishing revises the offer). The post stays on the open
      // market regardless of whether the requester picks it.
      if (!existing && cleaned.requestId) {
        const profile = await getUser(user.uid);
        await addResponse({
          requestId: cleaned.requestId,
          responderUid: user.uid,
          responderName: profile?.displayName ?? user.email ?? "Anon",
          postId,
          postTitle: cleaned.title,
          note: "Created for this bounty.",
        });
      }

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
            <option value="" disabled>
              Choose a topic…
            </option>
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
        <label className="mb-1 block text-sm font-medium">
          Types <span className="font-normal text-slate-400">(optional — defaults from format)</span>
        </label>
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
        <label className="mb-1 block text-sm font-medium">
          Public link{" "}
          <span className="font-normal text-slate-400">(shown to everyone)</span>
        </label>
        <input
          value={form.mainUrl}
          onChange={(e) => set("mainUrl", e.target.value)}
          onBlur={fetchEmbed}
          placeholder="https://…"
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          Visible before purchase — never put paid content here. For a paid
          deliverable, use the buyers-only link below.
        </p>
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

      {isGated(form.license) && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Deliverable link{" "}
            <span className="font-normal text-slate-400">(buyers only)</span>
          </label>
          <input
            value={deliverableUrl}
            onChange={(e) => setDeliverableUrlState(e.target.value)}
            placeholder="https://wetransfer.com/… or Drive, Dropbox, …"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">
            Revealed only after purchase — ideal for a full catalogue too big to
            upload here. Heads up: transfer links can expire; prefer a
            long-lived link (Drive/Dropbox).
          </p>
        </div>
      )}

      {isGated(form.license) && (
        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium">Preview before purchase</legend>
          <p className="text-sm text-slate-600">
            Decide what buyers can sample before paying. The full file stays gated.
          </p>
          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Teaser / summary shown to non-buyers (optional)
            </label>
            <textarea
              value={form.previewText}
              onChange={(e) => set("previewText", e.target.value)}
              rows={3}
              placeholder="A short summary that entices a purchase…"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {form.format === "Dataset" && (
            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Free preview rows (how many dataset rows non-buyers see)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.freePreviewRows}
                onChange={(e) =>
                  set("freePreviewRows", Math.max(0, Number(e.target.value) || 0))
                }
                className="w-28 rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}
        </fieldset>
      )}

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
