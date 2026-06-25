"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import type { LinkEmbed, Post, PostFile } from "@/types";
import { LICENSE_LIST, type LicenseKey } from "@/lib/licenses";
import {
  CATEGORIES,
  CSV_PREVIEW_ROWS,
  MAX_CSV_BYTES,
  MAX_IMAGE_BYTES,
  POST_TYPES,
} from "@/lib/constants";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  createPost,
  getFeedOnce,
  updatePost,
  uploadGatedAsset,
  uploadPublicImage,
} from "@/lib/db/client";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { CoverImagePicker } from "@/components/editor/cover-image-picker";

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function PostForm({ existing }: { existing?: Post }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const isEdit = !!existing;
  const localId = useMemo(() => existing?.id ?? randomId(), [existing?.id]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [detail, setDetail] = useState(existing?.detail ?? "");
  const [priority, setPriority] = useState(existing?.priority ?? false);
  const [license, setLicense] = useState<LicenseKey>(existing?.license ?? "CC_BY");
  const [category, setCategory] = useState<string>(existing?.category ?? CATEGORIES[0]);
  const [types, setTypes] = useState<string[]>(existing?.types ?? []);
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [pdfFiles, setPdfFiles] = useState<PostFile[]>(existing?.pdfFiles ?? []);
  const [pdfLink, setPdfLink] = useState(existing?.pdfLink ?? "");
  const [csvFile, setCsvFile] = useState<PostFile | null>(existing?.csvFile ?? null);
  const [csvPreview, setCsvPreview] = useState<string[][]>(existing?.csvPreview ?? []);
  const [csvRowCount, setCsvRowCount] = useState(existing?.csvRowCount ?? 0);
  const [gsheetLink, setGsheetLink] = useState(existing?.gsheetLink ?? "");
  const [mainUrl, setMainUrl] = useState(existing?.mainUrl ?? "");
  const [embed, setEmbed] = useState<LinkEmbed | null>(existing?.embed ?? null);

  const [feedName, setFeedName] = useState(existing?.owner.feedName ?? "");
  const [uploading, setUploading] = useState(false);
  const [embedBusy, setEmbedBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !feedName) {
      getFeedOnce(user.uid).then((f) => f && setFeedName(f.feedName));
    }
  }, [user, feedName]);

  function toggleType(t: string) {
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(e.target.files)) {
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`"${file.name}" exceeds 10 MB and was skipped.`);
          continue;
        }
        const url = await uploadPublicImage(user.uid, file, "inline");
        setImages((cur) => [...cur, url]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onPdfs(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(e.target.files)) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          setError(`"${file.name}" is not a PDF and was skipped.`);
          continue;
        }
        const pf = await uploadGatedAsset(user.uid, localId, file);
        setPdfFiles((cur) => [...cur, pf]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a .csv file.");
      return;
    }
    if (file.size > MAX_CSV_BYTES) {
      setError("CSV must be 1 MB or smaller.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const rows = await new Promise<string[][]>((resolve, reject) => {
        Papa.parse<string[]>(file, {
          skipEmptyLines: true,
          complete: (r) => resolve(r.data as string[][]),
          error: reject,
        });
      });
      setCsvPreview(rows.slice(0, CSV_PREVIEW_ROWS));
      setCsvRowCount(rows.length);
      const pf = await uploadGatedAsset(user.uid, localId, file);
      setCsvFile(pf);
    } catch {
      setError("Could not read that CSV file.");
    } finally {
      setUploading(false);
    }
  }

  async function fetchEmbed() {
    if (!mainUrl.trim()) return;
    setEmbedBusy(true);
    try {
      const res = await fetch(`/api/embed?url=${encodeURIComponent(mainUrl.trim())}`);
      const data = await res.json();
      if (res.ok && data.url) setEmbed(data as LinkEmbed);
    } catch {
      /* preview is optional */
    } finally {
      setEmbedBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (types.length === 0) {
      setError("Please select at least one content type.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: title.trim(),
      detail,
      priority,
      license,
      category,
      types,
      coverImage,
      images,
      pdfFiles,
      pdfLink: pdfLink.trim(),
      csvFile,
      csvPreview,
      csvRowCount,
      gsheetLink: gsheetLink.trim(),
      mainUrl: mainUrl.trim(),
      embed,
      owner: {
        uid: user.uid,
        feedId: user.uid,
        feedName,
        photoURL: profile.photoURL,
      },
    };
    try {
      if (isEdit) {
        await updatePost(existing!.id, payload);
        router.push(`/posts/${existing!.id}`);
      } else {
        const id = await createPost(payload);
        router.push(`/posts/${id}`);
      }
      router.refresh();
    } catch {
      setError("Could not save the post. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A clear, specific headline"
          className="input text-lg"
        />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
          />
          Mark as <span className="font-semibold text-red-600">Breaking</span>
        </label>
      </Section>

      <Section title="Cover image">
        <CoverImagePicker value={coverImage} onChange={setCoverImage} />
      </Section>

      <Section title="Story">
        <RichTextEditor value={detail} onChange={setDetail} />
      </Section>

      <Section title="Content types" hint="Select all that apply">
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1 text-sm ${
                types.includes(t)
                  ? "border-brand bg-brand text-white"
                  : "border-zinc-300 bg-white hover:bg-zinc-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Section>
        <Section title="License & price">
          <select
            value={license}
            onChange={(e) => setLicense(e.target.value as LicenseKey)}
            className="input"
          >
            {LICENSE_LIST.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
                {l.paid ? ` ($${l.priceUsd})` : ""}
              </option>
            ))}
          </select>
        </Section>
      </div>

      <Section title="Inline images" hint="Shown in the post body (public)">
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-20 w-20 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((c) => c.filter((x) => x !== src))}
                  className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="btn-secondary cursor-pointer">
          Add images
          <input type="file" accept="image/*" multiple onChange={onImages} className="hidden" />
        </label>
      </Section>

      <Section title="Dataset (CSV)" hint="Gated — buyers download after purchase; max 1 MB">
        {csvFile && (
          <p className="mb-2 text-sm">
            ✓ {csvFile.name} — {csvRowCount.toLocaleString()} rows{" "}
            <button
              type="button"
              onClick={() => {
                setCsvFile(null);
                setCsvPreview([]);
                setCsvRowCount(0);
              }}
              className="text-red-600 hover:underline"
            >
              remove
            </button>
          </p>
        )}
        <label className="btn-secondary cursor-pointer">
          {csvFile ? "Replace CSV" : "Upload CSV"}
          <input type="file" accept=".csv" onChange={onCsv} className="hidden" />
        </label>
      </Section>

      <Section title="PDF documents" hint="Gated — buyers download after purchase">
        {pdfFiles.length > 0 && (
          <ul className="mb-2 space-y-1 text-sm">
            {pdfFiles.map((f) => (
              <li key={f.storagePath} className="flex items-center gap-2">
                ✓ {f.name}
                <button
                  type="button"
                  onClick={() =>
                    setPdfFiles((c) => c.filter((x) => x.storagePath !== f.storagePath))
                  }
                  className="text-red-600 hover:underline"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="btn-secondary cursor-pointer">
          Add PDFs
          <input type="file" accept="application/pdf" multiple onChange={onPdfs} className="hidden" />
        </label>
      </Section>

      <Section title="External links" hint="Optional source and supporting links">
        <div className="flex gap-2">
          <input
            value={mainUrl}
            onChange={(e) => setMainUrl(e.target.value)}
            placeholder="Source URL (https://…)"
            className="input flex-1"
          />
          <button type="button" onClick={fetchEmbed} disabled={embedBusy} className="btn-secondary">
            {embedBusy ? "…" : "Preview"}
          </button>
        </div>
        {embed && (
          <p className="mt-1 text-xs text-zinc-500">
            Preview attached: <span className="font-medium">{embed.title}</span>
          </p>
        )}
        <input
          value={gsheetLink}
          onChange={(e) => setGsheetLink(e.target.value)}
          placeholder="Linked spreadsheet URL (optional)"
          className="input mt-2"
        />
        <input
          value={pdfLink}
          onChange={(e) => setPdfLink(e.target.value)}
          placeholder="Linked PDF URL (optional)"
          className="input mt-2"
        />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Publish post"}
        </button>
        {uploading && <span className="text-sm text-zinc-500">Uploading files…</span>}
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2">
        <h3 className="font-semibold">{title}</h3>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
