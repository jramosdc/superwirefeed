// Pluggable AI-generated-content detector used by the SuperWire audit.
//
// This is a STUB behind a stable interface: swap `detectAiGenerated` for a real
// provider later without touching callers. The audit prioritizes negatively-
// scored posts (low corroboration / disputed), so the stub mirrors that signal.

export interface AiDetectionInput {
  title: string;
  detailHtml: string;
  /** Accuracy score in [0,1] from postAccuracy (0 when unknown). */
  accuracyScore: number;
  disputes: number;
}

export interface AiDetectionResult {
  flagged: boolean;
  reason: string;
}

// Heuristic stub: flag posts the community has scored poorly (disputed + low
// accuracy). A real detector would analyze the text/media instead.
export function detectAiGenerated(input: AiDetectionInput): AiDetectionResult {
  if (input.disputes > 0 && input.accuracyScore < 0.5) {
    return {
      flagged: true,
      reason: "Audit: disputed with low corroboration — flagged pending review.",
    };
  }
  return { flagged: false, reason: "" };
}
