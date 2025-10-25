import { useEffect, useState, ReactNode } from "react";
import { auth, signInWithGoogle } from "@/firebaseConfig";
import { Loading } from "./Loading";
import NotSignedIn from "./NotSignedIn";

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

  if (loading) return <Loading message="Awaiting Login..." height="100vh" />;
  if (!signedIn) return <NotSignedIn onSignIn={signInWithGoogle} />;

  return <>{children}</>;
};
