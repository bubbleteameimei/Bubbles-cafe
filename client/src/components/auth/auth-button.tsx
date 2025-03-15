import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthButtonProps {
  email: string;
  password: string;
  username?: string;
  rememberMe?: boolean;
  isSignIn: boolean;
  className?: string;
}

export function AuthButton({ 
  email, 
  password, 
  username, 
  rememberMe = false,
  isSignIn,
  className = ''
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isLoading || registerMutation.isPending) {
      return; // Prevent multiple submissions
    }
    
    setIsLoading(true);

    try {
      // Enhanced logging for debugging
      console.log("[Auth-Button] Attempting authentication", { 
        mode: isSignIn ? "sign-in" : "sign-up",
        hasEmail: !!email,
        hasPassword: !!password,
        hasUsername: !!username,
        rememberMe
      });

      if (isSignIn) {
        // Validate email and password
        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }
        
        if (email.trim() === '') {
          throw new Error("Email cannot be empty");
        }
        
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        
        console.log("[Auth-Button] Validations passed, submitting login request");
        // Use the direct login method
        const result = await login(email, password, rememberMe);
        
        if (!result) {
          throw new Error("Login failed - no user data received");
        }
        
        console.log("[Auth-Button] Login successful, redirecting", { userId: result.id });
        
        // Show success notification
        toast({
          title: "Success",
          description: "You have been logged in successfully",
        });
        
        // Give a slight delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          setLocation("/");
        }, 300);
      } else {
        // Registration validation
        if (!username || !email || !password) {
          throw new Error("All fields are required");
        }
        
        if (username.trim() === '') {
          throw new Error("Username cannot be empty");
        }
        
        if (email.trim() === '') {
          throw new Error("Email cannot be empty");
        }
        
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        
        console.log("[Auth-Button] Validations passed, submitting registration request");
        const result = await registerMutation.mutateAsync({ 
          username, 
          email, 
          password 
        });
        
        if (!result) {
          throw new Error("Registration failed - no user data received");
        }
        
        console.log("[Auth-Button] Registration successful, redirecting", { userId: result.id });
        
        // Show success notification
        toast({
          title: "Account Created",
          description: "Your account has been created successfully",
        });
        
        // Give a slight delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          setLocation("/");
        }, 300);
      }
    } catch (err: any) {
      console.error("[Auth-Button] Authentication error:", err);
      
      // Enhanced error reporting
      const errorMessage = err?.message || "Authentication failed";
      console.error("[Auth-Button] Error details:", {
        message: errorMessage,
        stack: err?.stack,
        isNetworkError: err?.name === 'NetworkError',
        isAPIError: err?.isAPIError
      });
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = isLoading || (isSignIn ? false : registerMutation.isPending);
  
  return (
    <Button 
      type="submit" 
      className={`w-full auth-submit-button ${className}`}
      disabled={isPending}
      onClick={handleAction}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isSignIn ? "SIGNING IN..." : "Creating Account..."}
        </>
      ) : isSignIn ? "SIGN IN" : "Sign Up"}
    </Button>
  );
}