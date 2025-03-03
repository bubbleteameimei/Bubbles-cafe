import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ContactForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      showEmail: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await apiRequest('POST', '/api/contact', data);

      toast({
        title: "Message sent successfully",
        description: response.message || "Thank you for your message. I'll get back to you soon.",
      });

      form.reset();
    } catch (error: any) {
      // Handle structured error responses
      const errorDetails = error.details || {};

      // Set form errors if we received field-specific errors
      Object.entries(errorDetails).forEach(([field, message]) => {
        if (message) {
          form.setError(field as any, {
            type: 'server',
            message: message as string
          });
        }
      });

      toast({
        title: "Error sending message",
        description: (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <span>{error.message || "Please try again later."}</span>
          </div>
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your message here..."
                    className="min-h-[150px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showEmail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-foreground/60 p-4 transition-colors hover:border-foreground hover:bg-black/30 bg-black/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Share Email</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow your email to be visible in the message
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}