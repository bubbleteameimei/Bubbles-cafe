import "./auth.css";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registrationData } = data;
      await registerMutation.mutateAsync(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center p-4">
      <motion.div 
        className="login-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-html">
          <input 
            id="tab-1" 
            type="radio" 
            name="tab" 
            className="sign-in" 
            checked={isSignIn} 
            onChange={() => setIsSignIn(true)}
          />
          <label 
            htmlFor="tab-1" 
            className="tab"
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </label>

          <input 
            id="tab-2" 
            type="radio" 
            name="tab" 
            className="sign-up"
            checked={!isSignIn}
            onChange={() => setIsSignIn(false)}
          />
          <label 
            htmlFor="tab-2" 
            className="tab"
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </label>

          <div className="login-form">
            {isSignIn ? (
              <div className="sign-in-htm">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Password"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="group">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                    <div className="hr" />
                    <div className="foot-lnk">
                      <a href="#forgot" className="text-sm text-muted-foreground hover:text-primary">
                        Forgot Password?
                      </a>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="sign-up-htm">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              placeholder="Username"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Password"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm Password"
                              className="input bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="group">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Sign Up"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}