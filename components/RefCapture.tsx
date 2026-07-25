"use client";

import { useEffect } from "react";
import { captureRefFromLocation } from "@/lib/referral";

// Persists ?ref={sharerUid} on landing. Mounted once in the root layout;
// share links are external entries, so a mount-time capture covers them.
export function RefCapture() {
  useEffect(() => {
    captureRefFromLocation();
  }, []);
  return null;
}
