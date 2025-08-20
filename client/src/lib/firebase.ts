import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  signOut,
  User,
  Auth
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration directly from the provided values
const firebaseConfig = {
  apiKey: "AIzaSyAJ-ZRi3GUVHUaM0p5vbbRB8NoqV4b_VvM",
  authDomain: "bubbles-cafe.firebaseapp.com",
  projectId: "bubbles-cafe",
  storageBucket: "bubbles-cafe.firebasestorage.app",
  messagingSenderId: "870151001940",
  appId: "1:870151001940:web:f11d39b75764457a91ac1",
  measurementId: "G-PSCHGE0V55"
};

// Log Firebase configuration status for debugging
console.log('Firebase config initialized with:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
  measurementId: firebaseConfig.measurementId ? '✓ Set' : '✗ Missing',
});

// Initialize Firebase
let app;
let auth: Auth;
let analytics;

try {
  // Initialize only once
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Only initialize analytics in browser environment
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    console.log('Firebase successfully initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, auth };

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Configure Apple provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Sign in with Google using Firebase Authentication
 * @returns User data from Google authentication
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with Apple using Firebase Authentication
 * @returns User data from Apple authentication
 */
export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Sign out the currently authenticated user
 */
export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

/**
 * Get the current authenticated user
 * @returns Current authenticated user or null
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};