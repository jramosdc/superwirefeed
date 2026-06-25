import type { Post } from "@/types";

export function PostBody({ post }: { post: Post }) {
  return (
    <div>
      {/* Rich-text body. Authored with Tiptap; sanitized on save. */}
      {post.detail && (
        <div
          className="prose-body max-w-none text-[15px] text-zinc-800"
          dangerouslySetInnerHTML={{ __html: post.detail }}
        />
      )}

      {/* Inline images */}
      {post.images.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {post.images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="w-full rounded-lg border border-zinc-200"
            />
          ))}
        </div>
      )}

      {/* External link preview (replaces Embedly) */}
      {post.embed && post.embed.url && (
        <a
          href={post.embed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex overflow-hidden rounded-lg border border-zinc-200 hover:bg-zinc-50"
        >
          {post.embed.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.embed.imageUrl}
              alt=""
              className="h-28 w-40 shrink-0 object-cover"
            />
          )}
          <div className="min-w-0 p-3">
            <p className="truncate text-xs text-zinc-400">
              {post.embed.siteName || post.embed.url}
            </p>
            <p className="truncate font-semibold">{post.embed.title}</p>
            <p className="line-clamp-2 text-sm text-zinc-600">
              {post.embed.description}
            </p>
          </div>
        </a>
      )}

      {/* Dataset preview */}
      {post.csvPreview.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold">Dataset preview</h3>
            <span className="text-xs text-zinc-500">
              {post.csvRowCount.toLocaleString()} rows
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {post.csvPreview.map((row, i) => (
                  <tr
                    key={i}
                    className={i === 0 ? "bg-zinc-50 font-semibold" : ""}
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border-b border-zinc-100 px-3 py-1.5 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {post.csvRowCount > post.csvPreview.length && (
            <p className="mt-1 text-xs text-zinc-400">
              Showing first {post.csvPreview.length} rows. Full dataset available
              after purchase.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
