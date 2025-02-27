
import React, { useState } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function HorrorLoginForm() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "signin") {
        await login(email, password);
        navigate("/dashboard");
      } else {
        await register(username, email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap mx-auto my-10 w-full max-w-md">
      <div className="login-html p-8 rounded-lg bg-card/95 backdrop-blur-sm border border-border/30 shadow-horror">
        <input 
          id="tab-1" 
          type="radio" 
          name="tab" 
          className="sign-in hidden" 
          checked={activeTab === "signin"} 
          onChange={() => setActiveTab("signin")}
        />
        <label 
          htmlFor="tab-1" 
          className={cn(
            "tab text-lg font-heading cursor-pointer transition-all duration-300",
            activeTab === "signin" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab("signin")}
        >
          Sign In
        </label>
        
        <input 
          id="tab-2" 
          type="radio" 
          name="tab" 
          className="sign-up hidden" 
          checked={activeTab === "signup"} 
          onChange={() => setActiveTab("signup")}
        />
        <label 
          htmlFor="tab-2" 
          className={cn(
            "tab text-lg font-heading cursor-pointer transition-all duration-300",
            activeTab === "signup" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab("signup")}
        >
          Sign Up
        </label>
        
        <div className="login-form mt-6">
          {/* Sign In Form */}
          <form 
            className={cn(
              "transition-all duration-500",
              activeTab === "signin" ? "block" : "hidden"
            )}
            onSubmit={handleSubmit}
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signin-email">
                Email
              </label>
              <Input
                id="signin-email"
                type="email" 
                placeholder="your@email.com"
                className="w-full bg-background/50 border-border/50 focus:border-primary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signin-password">
                Password
              </label>
              <Input 
                id="signin-password"
                type="password" 
                placeholder="••••••••"
                className="w-full bg-background/50 border-border/50 focus:border-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
            
            <div className="hr h-px bg-border/30 my-6"></div>
            
            <div className="foot-lnk text-center">
              <a 
                href="#forgot" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </form>
          
          {/* Sign Up Form */}
          <form 
            className={cn(
              "transition-all duration-500",
              activeTab === "signup" ? "block" : "hidden"
            )}
            onSubmit={handleSubmit}
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-username">
                Username
              </label>
              <Input 
                id="signup-username"
                type="text" 
                placeholder="horror_fan"
                className="w-full bg-background/50 border-border/50 focus:border-primary transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-email">
                Email
              </label>
              <Input 
                id="signup-email"
                type="email" 
                placeholder="your@email.com"
                className="w-full bg-background/50 border-border/50 focus:border-primary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-password">
                Password
              </label>
              <Input 
                id="signup-password"
                type="password" 
                placeholder="••••••••"
                className="w-full bg-background/50 border-border/50 focus:border-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
            
            <div className="hr h-px bg-border/30 my-6"></div>
            
            <div className="foot-lnk text-center">
              <a 
                href="#terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                By signing up, you agree to our Terms
              </a>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
