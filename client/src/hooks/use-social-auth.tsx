import { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, User, type Auth } from 'firebase/auth';

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

    const authInstance = auth as Auth;

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(
      authInstance,
      (authUser) => {
        setUser(authUser);
        setLoading(false);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // The auth state listener will handle setting the initial user

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};