import { useAuth } from '@/hooks/use-auth';

export interface SocialUser {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: string;
}

/**
 * Replacement hook for social auth state.
 * Uses the server-backed session via useAuth instead of Firebase.
 */
export const useSocialAuth = () => {
  const { user } = useAuth();
  return {
    user: (user as any) || null,
    loading: false,
    error: null as Error | null
  };
};