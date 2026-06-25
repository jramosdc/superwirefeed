import { NextResponse } from "next/server";
import type { LinkEmbed } from "@/types";

export const runtime = "nodejs";

// Lightweight server-side link preview (replaces the old Embedly dependency).
// Fetches the page and extracts Open Graph / meta tags.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
    if (!/^https?:$/.test(target.protocol)) throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: { "User-Agent": "SuperWireBot/1.0 (+link-preview)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const meta = (prop: string) =>
      pick(html, `property=["']${prop}["']`) ||
      pick(html, `name=["']${prop}["']`);

    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();

    const embed: LinkEmbed = {
      url: target.toString(),
      title: decode(meta("og:title") || titleTag || target.hostname),
      description: decode(meta("og:description") || meta("description") || ""),
      imageUrl: absolutize(meta("og:image") || "", target),
      faviconUrl: `${target.origin}/favicon.ico`,
      siteName: decode(meta("og:site_name") || target.hostname),
    };

    return NextResponse.json(embed);
  } catch {
    return NextResponse.json(
      { error: "Could not fetch link preview" },
      { status: 502 },
    );
  }
}

// Extracts the content="" of the first matching <meta> tag.
function pick(html: string, attr: string): string {
  const re = new RegExp(
    `<meta[^>]*${attr}[^>]*content=["']([^"']*)["']`,
    "i",
  );
  const m1 = html.match(re);
  if (m1) return m1[1];
  // content attribute may precede the identifying attribute.
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}`,
    "i",
  );
  return html.match(re2)?.[1] ?? "";
}

function absolutize(url: string, base: URL): string {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return "";
  }
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
