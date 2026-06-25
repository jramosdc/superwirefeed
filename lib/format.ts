// Display helpers — replacements for the old Angular pipes
// (truncate, relative time, strip-html).

import { formatDistanceToNow } from "date-fns";

export function relativeTime(ms: number | undefined | null): string {
  if (!ms) return "";
  try {
    return formatDistanceToNow(new Date(ms), { addSuffix: true });
  } catch {
    return "";
  }
}

export function stripHtml(html: string): string {
  return (html ?? "").replace(/<[^>]+>/g, "");
}

export function truncate(text: string, length = 200): string {
  const clean = stripHtml(text);
  if (clean.length <= length) return clean;
  return clean.slice(0, length).trimEnd() + "…";
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
