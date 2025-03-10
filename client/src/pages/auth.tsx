import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import "./auth.css";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
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
                <div className="group">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="group">
                  <Label htmlFor="pass">Password</Label>
                  <Input 
                    id="pass" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="group">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending || isLoading}
                  >
                    {loginMutation.isPending || isLoading ? "SIGNING IN..." : "SIGN IN"}
                  </Button>
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
                <div className="group">
                  <Label htmlFor="user">Username</Label>
                  <Input 
                    id="user" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div className="group">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="group">
                  <Label htmlFor="pass-signup">Password</Label>
                  <Input 
                    id="pass-signup" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="group">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending || isLoading}
                  >
                    {registerMutation.isPending || isLoading ? "Creating Account..." : "Sign Up"}
                  </Button>
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