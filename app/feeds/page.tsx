import { getFeeds } from "@/lib/db/server";
import { FeedsBrowser } from "@/components/feeds-browser";
import type { Feed } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse feeds — SuperWire",
};

export default async function FeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let feeds: Feed[] = [];
  try {
    feeds = await getFeeds();
  } catch {
    feeds = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Latest feeds</h1>
      <FeedsBrowser feeds={feeds} initialQuery={q ?? ""} />
    </div>
  );
}
