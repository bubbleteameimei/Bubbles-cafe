import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion
} from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import "./auth.css";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  
  // Check password strength and validations whenever password changes
  useEffect(() => {
    if (password) {
      // Update all validation checks
      const newValidations = {
        hasMinLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password)
      };
      
      setValidations(newValidations);
      
      // Calculate password strength (0-4)
      const strength = Object.values(newValidations).filter(Boolean).length;
      setPasswordStrength(strength);
    } else {
      // Reset validation when password is empty
      setValidations({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false
      });
      setPasswordStrength(0);
    }
  }, [password]);
  
  // Check if passwords match whenever either password field changes
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

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
        
        // Password strength validation
        if (passwordStrength < 3) {
          throw new Error("Password is too weak. Please include at least uppercase letters, numbers, or special characters.");
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

  // Get password strength indicator
  const getPasswordStrengthLabel = () => {
    if (!password) return null;
    
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };
  
  // Get password strength color class
  const getPasswordStrengthClass = () => {
    if (!password) return "";
    
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };
  
  // Get password strength icon
  const getPasswordStrengthIcon = () => {
    if (!password) return null;
    
    if (passwordStrength <= 1) return <ShieldAlert className="h-4 w-4 text-red-500" />;
    if (passwordStrength === 2) return <ShieldQuestion className="h-4 w-4 text-yellow-500" />;
    if (passwordStrength === 3) return <ShieldCheck className="h-4 w-4 text-blue-500" />;
    return <ShieldCheck className="h-4 w-4 text-green-500" />;
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                {/* Sign in form with email/password + social login options */}
                
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
                  <ForgotPasswordDialog />
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
                
                {/* Social Login Buttons */}
                <div className="group mt-4">
                  <SocialLoginButtons isSignIn={true} />
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
                {/* Sign up form with email/password + social login options */}

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
                      className={`auth-input pr-10 ${password ? (passwordStrength >= 3 ? 'border-green-500' : 'border-yellow-500') : ''}`}
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-2" aria-live="polite">
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center">
                          {getPasswordStrengthIcon()}
                          <span className="ml-1">Password strength: <strong>{getPasswordStrengthLabel()}</strong></span>
                        </span>
                      </div>
                      
                      {/* Password strength bar */}
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthClass()}`} 
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={passwordStrength}
                          aria-valuemin={0}
                          aria-valuemax={5}
                        />
                      </div>

                      {/* Password requirements list */}
                      <ul className="text-xs space-y-1 mt-1 pl-0 list-none">
                        <li className="flex items-center">
                          {validations.hasMinLength ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span>At least 6 characters</span>
                        </li>
                        <li className="flex items-center">
                          {validations.hasUpperCase ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span>Uppercase letter (A-Z)</span>
                        </li>
                        <li className="flex items-center">
                          {validations.hasNumber ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span>Number (0-9)</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field with Toggle */}
                <div className="group">
                  <Label htmlFor="confirm-password" className="auth-label">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`auth-input pr-10 ${
                        confirmPassword 
                          ? (passwordsMatch === true 
                              ? 'border-green-500' 
                              : passwordsMatch === false 
                                ? 'border-red-500' 
                                : '')
                          : ''
                      }`}
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
                      onClick={toggleConfirmPassword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleConfirmPassword();
                        }
                      }}
                      className="password-toggle-btn"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {/* Password Matching Indicator */}
                  {confirmPassword && (
                    <div className="mt-2" aria-live="polite">
                      <div className={`text-xs flex items-center ${
                        passwordsMatch ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Up Button */}
                <div className="group">
                  <AuthButton
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    username={username}
                    isSignIn={false}
                  />
                </div>
                
                {/* Social Login Buttons - Sign Up */}
                <div className="group mt-4">
                  <SocialLoginButtons isSignIn={false} />
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