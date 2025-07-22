import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2 } from 'lucide-react';

export function FreshNewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Reset states
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Submitting to newsletter API...');
      
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Successfully subscribed to newsletter:', data);
        setSuccess(true);
        setEmail('');
        
        toast({
          title: "Subscription successful!",
          description: "Check your inbox for a welcome email with our latest news.",
          variant: "default",
        });
      } else {
        console.error('Error subscribing to newsletter:', data);
        setError(data.message || 'Failed to subscribe. Please try again.');
        
        toast({
          title: "Subscription failed",
          description: data.message || "There was a problem with your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Exception during newsletter subscription:', err);
      setError('Network error. Please check your connection and try again.');
      
      toast({
        title: "Connection error",
        description: "Couldn't connect to our servers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-1">Stay Updated</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to receive the latest updates, stories, and events directly to your inbox.
        </p>
      </div>
      
      {success ? (
        <div className="flex items-center p-4 mb-4 text-sm rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
          <Check className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Great! Please check your inbox for our welcome email.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              id="newsletter-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
              aria-label="Email for newsletter"
              disabled={isLoading}
            />
            
            {error && (
              <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                <X className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe to Newsletter'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}