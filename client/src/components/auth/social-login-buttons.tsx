import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/hooks/use-auth';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  isSignIn?: boolean;
}

export function SocialLoginButtons({ onSuccess, isSignIn = true }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      // For Google OAuth, redirect to the backend endpoint
      if (provider === 'google') {
        console.log(`[Social Auth] Initiating ${provider} OAuth login`);
        toast({
          title: 'Redirecting',
          description: `You're being redirected to ${provider} for authentication.`,
        });
        
        // Small delay to allow toast to show before redirect
        setTimeout(() => {
          window.location.href = '/api/auth/google';
        }, 200);
        return;
      }
      
    } catch (error) {
      console.error(`[Social Auth] ${provider} login error:`, error);
      toast({
        title: 'Authentication Error',
        description: `Could not sign in with ${provider}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="social-login-container w-full space-y-3">
      <div className="flex items-center justify-between mb-2">
        <hr className="w-full" />
        <p className="px-3 text-muted-foreground text-sm">Or</p>
        <hr className="w-full" />
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center py-5 bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
        onClick={() => handleSocialLogin('google')}
        disabled={!!isLoading}
        aria-label={`${isSignIn ? 'Sign in' : 'Sign up'} with Google`}
      >
        {isLoading === 'google' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-5 w-5" />
        )}
        <span>{isSignIn ? 'Continue with Google' : 'Sign up with Google'}</span>
      </Button>
      
      <div className="text-xs text-center text-muted-foreground mt-2">
        By continuing with Google, you agree to our <a href="/legal/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
      </div>
    </div>
  );
}