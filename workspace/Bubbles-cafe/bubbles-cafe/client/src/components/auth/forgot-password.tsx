import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Email validation schema
const emailSchema = z.string().email('Please enter a valid email address');

export function ForgotPasswordDialog() {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    try {
      emailSchema.parse(email);
      setEmailError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0]?.message || 'Invalid email');
      } else {
        setEmailError('Please enter a valid email address');
      }
      return false;
    }
  };

  const handleResetRequest = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make API call to request password reset
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      console.log("[ForgotPassword] Password reset requested for:", email);
      
      // Set email sent state regardless of outcome (for security)
      setEmailSent(true);
      
      // Check if email was actually sent 
      if (data.emailSent === false) {
        // Email service failed, but we still have token for testing in dev mode
        console.log("[ForgotPassword] Email service failed but continuing with token-based flow");
        toast({
          title: "Email Delivery Issue",
          description: "There was an issue delivering the email, but we'll provide you a direct link",
          variant: "default",
        });
      } else {
        // Regular success message when email was sent successfully
        toast({
          title: "Reset Email Sent",
          description: "Check your inbox for instructions to reset your password",
        });
      }
      
      // In development, show token and direct link
      if (data.token) {
        console.log("[ForgotPassword] Reset token for testing:", data.token);
        
        // Navigate to reset password page with token
        const resetUrl = `/reset-password?token=${data.token}`;
        
        // Show info message with link after a short delay
        setTimeout(() => {
          toast({
            title: "Reset Link Available",
            description: "Click the button below to reset your password",
            action: (
              <Button 
                variant="outline" 
                onClick={() => window.open(resetUrl, '_blank')}
                className="mt-2"
              >
                Open Reset Page
              </Button>
            ),
            duration: 10000,
          });
        }, 1000);
      }
      
      // Close the dialog after a delay
      setTimeout(() => {
        setIsOpen(false);
        // Reset state for next time
        setTimeout(() => {
          setEmailSent(false);
          setEmail('');
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error("[ForgotPassword] Error requesting password reset:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setTimeout(() => {
        setEmailSent(false);
        setEmail('');
        setEmailError('');
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px] bg-background text-foreground border border-slate-800 shadow-xl shadow-black/20"
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
      >
        <DialogHeader>
          <DialogTitle id="forgot-password-title" className="text-xl font-bold">Reset your password</DialogTitle>
          <DialogDescription id="forgot-password-description" className="text-muted-foreground">
            Enter your email address to receive a password reset link.
          </DialogDescription>
        </DialogHeader>
        
        {!emailSent ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email" className="font-semibold">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  placeholder="Enter your email address"
                  className="auth-input"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      e.preventDefault();
                      handleResetRequest();
                    }
                  }}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>
              
              <Alert variant="default" className="bg-amber-950/20 border-amber-900 text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enter the email address associated with your account
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                className="w-full" 
                onClick={handleResetRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Email Sent</h3>
            <p className="text-muted-foreground mt-2">
              Check your inbox for instructions to reset your password
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}