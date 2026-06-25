// Content taxonomy. CATEGORIES preserves the original list from authService.ts.
// POST_TYPES modernizes the old free-form multi-select "types" into a fixed set.

export const CATEGORIES = [
  "News",
  "Communications",
  "Research",
  "Data",
  "Visualizations",
  "Design",
  "Misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Used as a UI filter only — never stored on a post. */
export const ALL_CATEGORY = "All";

export const POST_TYPES = [
  "Article",
  "Photo",
  "Video",
  "Audio",
  "Dataset",
  "Document",
] as const;

export type PostType = (typeof POST_TYPES)[number];

/** Onboarding interests offered in the signup wizard. */
export const INTERESTS = [
  "News",
  "Marketing",
  "Research",
  "Data",
  "Design",
  "Visuals",
  "Technology",
] as const;

export const MAX_CSV_BYTES = 1 * 1024 * 1024; // 1 MB (parity with old app)
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB (parity with old app)
export const CSV_PREVIEW_ROWS = 10;
