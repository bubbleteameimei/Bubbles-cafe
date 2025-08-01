// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJ-ZRi3GUVHUaM0p5vbbRB8NoqV4b_VvM",
  authDomain: "bubbles-cafe.firebaseapp.com",
  projectId: "bubbles-cafe",
  storageBucket: "bubbles-cafe.firebasestorage.app",
  messagingSenderId: "870151001940",
  appId: "1:870151001940:web:f11d39b757e64457a91ac1",
  measurementId: "G-PSCHGE0V55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const createUserWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const signOutUser = () => signOut(auth);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export { auth, analytics };
export default app;