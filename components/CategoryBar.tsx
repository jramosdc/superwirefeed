"use client";

import { CATEGORIES, type CategoryFilter } from "@/types";

const ALL: CategoryFilter[] = ["All", ...CATEGORIES];

export function CategoryBar({
  active,
  onChange,
}: {
  active: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-full border px-3 py-1 text-sm ${
            active === c
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
