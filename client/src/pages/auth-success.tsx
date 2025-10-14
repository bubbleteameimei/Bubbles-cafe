import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

/**
 * After Supabase OAuth redirect, finalize server session and redirect home.
 */
const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const finalize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;
        if (!access_token) {
          setLocation('/');
          return;
        }
        const resp = await fetch('/api/auth/supabase/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ access_token })
        });
        // Ignore errors and redirect anyway
        if (resp.ok) {
          await checkAuth().catch(() => {});
        }
      } catch {}
      setLocation('/');
    };
    finalize();
  }, [setLocation, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Signing you in…</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;