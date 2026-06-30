// Map Firebase Auth error codes to friendly, user-facing messages so raw
// "Firebase: Error (auth/…)" strings never reach the UI. Returns "" for the
// benign "user closed the popup" cases, which callers should not surface.
export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "That doesn’t look like a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists — try logging in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return ""; // user cancelled — not an error worth showing
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "This site isn’t authorized for Google sign-in yet.";
    default:
      return err instanceof Error ? err.message : "Something went wrong. Please try again.";
  }
}
