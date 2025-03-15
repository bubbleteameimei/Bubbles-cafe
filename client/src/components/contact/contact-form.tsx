import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Mail, SendIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API response type
interface ContactResponse {
  message: string;
  data: any;
  emailStatus: 'success' | 'failed';
}

// Subject options for the dropdown
const SUBJECT_OPTIONS = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Feedback", label: "Feedback" },
  { value: "Support Request", label: "Support Request" },
  { value: "Business Proposal", label: "Business Proposal" },
  { value: "Request Story", label: "Request Story" },
  { value: "Other", label: "Other" },
];

// Extended schema with subject and showEmail fields
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").default("General Inquiry"),
  customSubject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  showEmail: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState("");
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      customSubject: "",
      message: "",
      showEmail: false,
    },
  });
  
  // Watch subject field to detect when "Other" is selected
  const selectedSubject = form.watch("subject");
  
  useEffect(() => {
    setIsCustomSubject(selectedSubject === "Other");
  }, [selectedSubject]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setSubmissionStatus('idle');
      
      // Process the subject field if it's "Other" and there's a custom subject
      let finalSubject = data.subject;
      if (data.subject === "Other" && data.customSubject) {
        finalSubject = data.customSubject;
      }
      
      // Extract showEmail and customSubject from the data before sending
      const { showEmail, customSubject, ...restData } = data;
      
      // Prepare the data to send
      const contactData = {
        ...restData,
        subject: finalSubject,
        // Include device and browser information for admin tracking
        metadata: {
          device: navigator.userAgent,
          referrer: document.referrer,
          screen: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          hideEmail: !showEmail,
        }
      };
      
      const response = await apiRequest<ContactResponse>('POST', '/api/contact', contactData);

      // Update UI based on response
      if (response.emailStatus === 'success') {
        setSubmissionStatus('success');
        setStatusMessage("Your message has been sent successfully!");
      } else {
        // Message saved but email notification failed
        setSubmissionStatus('success');
        setStatusMessage("Your message was saved but there might be a delay in our response. We'll get back to you as soon as possible.");
      }

      // Show toast for immediate feedback
      toast({
        title: "Message received",
        description: "Thank you for your message. We'll get back to you soon.",
        variant: "default",
      });

      form.reset();
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      setSubmissionStatus('error');
      setStatusMessage(error.message || "There was a problem sending your message. Please try again.");
      
      // Handle structured error responses
      const errorDetails = error.data?.details || {};

      // Set form errors if we received field-specific errors
      Object.entries(errorDetails).forEach(([field, message]) => {
        // Check if the field exists in our form schema
        if (message && ['name', 'email', 'subject', 'customSubject', 'message', 'showEmail'].includes(field)) {
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
      {submissionStatus === 'success' && (
        <Alert className="mb-6 bg-green-950/30 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-400">Success!</AlertTitle>
          <AlertDescription className="text-green-300">
            {statusMessage}
          </AlertDescription>
        </Alert>
      )}

      {submissionStatus === 'error' && (
        <Alert className="mb-6 bg-red-950/30 border-red-800" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {statusMessage}
          </AlertDescription>
        </Alert>
      )}

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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Conditional custom subject field */}
          {isCustomSubject && (
            <FormField
              control={form.control}
              name="customSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Please specify your subject" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please enter a specific subject for your message
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-indigo-500/60 p-4 transition-colors hover:border-indigo-400 hover:bg-slate-800/30 bg-slate-800/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Share Email</FormLabel>
                  <FormDescription className="text-sm text-muted-foreground">
                    Allow your email to be visible in the message
                  </FormDescription>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SendIcon className="h-4 w-4" />
                Send Message
              </span>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}