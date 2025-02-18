import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registrationSchema } from "@shared/schema";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isSignIn, setIsSignIn] = useState(true);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm({
    resolver: zodResolver(isSignIn ? loginSchema : registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (isSignIn) {
      loginMutation.mutate({
        username: data.username,
        password: data.password,
      });
    } else {
      registerMutation.mutate({
        username: data.username,
        email: data.email,
        password: data.password,
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/horror-bg.jpg')] bg-cover bg-center">
      <div className="login-wrap w-full max-w-[525px] min-h-[670px] relative">
        <div className="login-html w-full h-full absolute p-[90px_70px_50px] bg-black/80">
          <div className="flex gap-4 mb-8">
            <input
              id="tab-1"
              type="radio"
              name="tab"
              className="hidden"
              checked={isSignIn}
              onChange={() => setIsSignIn(true)}
            />
            <label
              htmlFor="tab-1"
              className={`text-2xl pb-2 border-b-2 transition-colors cursor-pointer ${
                isSignIn
                  ? "text-red-500 border-red-500"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Sign In
            </label>
            <input
              id="tab-2"
              type="radio"
              name="tab"
              className="hidden"
              checked={!isSignIn}
              onChange={() => setIsSignIn(false)}
            />
            <label
              htmlFor="tab-2"
              className={`text-2xl pb-2 border-b-2 transition-colors cursor-pointer ${
                !isSignIn
                  ? "text-red-500 border-red-500"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Sign Up
            </label>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                className="bg-white/10 border-none text-white"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="bg-white/10 border-none text-white"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {!isSignIn && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-white/10 border-none text-white"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            )}

            {isSignIn && (
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-white/20" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  Keep me Signed in
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isSignIn ? "Sign In" : "Sign Up"}
            </Button>

            <div className="h-[2px] bg-white/20 my-8" />

            <div className="text-center">
              {isSignIn ? (
                <a href="#forgot" className="text-gray-400 hover:text-gray-300">
                  Forgot Password?
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSignIn(true)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Already a Member?
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}