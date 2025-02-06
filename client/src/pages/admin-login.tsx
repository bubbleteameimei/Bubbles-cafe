import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onSubmit"
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLogin) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          throw new Error(error.message || "Too many login attempts. Please try again later.");
        }
        throw new Error(error.message || "Invalid email or password");
      }
      return response.json();
    },
    onSuccess: () => {
      setLocation("/admin");
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: AdminLogin) => {
    if (loginMutation.isPending) return;
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-2xl text-center font-serif">Admin Login</CardTitle>
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
                    <FormLabel className="text-base">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@example.com" 
                        {...field} 
                        className={`h-12 text-base px-4 ${form.formState.errors.email ? "border-destructive" : ""}`}
                        autoComplete="new-email"
                        spellCheck="false"
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
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field}
                        className={`h-12 text-base px-4 ${form.formState.errors.password ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}