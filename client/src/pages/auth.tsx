import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import "./auth.css";

// Import user schema
import { loginSchema } from "@shared/schema";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, registerMutation } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || registerMutation.isPending) {
      return; // Prevent multiple submissions
    }
    
    setIsLoading(true);

    try {
      // Enhanced logging for debugging
      console.log("[Auth] Attempting authentication via form submit", { 
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
        
        console.log("[Auth] Validations passed, submitting login request");
        // Use the direct login method
        const result = await login(email, password, rememberMe);
        
        if (!result) {
          throw new Error("Login failed - no user data received");
        }
        
        console.log("[Auth] Login successful, redirecting", { userId: result.id });
        
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
        
        console.log("[Auth] Validations passed, submitting registration request");
        const result = await registerMutation.mutateAsync({ 
          username, 
          email, 
          password 
        });
        
        if (!result) {
          throw new Error("Registration failed - no user data received");
        }
        
        console.log("[Auth] Registration successful, redirecting", { userId: result.id });
        
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
      console.error("[Auth] Authentication error:", err);
      
      // Enhanced error reporting
      const errorMessage = err?.message || "Authentication failed";
      console.error("[Auth] Error details:", {
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

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="login-wrap">
        <div className="login-html">
          <div className="tab-selector">
            <button 
              type="button"
              className={`tab-btn ${isSignIn ? "active" : ""}`}
              onClick={() => setIsSignIn(true)}
            >
              SIGN IN
            </button>
            <button 
              type="button"
              className={`tab-btn ${!isSignIn ? "active" : ""}`}
              onClick={() => setIsSignIn(false)}
            >
              SIGN UP
            </button>
          </div>

          <div className="login-form">
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: isSignIn ? "block" : "none" }}>
                {/* Regular login only - social authentication removed */}
                
                {/* Email Field */}
                <div className="group">
                  <Label htmlFor="email" className="auth-label">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="auth-input"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>

                {/* Password Field with Toggle */}
                <div className="group">
                  <Label htmlFor="pass" className="auth-label">Password</Label>
                  <div className="relative">
                    <Input 
                      id="pass" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="auth-input pr-10"
                      required
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={togglePassword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          togglePassword();
                        }
                      }}
                      className="password-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between mb-6 mt-4">
                  <div className="flex items-center">
                    <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="remember-me" 
                        className="peer sr-only"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="toggle-bg"></span>
                      <span className="ml-3 text-sm text-muted-foreground">Remember me</span>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary"
                  >
                    Forgot Password?
                  </Button>
                </div>

                {/* Sign In Button */}
                <div className="group">
                  <AuthButton
                    email={email}
                    password={password}
                    rememberMe={rememberMe}
                    isSignIn={true}
                  />
                </div>

                <div className="tiny-disclaimer">
                  By continuing, you agree to our <a href="/legal/terms" className="policy-link">Terms of Service</a> and <a href="/privacy" className="policy-link">Privacy Policy</a>. This site uses cookies for authentication and analytics.
                </div>

                <div className="hr"></div>

                <div className="foot-lnk">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignIn(false)}
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </div>

              <div style={{ display: isSignIn ? "none" : "block" }}>
                {/* Regular sign up only - social authentication removed */}

                {/* Username Field */}
                <div className="group">
                  <Label htmlFor="user" className="auth-label">Username</Label>
                  <Input 
                    id="user" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="auth-input"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !registerMutation.isPending && !isLoading) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>

                {/* Email Field */}
                <div className="group">
                  <Label htmlFor="email-signup" className="auth-label">Email</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="auth-input"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !registerMutation.isPending && !isLoading) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>

                {/* Password Field with Toggle */}
                <div className="group">
                  <Label htmlFor="pass-signup" className="auth-label">Password</Label>
                  <div className="relative">
                    <Input 
                      id="pass-signup" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="auth-input pr-10"
                      required
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !registerMutation.isPending && !isLoading) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={togglePassword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          togglePassword();
                        }
                      }}
                      className="password-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign Up Button */}
                <div className="group">
                  <AuthButton
                    email={email}
                    password={password}
                    username={username}
                    isSignIn={false}
                  />
                </div>

                <div className="tiny-disclaimer">
                  By continuing, you agree to our <a href="/legal/terms" className="policy-link">Terms of Service</a> and <a href="/privacy" className="policy-link">Privacy Policy</a>. This site uses cookies for authentication and analytics.
                </div>

                <div className="hr"></div>

                <div className="foot-lnk">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignIn(true)}
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}