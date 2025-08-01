// Firebase Configuration
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent duplicate app initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    // Check if Firebase is properly initialized
    if (!auth || !googleProvider) {
      throw new Error('Firebase authentication not properly initialized');
    }

    // Attempt sign in with popup
    const result = await signInWithPopup(auth, googleProvider);
    
    if (!result.user) {
      throw new Error('No user data returned from Google sign-in');
    }

    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Google sign-in error details:', error);
    
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
export const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const createUserWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const signOutUser = () => signOut(auth);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export { auth };
export default app;