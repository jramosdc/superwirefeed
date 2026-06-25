import type { CategoryFilter, PostDoc } from "@/types";

// Replacements for the old Angular pipes (legacy/src/components/pipes/*).

// searchPostTitle: case-insensitive title substring match.
export function searchByTitle<T extends { title: string }>(
  items: T[],
  query: string,
): T[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return items;
  return items.filter((i) => i.title.toLocaleLowerCase().includes(q));
}

// searchCategory: "All" passes everything through, otherwise exact category.
export function filterByCategory(
  posts: PostDoc[],
  category: CategoryFilter,
): PostDoc[] {
  if (category === "All") return posts;
  return posts.filter((p) => p.category === category);
}

// orderBy: sort by a numeric/string field, descending by default for feeds
// ("newest first" via createdAt).
export function orderByNewest<T extends { createdAt: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

// truncate: strip HTML tags and clamp to a length, mirroring
// subscription.parseShortDescription / the truncate pipe.
export function truncateText(html: string, length = 280): string {
  const text = html.replace(/(<([^>]+)>)/gi, "").trim();
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}

// "x mins read" estimate ported from viewpost.wordsCount.
export function readingTime(html: string): string {
  if (!html) return "";
  const words = html
    .replace(/(<([^>]+)>)/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}
