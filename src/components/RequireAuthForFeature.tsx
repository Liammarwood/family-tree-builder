"use client";
import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";
import { Loading } from "./Loading";
import NotSignedIn from "./NotSignedIn";
import { User } from "firebase/auth";

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * RequireAuthForFeature - Forces authentication for specific features
 * In development: Shows auth UI when feature is accessed
 * In production: This is handled by RequireAuth at app level
 */
export const RequireAuthForFeature = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    // Check if user is already signed in or trigger sign-in
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user && isDevelopment) {
        // In development, prompt for sign-in when feature is accessed
        try {
          await signInWithGoogle();
        } catch (_err) {
          showError("Sign-in is required to use this feature. Please try again.");
        }
      } else if (user) {
        setSignedIn(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showError]);

  if (loading) return <Loading message="Awaiting Login..." height="100%" />;
  if (!signedIn) return <NotSignedIn onSignIn={signInWithGoogle} />;

  return <>{children}</>;
};
