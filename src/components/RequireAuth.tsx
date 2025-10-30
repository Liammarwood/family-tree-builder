"use client";
import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";
import { Loading } from "@/components/Loading";
import NotSignedIn from "@/components/NotSignedIn";
import { User } from "firebase/auth"; // ✅ Import the User type

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        try {
          await signInWithGoogle(); // redirect to Google sign-in popup
        } catch (err) {
          showError("Sign-in failed. Please try again.");
        }
      } else {
        setSignedIn(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading message="Awaiting Login..." height="100vh" />;
  if (!signedIn) return <NotSignedIn onSignIn={signInWithGoogle} />;

  return <>{children}</>;
};
