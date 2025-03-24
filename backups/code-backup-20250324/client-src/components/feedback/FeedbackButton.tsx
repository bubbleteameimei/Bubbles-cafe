import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showIcon?: boolean;
  buttonText?: string;
}

export function FeedbackButton({
  variant = 'default',
  size = 'default',
  position = 'bottom-left',
  showIcon = true,
  buttonText = 'Feedback',
}: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Map position to CSS classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4 mb-2 ml-1', // Adjusted for better positioning
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`${positionClasses[position]} z-50 shadow-md hover:shadow-lg transition-shadow`}
          aria-label="Open feedback form"
        >
          {showIcon && <MessageSquare className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>
            We value your feedback to help us improve our service.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm />
      </DialogContent>
    </Dialog>
  );
}