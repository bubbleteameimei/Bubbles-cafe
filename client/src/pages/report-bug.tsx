import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileInput } from "@/components/ui/file-input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const bugReportSchema = z.object({
  affectedPage: z.string().min(1, "Please specify which page or feature is affected"),
  description: z.string().min(10, "Please provide a detailed description of the issue"),
  screenshot: z
    .instanceof(FileList)
    .refine((files) => files.length === 0 || files.length === 1, "Please upload only one file")
    .refine(
      (files) => files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) =>
        files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    )
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

type BugReportForm = z.infer<typeof bugReportSchema>;

export default function ReportBugPage() {
  const { toast } = useToast();

  const form = useForm<BugReportForm>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      affectedPage: "",
      description: "",
      email: "",
    },
  });

  const bugReportMutation = useMutation({
    mutationFn: async (data: BugReportForm) => {
      const formData = new FormData();
      formData.append("affectedPage", data.affectedPage);
      formData.append("description", data.description);
      if (data.email) {
        formData.append("email", data.email);
      }
      if (data.screenshot && data.screenshot[0]) {
        formData.append("screenshot", data.screenshot[0]);
      }
      return apiRequest("/api/bug-report", { method: 'POST', body: formData });
    },
    onSuccess: () => {
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for helping us improve the site!",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: BugReportForm) {
    bugReportMutation.mutate(data);
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="prose dark:prose-invert mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-0">Report a Bug</h1>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border mb-6">
          <p className="text-muted-foreground mb-6 text-lg">
            We strive to provide a seamless and immersive experience, but if you encounter any issues,
            we appreciate your help in improving the site. Please use the form below to report any bugs,
            glitches, or technical issues you experience.
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What to Include in Your Report:</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Page or Feature Affected: (e.g., "Library page won't load" or "Dark mode toggle not working")</li>
              <li>Description of the Issue: A brief explanation of what went wrong.</li>
              <li>Screenshots (if possible): Helps us understand the problem faster.</li>
            </ul>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-lg">
          <FormField
            control={form.control}
            name="affectedPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Page or Feature Affected</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Library page, Dark mode toggle" 
                    {...field}
                    className="text-base p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Description of the Issue</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe what happened and what you were trying to do..."
                    className="min-h-[150px] text-base p-3"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-base">
                  Provide as much detail as possible to help us understand and fix the issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="screenshot"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <FormItem>
                <FormLabel className="text-lg">Screenshot (Optional)</FormLabel>
                <FormControl>
                  <FileInput
                    accept="image/png,image/jpeg,image/webp"
                    helperText="Upload a screenshot to help us understand the issue better (max 5MB)"
                    error={fieldState.error?.message}
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
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
                <FormLabel className="text-lg">Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="text-base p-3"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-base">
                  Provide your email if you'd like us to follow up with you about this issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6"
            disabled={bugReportMutation.isPending}
          >
            {bugReportMutation.isPending ? "Submitting..." : "Submit Bug Report"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center text-base text-muted-foreground">
        <p>
          For critical issues, you can also email us directly at{" "}
          <a href="mailto:vanessachiwetalu@gmail.com" className="text-primary hover:underline">
            vanessachiwetalu@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}