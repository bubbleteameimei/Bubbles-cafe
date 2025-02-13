import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginMutation, user, isLoading, authLoading } = useAuth();

  // Add debug logging for auth state
  useEffect(() => {
    console.log("Auth state:", { user, authLoading });
    if (!authLoading && user?.isAdmin) {
      console.log("Redirecting to admin dashboard");
      setLocation("/admin");
    }
  }, [user, authLoading, setLocation]);

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onSubmit"
  });

  const onSubmit = async (data: AdminLogin) => {
    console.log("Form submitted", { email: data.email });
    try {
      // Log before mutation
      console.log("Starting login mutation...");
      const result = await loginMutation.mutateAsync(data);
      console.log("Login result:", result);

      if (!result.isAdmin) {
        throw new Error("Unauthorized: User is not an admin");
      }
    } catch (error: any) {
      console.error("Login error details:", error);

      // Handle specific error cases
      const errorMessage = error?.message || "An unexpected error occurred";
      if (errorMessage.includes("Unauthorized")) {
        form.setError("root", {
          type: "manual",
          message: "Access denied: Admin privileges required"
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: errorMessage
        });
      }

      form.setValue('password', '');

      // Show toast with detailed error
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Show loading state while checking auth status
  if (authLoading) {
    console.log("Showing auth loading state");
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render login form if already logged in
  if (user?.isAdmin) {
    console.log("User is already logged in, not rendering form");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-2xl text-center font-semibold">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6"
              autoComplete="off"
            >
              {form.formState.errors.root && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@example.com" 
                        {...field} 
                        className={`h-12 text-base px-4 ${form.formState.errors.email ? "border-destructive" : ""}`}
                        autoComplete="new-email"
                        spellCheck="false"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field}
                        className={`h-12 text-base px-4 ${form.formState.errors.password ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}