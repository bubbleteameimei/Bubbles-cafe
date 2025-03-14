
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Define feedback types
const feedbackTypes = [
  { value: "general", label: "General Feedback" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "content", label: "Content Suggestion" },
  { value: "other", label: "Other" }
];

// Define feedback data types
interface FeedbackFormData {
  name: string;
  email: string;
  content: string;
  type: string;
  rating: number;
}

interface BrowserInfo {
  browser: string;
  operatingSystem: string;
  screenResolution: string;
  userAgent: string;
}

interface FeedbackSubmissionData {
  type: string;
  content: string;
  rating: number;
  page: string;
  category: string;
  browser: string;
  operatingSystem: string;
  screenResolution: string;
  userAgent: string;
  metadata: {
    name: string;
    email: string;
  };
}

export default function Feedback() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: "",
    email: "",
    content: "",
    type: "general",
    rating: 5
  });

  // Detect browser and system info
  const [browserInfo] = useState<BrowserInfo>(() => {
    const userAgent = window.navigator.userAgent;
    const browserName = getBrowserName(userAgent);
    const operatingSystem = getOperatingSystem(userAgent);
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    
    return {
      browser: browserName,
      operatingSystem,
      screenResolution,
      userAgent
    };
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating changes
  const handleRatingChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      rating: parseInt(value)
    }));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackSubmissionData) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
        variant: "default"
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", content: "", type: "general", rating: 5 });
      
      // Reset form visibility after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prepare data for submission
    const feedbackData: FeedbackSubmissionData = {
      type: formData.type,
      content: formData.content,
      rating: formData.rating,
      page: window.location.pathname,
      category: formData.type,
      ...browserInfo,
      metadata: {
        name: formData.name,
        email: formData.email
      }
    };
    
    // Submit feedback
    submitMutation.mutate(feedbackData);
  };

  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Feedback & Suggestions</h1>
      
      <div className="prose dark:prose-invert max-w-none mb-8">
        <p>We value your feedback and suggestions to improve our platform. Please let us know your thoughts, ideas, or report any issues you've encountered.</p>
      </div>

      {submitted ? (
        <div className="bg-green-800/20 border border-green-500/50 rounded-md p-4 mb-8">
          <p className="text-green-400 font-medium">Thank you for your feedback! We'll review it shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Your Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Your Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">Feedback Type</label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">Your Feedback</label>
            <Textarea 
              id="content" 
              name="content" 
              rows={6} 
              value={formData.content}
              onChange={handleChange}
              required 
              className="resize-none" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium">How would you rate your experience?</label>
            <RadioGroup
              className="flex space-x-4"
              defaultValue="5"
              value={formData.rating.toString()}
              onValueChange={handleRatingChange}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem value={num.toString()} id={`rating-${num}`} />
                  <Label htmlFor={`rating-${num}`}>{num}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      )}
    </motion.div>
  );
}

// Helper functions to detect browser and OS
function getBrowserName(userAgent: string): string {
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
  if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) return "Internet Explorer";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  return "Unknown";
}

function getOperatingSystem(userAgent: string): string {
  if (userAgent.indexOf("Windows") > -1) return "Windows";
  if (userAgent.indexOf("Mac") > -1) return "MacOS";
  if (userAgent.indexOf("Linux") > -1) return "Linux";
  if (userAgent.indexOf("Android") > -1) return "Android";
  if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) return "iOS";
  return "Unknown";
}
