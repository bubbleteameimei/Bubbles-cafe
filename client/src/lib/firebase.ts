import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration with your provided values
const firebaseConfig = {
  apiKey: "AIzaSyB0bg1IpDdq2IDv8M8MGLyvB4XghVSE0WA",
  authDomain: "bubblescafe-33f80.firebaseapp.com",
  projectId: "bubblescafe-33f80",
  storageBucket: "bubblescafe-33f80.firebasestorage.app",
  messagingSenderId: "329473416186",
  appId: "1:329473416186:web:8dd43a10f94d3e266c2243",
  measurementId: "G-4W89K4X8VV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics if in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Analytics initialization error:", error);
  }
}

export { auth, GoogleAuthProvider, signInWithPopup, OAuthProvider, analytics };