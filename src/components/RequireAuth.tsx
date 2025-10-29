"use client";
import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";
import { Loading } from "./Loading";
import NotSignedIn from "./NotSignedIn";
import { User } from "firebase/auth"; // ✅ Import the User type

const isDevelopment = process.env.NODE_ENV !== "production";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  // In development mode, start with signed-in state to avoid showing auth UI
  const [loading, setLoading] = useState(!isDevelopment);
  const [signedIn, setSignedIn] = useState(isDevelopment);
  const { showError } = useError();

  useEffect(() => {
    // In development mode, skip auth requirement
    if (isDevelopment) {
      return;
    }

    // In production mode, require authentication
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
  }, [showError]);

  if (loading) return <Loading message="Awaiting Login..." height="100vh" />;
  if (!signedIn) return <NotSignedIn onSignIn={signInWithGoogle} />;

  return <>{children}</>;
};
