import { useState, useEffect } from 'react';
import { auth, getCurrentUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up auth state listener if auth is initialized
    if (!auth) {
      console.error('Firebase auth not initialized');
      setError(new Error('Firebase auth not initialized'));
      setLoading(false);
      return;
    }

    // Check for existing user on mount
    const checkCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking current user:', err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('Failed to check current user'));
        }
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser) => {
        setUser(authUser);
        setLoading(false);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Check for user first
    checkCurrentUser();

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};