import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requiredAuth?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes based on authentication status
 * 
 * @param children - The protected content
 * @param requiredAuth - Whether authentication is required (default: true)
 * @param adminOnly - Whether admin privileges are required (default: false)
 * @param redirectTo - Where to redirect if authentication fails (default: '/auth')
 */
export function AuthGuard({
  children,
  requiredAuth = true,
  adminOnly = false,
  redirectTo = '/auth'
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isAuthReady } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    if (!isAuthReady) {
      // Still loading auth status, don't redirect yet
      return;
    }

    // Now we have auth status, check if user is authorized
    if (requiredAuth) {
      // Auth is required
      if (!isAuthenticated) {
        // User is not authenticated but should be, redirect
        console.log('[AuthGuard] User not authenticated, redirecting to:', redirectTo);
        setLocation(redirectTo);
        return;
      }
      
      if (adminOnly && (!user || !user.isAdmin)) {
        // Admin access required but user is not admin
        console.log('[AuthGuard] Admin access required but user is not admin, redirecting to:', '/');
        setLocation('/');
        return;
      }
    } else {
      // Auth is not required (e.g., login page that shouldn't be accessed when logged in)
      if (isAuthenticated) {
        // User is authenticated but shouldn't be for this route
        console.log('[AuthGuard] User already authenticated, redirecting to:', '/');
        setLocation('/');
        return;
      }
    }
    
    // User is authorized to view this content
    setIsAuthorized(true);
  }, [isAuthenticated, isAuthReady, requiredAuth, adminOnly, redirectTo, user, setLocation]);

  // Show loading indicator while checking auth status
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // Render children only if authorized
  return isAuthorized ? <>{children}</> : null;
}