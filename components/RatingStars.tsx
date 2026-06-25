"use client";

// Read-only star display, or interactive when onChange is provided.
export function RatingStars({
  value,
  onChange,
  size = "text-base",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={`inline-flex ${size}`}>
      {stars.map((s) => {
        const filled = value >= s - 0.25;
        const star = (
          <span className={filled ? "text-amber-400" : "text-slate-300"}>★</span>
        );
        return onChange ? (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="px-0.5 leading-none"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            {star}
          </button>
        ) : (
          <span key={s}>{star}</span>
        );
      })}
    </span>
  );
}
