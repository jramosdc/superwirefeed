// Display-only star rating. For the interactive input see review-form.tsx.
export function RatingStars({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const full = Math.round(value);
  const px = size === "md" ? "text-lg" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-1 ${px}`}>
      <span className="text-amber-400" aria-hidden>
        {"★".repeat(full)}
        <span className="text-zinc-300">{"★".repeat(5 - full)}</span>
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-zinc-500">
          {value ? value.toFixed(1) : "—"}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </span>
  );
}
