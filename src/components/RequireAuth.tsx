import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        await signInWithGoogle(); // redirect to Google sign-in popup
      } else {
        setSignedIn(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!signedIn) return null;

  return <>{children}</>;
};
