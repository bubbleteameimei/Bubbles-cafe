import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import OrDivider from "@/components/auth/OrDivider";
import { useSocialAuth } from "@/hooks/use-social-auth";
import "./auth.css";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignIn) {
        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }
        await loginMutation.mutateAsync({ email, password });
        setLocation("/");
      } else {
        if (!username || !email || !password) {
          throw new Error("All fields are required");
        }
        await registerMutation.mutateAsync({ username, email, password });
        setLocation("/");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({
        title: "Authentication Error",
        description: err?.message || "Authentication failed",
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
            <form onSubmit={handleSubmit}>
              <div style={{ display: isSignIn ? "block" : "none" }}>
                {/* OAuth Sign In Buttons */}
                <div className="social-login-buttons">
                  <SocialLoginButtons 
                    onSuccess={(userData) => {
                      console.log("Social login successful", userData);
                      setLocation("/");
                    }}
                    onError={(error) => {
                      toast({
                        title: "Authentication Error",
                        description: error.message || "Social sign-in failed",
                        variant: "destructive"
                      });
                    }}
                  />
                  <OrDivider />
                </div>
                
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
                    />
                    <button 
                      type="button" 
                      onClick={togglePassword}
                      className="password-toggle-btn"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
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
                  <Button 
                    type="submit" 
                    className="w-full auth-submit-button"
                    disabled={loginMutation.isPending || isLoading}
                  >
                    {loginMutation.isPending || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SIGNING IN...
                      </>
                    ) : "SIGN IN"}
                  </Button>
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
                {/* Social Sign Up Buttons */}
                <div className="social-login-buttons">
                  <SocialLoginButtons 
                    onSuccess={(userData) => {
                      console.log("Social signup successful", userData);
                      setLocation("/");
                    }}
                    onError={(error) => {
                      toast({
                        title: "Registration Error",
                        description: error.message || "Social sign-up failed",
                        variant: "destructive"
                      });
                    }}
                  />
                  <OrDivider />
                </div>

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
                    />
                    <button 
                      type="button" 
                      onClick={togglePassword}
                      className="password-toggle-btn"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign Up Button */}
                <div className="group">
                  <Button 
                    type="submit" 
                    className="w-full auth-submit-button"
                    disabled={registerMutation.isPending || isLoading}
                  >
                    {registerMutation.isPending || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : "Sign Up"}
                  </Button>
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