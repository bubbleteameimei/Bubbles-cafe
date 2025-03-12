import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';

// Create providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

/**
 * Sign in with Google using Firebase Authentication
 * @returns User data from Google authentication
 */
export const signInWithGoogle = async () => {
  try {
    // Add scopes for better user data
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google Sign-In Success:", user);

    // Get the auth token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    // Return user data that our app needs
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: "google",
      token
    };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);

    // Provide more helpful error messages
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Authentication service is temporarily unavailable. This may be due to missing API credentials.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google Sign-In is not enabled in Firebase console. Please contact the administrator.');
    } else {
      throw error;
    }
  }
};

/**
 * Sign in with Apple using Firebase Authentication
 * @returns User data from Apple authentication
 */
export const signInWithApple = async () => {
  try {
    // Configure OAuth scopes
    appleProvider.addScope('email');
    appleProvider.addScope('name');

    // Add custom parameters for better UX
    appleProvider.setCustomParameters({
      locale: 'en'
    });

    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    console.log("Apple Sign-In Success:", user);

    // Get the auth token to send to our backend
    const credential = OAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    // Return user data that our app needs
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: "apple",
      token
    };
  } catch (error: any) {
    console.error("Apple Sign-In Error:", error);

    // Provide more helpful error messages
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Authentication service is temporarily unavailable. This may be due to missing API credentials.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Apple Sign-In is not enabled in Firebase console. Please contact the administrator.');
    } else {
      throw error;
    }
  }
};

/**
 * Sign out the currently authenticated user
 */
export const signOutSocialUser = async (): Promise<boolean> => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }
  
  try {
    await (auth as Auth).signOut();
    console.log("User signed out successfully");
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * React hook to get the current authenticated user
 * @returns Current authenticated user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};