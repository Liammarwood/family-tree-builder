"use client";
import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { Loading } from "./Loading";
import NotSignedIn from "./NotSignedIn";
import { User } from "firebase/auth"; // ✅ Import the User type

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        await signInWithGoogle(); // redirect to Google sign-in popup
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
