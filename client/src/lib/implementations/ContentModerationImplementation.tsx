import React, { useState, useEffect } from 'react';
import Filter from 'bad-words';
import profanity from 'leo-profanity';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

// Initialize profanity filters
// This initialization would typically happen at app startup, not component level
const filter = new Filter();
profanity.loadDictionary(); // Default English dictionary

// Add some custom words to both filters
const customBadWords = ['badword1', 'badword2'];
filter.addWords(...customBadWords);
profanity.add(customBadWords);

// Comment Form with Profanity Filtering
export const CommentForm = () => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isProfane, setIsProfane] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Check for profanity on comment change
  useEffect(() => {
    if (comment.trim()) {
      const hasProfanity = filter.isProfane(comment) || profanity.check(comment);
      setIsProfane(hasProfanity);
      setError(hasProfanity ? 'Your comment contains inappropriate language.' : '');
    } else {
      setIsProfane(false);
      setError('');
    }
  }, [comment]);
  
  // Mock submission function
  const submitComment = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      setComment('');
      setIsSubmitted(false);
    }, 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    
    if (isProfane) {
      setError('Please remove inappropriate language before submitting.');
      return;
    }
    
    // Submit clean comment
    submitComment();
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Comment</CardTitle>
        <CardDescription>
          Share your thoughts on this story. All comments are moderated.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comment</Label>
            <Textarea 
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className={isProfane ? 'border-red-500 focus:ring-red-500' : ''}
              rows={4}
            />
            
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSubmitted && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 py-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>Comment submitted successfully!</AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isProfane || !comment.trim() || isSubmitting || isSubmitted}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Content Moderation Tool
export const ContentModerationTool = () => {
  const [content, setContent] = useState('');
  const [moderatedContent, setModeratedContent] = useState('');
  const [filterType, setFilterType] = useState('detect'); // 'detect', 'clean', 'censor'
  const [dictionary, setDictionary] = useState('en');
  
  // Load selected dictionary
  useEffect(() => {
    profanity.loadDictionary(dictionary);
  }, [dictionary]);
  
  // Process content based on filter type
  const processContent = () => {
    if (!content.trim()) return;
    
    switch (filterType) {
      case 'detect':
        const badWordsFilter = filter.isProfane(content);
        const leoProfanityFilter = profanity.check(content);
        setModeratedContent(
          `Detection Results:\n` +
          `- Bad-words filter: ${badWordsFilter ? 'Profanity detected' : 'No profanity detected'}\n` +
          `- Leo-profanity filter: ${leoProfanityFilter ? 'Profanity detected' : 'No profanity detected'}`
        );
        break;
      
      case 'clean':
        // Clean with both filters
        let cleaned = content;
        // First clean with leo-profanity
        cleaned = profanity.clean(cleaned, '*');
        // Then clean with bad-words
        cleaned = filter.clean(cleaned);
        setModeratedContent(cleaned);
        break;
      
      case 'censor':
        // Similar to clean but with different patterns
        let censored = content;
        // Leo-profanity allows custom replacement
        censored = profanity.clean(censored, '###');
        setModeratedContent(censored);
        break;
    }
  };
  
  // Handle dictionary change
  const handleDictionaryChange = (value: string) => {
    setDictionary(value);
    profanity.loadDictionary(value);
  };
  
  // Clear all fields
  const handleClear = () => {
    setContent('');
    setModeratedContent('');
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Content Moderation Tool
        </CardTitle>
        <CardDescription>
          Detect and filter inappropriate content using multiple profanity filters.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-type">Filter Action</Label>
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Select filter action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detect">Detect Profanity</SelectItem>
                <SelectItem value="clean">Clean Content</SelectItem>
                <SelectItem value="censor">Censor Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dictionary">Dictionary</Label>
            <Select
              value={dictionary}
              onValueChange={handleDictionaryChange}
            >
              <SelectTrigger id="dictionary">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content to Moderate</Label>
          <Textarea 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to be checked or moderated..."
            rows={5}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={processContent} disabled={!content.trim()}>
            Process Content
          </Button>
        </div>
        
        {moderatedContent && (
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="result">Result</Label>
            <Textarea 
              id="result"
              value={moderatedContent}
              readOnly
              rows={5}
              className="bg-muted"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Complete Content Moderation Page with both components
export const ContentModerationPage = () => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold">Content Moderation</h2>
      <div className="grid grid-cols-1 gap-8">
        <CommentForm />
        <ContentModerationTool />
      </div>
    </div>
  );
};

export default ContentModerationPage;