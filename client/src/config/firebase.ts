// Firebase Configuration
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, type Auth } from "firebase/auth";

// Your web app's Firebase configuration - using provided credentials with fallback to environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAJ-ZRi3GUVHUaM0p5vbbRB8NoqV4b_VvM",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "bubbles-cafe"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bubbles-cafe",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "bubbles-cafe"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:870151001940:web:f11d39b75764457a91ac1",
};

// Initialize Firebase with error handling

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
} catch (error) {
  
  // Continue without Firebase - app will work with email auth only
}

// Configure Google provider with error handling
if (googleProvider) {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    
  }
}

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    // Check if Firebase is properly initialized
    if (!auth || !googleProvider) {
      throw new Error('Google sign-in is not available. Firebase authentication not properly initialized.');
    }

    // Attempt sign in with popup
    const result = await signInWithPopup(auth, googleProvider);
    
    if (!result.user) {
      throw new Error('No user data returned from Google sign-in');
    }

    
    return result;
  } catch (error: any) {
    
    
    // Re-throw with more specific error information
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled by user.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Authentication service temporarily unavailable. Please try again.');
    }
    
    throw error;
  }
};
export const signInWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};
export const createUserWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
};
export const signOutUser = () => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return signOut(auth);
};
export const resetPassword = (email: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return sendPasswordResetEmail(auth, email);
};

export { auth };
export default app;