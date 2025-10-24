// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS_SyGbSlojmIz9ys6dGMp5gMklqCf6rk",
  authDomain: "offline-family-tree-builder.firebaseapp.com",
  projectId: "offline-family-tree-builder",
  storageBucket: "offline-family-tree-builder.firebasestorage.app",
  messagingSenderId: "306654309767",
  appId: "1:306654309767:web:0498adb12cab5aa92cf722"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in with Google popup
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Signed in user:", result.user.displayName, result.user.email);
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
}
