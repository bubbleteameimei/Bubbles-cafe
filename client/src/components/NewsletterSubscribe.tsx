import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

export function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-card rounded-lg shadow-sm">
      <div className="flex justify-center space-x-4">
        <Button
          variant={userRating === true ? "default" : "outline"}
          onClick={() => onSubmit({ postId, isLike: true })}
          disabled={rateMutation.isPending}
        >
          👍 Like
        </Button>
        <Button
          variant={userRating === false ? "default" : "outline"}
          onClick={() => onSubmit({ postId, isLike: false })}
          disabled={rateMutation.isPending}
        >
          👎 Dislike
        </Button>
      </div>
    </div>
  );
}