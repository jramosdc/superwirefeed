import { NextResponse } from "next/server";
import type { EmbedPreview } from "@/types";

// Server-side link preview. Fetches the target page and scrapes OpenGraph/meta
// tags. Replaces the old client-side embedly integration (which shipped an API
// key to the browser). Best-effort: returns empty fields on failure.
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SuperWireBot/1.0 (+link-preview)" },
      signal: AbortSignal.timeout(6000),
    });
    const html = await res.text();

    const preview: EmbedPreview = {
      url,
      title: meta(html, "og:title") || tagText(html, "title") || url,
      description: meta(html, "og:description") || meta(html, "description") || "",
      imageURL: absolutize(meta(html, "og:image"), url),
      faviconURL: absolutize(findFavicon(html), url),
    };
    return NextResponse.json(preview);
  } catch {
    return NextResponse.json({
      url,
      title: url,
      description: "",
      imageURL: "",
      faviconURL: "",
    } satisfies EmbedPreview);
  }
}

function meta(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRe(key)}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRe(key)}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return decode(m[1]);
  }
  return "";
}

function tagText(html: string, tag: string): string {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return m ? decode(m[1].trim()) : "";
}

function findFavicon(html: string): string {
  const m = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

function absolutize(maybeUrl: string, base: string): string {
  if (!maybeUrl) return "";
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return "";
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
