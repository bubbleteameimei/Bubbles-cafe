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
import { Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define feedback types
const feedbackTypes = [
  { value: "general", label: "General Feedback" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "content", label: "Content Suggestion" },
  { value: "other", label: "Other" }
];

// Define validation schema
const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  content: z.string().min(10, "Feedback must be at least 10 characters").max(2000, "Feedback cannot exceed 2000 characters"),
  type: z.string().min(1, "Please select a feedback type"),
  rating: z.number().min(1, "Please provide a rating").max(5, "Rating cannot exceed 5 stars")
});

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
  
  // Calculate form completion progress
  const calculateFormProgress = () => {
    let progress = 0;
    const totalFields = 4; // name, email, content, type (rating has default value)
    
    // Name field (25%)
    if (formData.name.length >= 2) {
      progress += 25;
    } else if (formData.name.length > 0) {
      progress += Math.floor((formData.name.length / 2) * 25);
    }
    
    // Email field (25%)
    if (formData.email.includes('@') && formData.email.includes('.')) {
      progress += 25;
    } else if (formData.email.length > 0) {
      progress += Math.min(15, Math.floor((formData.email.length / 5) * 15));
    }
    
    // Content field (25%)
    if (formData.content.length >= 10) {
      progress += 25;
    } else if (formData.content.length > 0) {
      progress += Math.floor((formData.content.length / 10) * 25);
    }
    
    // Type field (25%)
    if (formData.type) {
      progress += 25;
    }
    
    return progress;
  };

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
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating changes
  const handleRatingChange = (value: string) => {
    // Clear validation error for rating
    if (validationErrors.rating) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rating;
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      rating: parseInt(value)
    }));
  };

  // Performance and debug tracking
  const logSubmissionAttempt = (data: FeedbackSubmissionData) => {
    // Log submission attempt with sanitized data (omitting personal info)
    console.log('[Feedback] Submission attempt', {
      type: data.type,
      contentLength: data.content.length,
      page: data.page,
      browser: data.browser,
      operatingSystem: data.operatingSystem,
      hasMetadata: !!data.metadata
    });
  };

  const trackSubmissionMetrics = () => {
    // Track timing for feedback submissions
    const metric = {
      name: 'feedback-submission',
      value: new Date().getTime(),
      id: `feedback-${new Date().getTime()}`
    };
    
    // Log the performance metric
    console.log('[Performance]', metric);
  };

  // Submit mutation with enhanced error tracking and performance metrics
  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackSubmissionData) => {
      const startTime = performance.now();
      logSubmissionAttempt(data);
      
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        // Log response time
        const responseTime = performance.now() - startTime;
        console.log(`[Feedback] Server response time: ${responseTime.toFixed(2)}ms`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Feedback] Submission failed', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error
          });
          throw new Error(errorData.error || 'Something went wrong');
        }
        
        return response.json();
      } catch (error) {
        // Enhanced error logging
        console.error('[Feedback] Error submitting feedback', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[Feedback] Submission successful', {
        id: data.feedback?.id,
        type: data.feedback?.type
      });
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
        variant: "default"
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", content: "", type: "general", rating: 5 });
      
      // Log success metrics
      trackSubmissionMetrics();
      
      // Reset form visibility after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error: Error) => {
      // Log client-side error handling
      console.error('[Feedback] Client error handler triggered', {
        error: error.message
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate form data using Zod schema
    const result = feedbackSchema.safeParse(formData);
    
    if (!result.success) {
      // Extract and format validation errors
      const errors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        const field = error.path[0].toString();
        errors[field] = error.message;
      });
      
      // Set validation errors
      setValidationErrors(errors);
      
      // Display validation error toast
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      
      return;
    }
    
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
    
    // Log validation success
    console.log('[Feedback] Validation successful, submitting data');
    
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
        <motion.div 
          className="bg-green-800/20 border border-green-500/50 rounded-md p-6 mb-8 overflow-hidden relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-70"></div>
          <div className="flex items-start">
            <div className="shrink-0 bg-green-500/20 rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-1">Thank you for your feedback!</h3>
              <p className="text-green-400/80">We appreciate your input and will review it shortly.</p>
            </div>
          </div>
          
          <motion.div 
            className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400 mt-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5 }}
          />
        </motion.div>
      ) : (
        <>
          {/* Form Status Banner */}
          <div className={`rounded-md p-4 mb-6 transition-all duration-300 ${
            Object.keys(validationErrors).length > 0 
              ? "bg-red-800/20 border border-red-500/50" 
              : formData.name.length >= 2 && 
                formData.email.includes('@') && 
                formData.email.includes('.') && 
                formData.type && 
                formData.content.length >= 10
                ? "bg-green-800/20 border border-green-500/50"
                : "bg-blue-800/10 border border-blue-500/50"
          }`}>
            {Object.keys(validationErrors).length > 0 ? (
              <>
                <h3 className="text-red-400 font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-red-400">
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </>
            ) : formData.name.length >= 2 && 
                formData.email.includes('@') && 
                formData.email.includes('.') && 
                formData.type && 
                formData.content.length >= 10 ? (
              <p className="text-green-400 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Your form is ready to submit!
              </p>
            ) : (
              <div className="space-y-2 p-3 bg-background/50 border border-border/60 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span className="text-blue-400 font-medium">Required Steps</span>
                  </div>
                  <span className="text-sm font-medium" style={{
                    color: calculateFormProgress() === 100 ? '#10b981' : '#3b82f6'
                  }}>
                    {calculateFormProgress()}% complete
                  </span>
                </div>

                <div className="space-y-2 pl-1">
                  <div>
                    <span className={formData.name.length >= 2 ? 'text-green-500' : 'text-muted-foreground'}>
                      1. Enter your name
                    </span>
                  </div>
                  
                  <div>
                    <span className={formData.email.includes('@') && formData.email.includes('.') ? 'text-green-500' : 'text-muted-foreground'}>
                      2. Provide a valid email
                    </span>
                  </div>
                  
                  <div>
                    <span className={formData.type ? 'text-green-500' : 'text-muted-foreground'}>
                      3. Select feedback type
                    </span>
                  </div>
                  
                  <div>
                    <span className={formData.content.length >= 10 ? 'text-green-500' : 'text-muted-foreground'}>
                      4. Write your feedback (min. 10 characters)
                    </span>
                  </div>
                  
                  <div>
                    <span className={parseInt(formData.rating.toString()) > 0 ? 'text-green-500' : 'text-muted-foreground'}>
                      5. Select a rating
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">Your Name</label>
                <div className="relative">
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className={`transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                      validationErrors.name 
                        ? "border-red-500 pr-10 focus:border-red-500 focus:ring-red-500/20" 
                        : formData.name.length >= 2 
                          ? "border-green-500 pr-10 focus:border-green-500 focus:ring-green-500/20"
                          : "pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {/* Check mark removed */}
                </div>
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">Your Email</label>
                <div className="relative">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className={`transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                      validationErrors.email 
                        ? "border-red-500 pr-10 focus:border-red-500 focus:ring-red-500/20" 
                        : formData.email.includes('@') && formData.email.includes('.')
                          ? "border-green-500 pr-10 focus:border-green-500 focus:ring-green-500/20"
                          : "pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {formData.email.includes('@') && formData.email.includes('.') && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium">Feedback Type</label>
              <div className="relative">
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger 
                    id="type" 
                    className={`transition-all duration-200 mb-1 ${
                      validationErrors.type 
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:ring-offset-1 outline-none" 
                        : formData.type 
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-1 outline-none" 
                          : "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 outline-none"
                    }`}
                  >
                    <SelectValue placeholder="Select type" />
                    {formData.type && (
                      <div className="absolute inset-y-0 right-[30px] flex items-center pr-2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </SelectTrigger>
                  <SelectContent side="bottom" className="max-h-[140px] overflow-y-auto w-full min-w-[180px]">
                    {feedbackTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="cursor-pointer focus:bg-primary/10 focus:text-foreground hover:bg-primary/10"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {validationErrors.type && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.type}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium">Your Feedback</label>
              <div className="relative">
                <Textarea 
                  id="content" 
                  name="content" 
                  rows={6} 
                  value={formData.content}
                  onChange={handleChange}
                  required 
                  className={`resize-none pr-10 transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                    validationErrors.content 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : formData.content.length >= 10 
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : "focus:border-blue-500 focus:ring-blue-500/20"
                  }`} 
                  maxLength={2000}
                />
                {formData.content.length >= 10 && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div>
                  {validationErrors.content && (
                    <p className="text-sm text-red-500">{validationErrors.content}</p>
                  )}
                </div>
                <div className="text-xs flex items-center">
                  <div className="relative w-[60px] h-[18px] mr-2">
                    <svg className="w-full h-full" viewBox="0 0 60 18">
                      <defs>
                        <linearGradient id="characterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      {/* Background track */}
                      <rect x="0" y="7" width="60" height="4" rx="2" fill="#374151" />
                      {/* Animated fill */}
                      <motion.rect
                        initial={{ width: 0 }}
                        animate={{ width: Math.min(60, (formData.content.length / 2000) * 60) }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        x="0" 
                        y="7" 
                        height="4" 
                        rx="2" 
                        fill="url(#characterGradient)" 
                      />
                    </svg>
                  </div>
                  <span className={`transition-colors duration-300 ${
                    formData.content.length > 1800 
                      ? "text-amber-400" 
                      : formData.content.length > 0 
                        ? "text-muted-foreground" 
                        : "text-muted-foreground/60"
                  }`}>
                    {formData.content.length}/2000
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium">How would you rate your experience?</label>
              <div className="relative">
                <RadioGroup
                  className={`flex flex-wrap gap-2 sm:gap-4 justify-between sm:justify-start sm:space-x-4 ${
                    validationErrors.rating 
                      ? "border border-red-500 p-3 rounded-md" 
                      : parseInt(formData.rating.toString()) > 0 
                        ? "border border-green-500/40 p-3 rounded-md" 
                        : "p-3"
                  }`}
                  defaultValue="5"
                  value={formData.rating.toString()}
                  onValueChange={handleRatingChange}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex items-center space-x-1 bg-background/50 p-1 rounded hover:bg-accent/30 transition-colors">
                      <RadioGroupItem 
                        value={num.toString()} 
                        id={`rating-${num}`} 
                        className="text-primary border-primary focus:ring-primary focus-visible:ring-primary"
                      />
                      <Label 
                        htmlFor={`rating-${num}`}
                        className={`text-base ${parseInt(formData.rating.toString()) === num ? "font-medium text-primary" : ""}`}
                      >
                        {num}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {/* Rating checkmark removed */}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              {validationErrors.rating && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.rating}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className={`relative w-full sm:w-auto overflow-hidden transition-all duration-300 ${
                submitMutation.isPending 
                  ? "bg-primary/80 text-primary-foreground/90" 
                  : "hover:shadow-md hover:shadow-primary/20"
              }`}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                  
                  {/* Animated loading bar at bottom of button */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[2px] bg-primary-foreground/50"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </motion.div>
              ) : (
                <motion.span
                  initial={{ y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="flex items-center justify-center"
                >
                  Submit Feedback
                </motion.span>
              )}
            </Button>
          </form>
        </>
      )}
    </motion.div>
  );
}