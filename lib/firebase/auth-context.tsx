"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./client";
import type { UserProfile } from "@/types";
import { serializeUser } from "@/lib/db/serialize";

interface AuthContextValue {
  /** Raw Firebase auth user (null when signed out). */
  user: FirebaseUser | null;
  /** Firestore profile doc for the signed-in user (null until loaded). */
  profile: UserProfile | null;
  /** True until the initial auth state resolves. */
  loading: boolean;
  /** Convenience: the user is signed in but has not completed onboarding. */
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  needsOnboarding: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setProfile(null);
        setProfileLoaded(true);
      } else {
        // New/changed user: mark profile as loading until its snapshot arrives.
        setProfileLoaded(false);
      }
    });
    return unsub;
  }, []);

  // Keep the ID token fresh (used by API routes via Authorization header).
  useEffect(() => onIdTokenChanged(auth, () => {}), []);

  // Subscribe to the user's profile doc.
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? serializeUser(snap.id, snap.data()) : null);
      setProfileLoaded(true);
    });
    return unsub;
  }, [user]);

  const needsOnboarding = !!user && profileLoaded && !profile;

  return (
    <AuthContext.Provider value={{ user, profile, loading, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Get a fresh Firebase ID token for authenticating API requests. */
export async function getIdToken(): Promise<string | null> {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
}
