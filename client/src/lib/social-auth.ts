import { auth, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "./firebase";

// Create providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

/**
 * Sign in with Google using Firebase Authentication
 * @returns User data from Google authentication
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google Sign-In Success:", user);
    
    // Get the auth token to send to our backend
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
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
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
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
    throw error;
  }
};

/**
 * Sign out the currently authenticated user
 */
export const signOutSocialUser = async () => {
  try {
    await auth.signOut();
    console.log("User signed out successfully");
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