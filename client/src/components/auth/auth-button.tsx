import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthButtonProps {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
  rememberMe?: boolean;
  isSignIn: boolean;
  className?: string;
}

export function AuthButton({ 
  email, 
  password,
  confirmPassword,
  username, 
  rememberMe = false,
  isSignIn,
  className = ''
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Mock registerMutation since it's not provided by useAuth
  const registerMutation = {
    mutateAsync: async (data: any) => {
      // Simple implementation to handle registration directly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return response.json();
    },
    isPending: false
  };

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions or if mutations are pending
    if (isLoading || (isSignIn ? false : registerMutation.isPending)) {
      return;
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
        
        console.log("[Auth-Button] Login validations passed, submitting login request");
        // Use the direct login method with a timeout
        const loginPromise = login(email, password);
        
        // Add timeout to prevent long-running requests
        const timeoutPromise = new Promise((_, reject) => {
          const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error("Login request timed out. Please try again."));
          }, 10000); // 10 seconds timeout
        });
        
        // Race between the login and timeout
        const result = await Promise.race([loginPromise, timeoutPromise]) as any;
        
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
        if (!username || !email || !password || !confirmPassword) {
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
        
        // Password match validation
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        console.log("[Auth-Button] Registration validations passed, submitting registration request");
        
        // Add timeout to prevent long-running requests
        const registerPromise = registerMutation.mutateAsync({ 
          username, 
          email, 
          password 
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error("Registration request timed out. Please try again."));
          }, 10000); // 10 seconds timeout
        });
        
        // Race between the registration and timeout
        const result = await Promise.race([registerPromise, timeoutPromise]) as any;
        
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
      
      // Enhanced error reporting and handling
      let errorMessage = err?.message || "Authentication failed";
      
      // More user-friendly error messages for common issues
      if (errorMessage.includes("Invalid email or password")) {
        errorMessage = "The email or password you entered is incorrect";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (errorMessage.includes("Email already registered")) {
        errorMessage = "This email is already registered. Try logging in or use a different email.";
      }
      
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