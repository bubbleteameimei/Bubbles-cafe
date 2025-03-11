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

import { useState } from 'react';
import './auth.css';
import { Link } from 'wouter';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };
  
  return (
    <div className="login-form">
      <div className={isSignUp ? "cont s-signup" : "cont"}>
        <div className="form sign-in">
          <h2>Sign In</h2>
          <div className="group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
          </div>
          <div className="group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" />
          </div>
          <div className="group">
            <button className="button">Sign In</button>
          </div>
          <div className="hr"></div>
          <div className="foot-lnk" onClick={toggleForm}>
            Don't have an account? <span>Create one</span>
          </div>
          <div className="tiny-disclaimer">
            By signing in, you agree to our <Link href="/legal/terms"><a className="policy-link">Terms of Service</a></Link> and <Link href="/privacy"><a className="policy-link">Privacy Policy</a></Link>. 
            This site uses cookies to enhance your experience.
          </div>
        </div>
        
        <div className="sub-cont">
          <div className="img">
            <div className="img-text m-up">
              <h2>New here?</h2>
              <p>Join our community and discover terrifying tales that will haunt your dreams...</p>
            </div>
            <div className="img-text m-in">
              <h2>One of us?</h2>
              <p>If you already have an account, just sign in. We've missed you!</p>
            </div>
            <div className="img-btn" onClick={toggleForm}>
              <span className="m-up">Sign Up</span>
              <span className="m-in">Sign In</span>
            </div>
          </div>
          
          <div className="form sign-up">
            <h2>Sign Up</h2>
            <div className="group">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" />
            </div>
            <div className="group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" />
            </div>
            <div className="group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" />
            </div>
            <div className="group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input id="confirm-password" type="password" />
            </div>
            <div className="group">
              <button className="button">Sign Up</button>
            </div>
            <div className="hr"></div>
            <div className="foot-lnk" onClick={toggleForm}>
              Already a member? <span>Sign in</span>
            </div>
            <div className="tiny-disclaimer">
              By signing up, you agree to our <Link href="/legal/terms"><a className="policy-link">Terms of Service</a></Link> and <Link href="/privacy"><a className="policy-link">Privacy Policy</a></Link>. 
              This site uses cookies to enhance your experience.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

}