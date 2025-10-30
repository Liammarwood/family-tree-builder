"use client";
import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";
import { Loading } from "./Loading";
import NotSignedIn from "./NotSignedIn";
import { User } from "firebase/auth"; // ✅ Import the User type

const isDevelopment = process.env.NODE_ENV !== "production";

type RequireAuthProps = {
  children: ReactNode;
  /**
   * Force authentication even in development mode.
   * Used for features that require Firebase auth (e.g., ShareModal).
   */
  forceAuth?: boolean;
};

export const RequireAuth = ({ children, forceAuth = false }: RequireAuthProps) => {
  // In development mode (without forceAuth), start with signed-in state to avoid showing auth UI
  const shouldSkipAuth = isDevelopment && !forceAuth;
  const [loading, setLoading] = useState(!shouldSkipAuth);
  const [signedIn, setSignedIn] = useState(shouldSkipAuth);
  const { showError } = useError();

  useEffect(() => {
    // In development mode without forceAuth, skip auth requirement
    if (shouldSkipAuth) {
      return;
    }

    // In production mode or with forceAuth, require authentication
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        try {
          await signInWithGoogle(); // redirect to Google sign-in popup
        } catch (_err) {
          showError("Sign-in failed. Please try again.");
        }
      } else {
        setSignedIn(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showError, shouldSkipAuth]);

  if (loading) return <Loading message="Awaiting Login..." height="100vh" />;
  if (!signedIn) return <NotSignedIn onSignIn={signInWithGoogle} />;

  return <>{children}</>;
};
