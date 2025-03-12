import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Check for environment variables with fallback to development values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB0bg1IpDdq2IDv8M8MGLyvB4XghVSE0WA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bubblescafe-33f80.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bubblescafe-33f80",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bubblescafe-33f80.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "329473416186",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:329473416186:web:8dd43a10f94d3e266c2243",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4W89K4X8VV"
};

// Initialize Firebase with error handling
let app;
let auth;
let analytics = null;

try {
  // Log environment check for debugging
  if (import.meta.env.DEV) {
    console.log("Firebase config initialized with:", 
      Object.keys(firebaseConfig).reduce((acc, key) => {
        acc[key] = firebaseConfig[key] ? "✓ Set" : "✗ Missing";
        return acc;
      }, {})
    );
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Initialize Analytics if in browser environment
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.error("Analytics initialization error:", analyticsError);
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Provide clear error message about missing configuration
  if (error instanceof Error && error.message.includes("API key")) {
    console.error("Firebase API key is missing or invalid. Social login features may not work correctly.");
  }
}

export { auth, GoogleAuthProvider, signInWithPopup, OAuthProvider, analytics };