import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registrationSchema } from "@shared/schema";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (data: any) => {
    try {
      if (!data.email || !data.password) {
        toast({
          title: "Missing credentials",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        return;
      }
      await loginMutation.mutateAsync(data);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Reset Password",
      description: "Password reset functionality coming soon. Please contact support.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-6xl w-full grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <Card className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Welcome to Horror Blog</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="space-y-1">
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email?.message && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password?.message && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password?.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <div className="space-y-1">
                  <Input
                    id="reg-username"
                    type="text"
                    {...registerForm.register("username")}
                  />
                  {registerForm.formState.errors.username?.message && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.username?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="space-y-1">
                  <Input
                    id="email"
                    type="email"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email?.message && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.email?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showRegPassword ? "text" : "password"}
                    {...registerForm.register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showRegPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password?.message && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password?.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </Card>

        {/* Hero Section */}
        <div className="hidden md:flex flex-col justify-center space-y-4 p-6">
          <h2 className="text-3xl font-bold">Experience Horror Stories</h2>
          <p className="text-lg text-muted-foreground">
            Join our community of horror enthusiasts. Read, write, and share spine-chilling tales.
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Access exclusive horror content</li>
            <li>Participate in writing challenges</li>
            <li>Connect with fellow horror fans</li>
            <li>Customize your reading experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}