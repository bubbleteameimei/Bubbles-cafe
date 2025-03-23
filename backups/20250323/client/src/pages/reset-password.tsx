import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Password validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [location, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const { toast } = useToast();

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (!tokenParam) {
      toast({
        title: "Error",
        description: "Missing password reset token",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setToken(tokenParam);
    console.log("[ResetPassword] Processing reset token:", tokenParam.substring(0, 10) + "...");
    
    // Verify token with the backend
    const verifyToken = async () => {
      try {
        // Show loading toast
        toast({
          title: "Verifying Token",
          description: "Please wait while we verify your reset token...",
        });
        
        const response = await fetch(`/api/auth/verify-reset-token/${tokenParam}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token');
        }
        
        setIsValid(true);
        
        // Show success toast once verified
        toast({
          title: "Token Verified",
          description: "Your reset token is valid. You can now set a new password.",
          variant: "default",
        });
      } catch (error) {
        console.error('[ResetPassword] Error verifying token:', error);
        toast({
          title: "Invalid Token",
          description: error instanceof Error ? error.message : "Your password reset link is invalid or has expired",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, []);

  const validateForm = (): boolean => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { password?: string; confirmPassword?: string } = {};
        error.errors.forEach(err => {
          if (err.path[0] === 'password') {
            formattedErrors.password = err.message;
          }
          if (err.path[0] === 'confirmPassword') {
            formattedErrors.confirmPassword = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) validateForm();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully",
      });
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md border border-slate-800 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verifying Reset Token</CardTitle>
            <CardDescription>Please wait while we verify your reset token</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md border border-slate-800 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Password Reset Successfully</CardTitle>
            <CardDescription>Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You can now sign in with your new password
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md border border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                disabled={isLoading}
                className="auth-input"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="font-semibold">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your new password"
                disabled={isLoading}
                className="auth-input"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Alert variant="default" className="bg-amber-950/20 border-amber-900 text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password must be at least 6 characters long
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}