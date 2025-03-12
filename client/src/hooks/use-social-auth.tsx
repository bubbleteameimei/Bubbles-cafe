import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

// Interface for our app's user data
export interface SocialUser {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: string;
}

/**
 * Custom hook to monitor Firebase auth state
 */
export const useSocialAuth = () => {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up the Firebase auth state observer
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Create a user object from the Firebase user
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider: firebaseUser.providerData[0]?.providerId || 'unknown'
          });
          setError(null);
          
          // In a real app, we would sync with our backend here
          console.log("User signed in:", firebaseUser.displayName);
        } catch (err) {
          console.error("Error processing auth state:", err);
          setError(err instanceof Error ? err : new Error('Unknown authentication error'));
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setError(null);
      }
      
      setLoading(false);
    });

    // Clean up the observer when the component unmounts
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};