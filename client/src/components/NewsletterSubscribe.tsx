import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import type { InsertNewsletterSubscription } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
//import { apiRequest } from "@/lib/queryClient"; // Removed as fetch is used instead

export function NewsletterSubscribe() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const form = useForm<InsertNewsletterSubscription>({
    resolver: zodResolver(insertNewsletterSubscriptionSchema),
    defaultValues: {
      email: "",
      confirmed: false
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: InsertNewsletterSubscription) => {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "Successfully subscribed!",
        description: "Please check your email to confirm your subscription.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InsertNewsletterSubscription) {
    subscribeMutation.mutate(data);
  }

  if (isSubscribed) {
    return (
      <div className="text-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm">Thanks for subscribing! Check your email to confirm.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-card rounded-lg shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Subscribe to Our Newsletter</h3>
        <p className="text-sm text-muted-foreground">Get the latest horror stories delivered to your inbox</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </Form>
    </div>
  );
}