"use client"

import { useState } from 'react';
import { MoreHorizontal, Check, X, Clock, Tag, MessageCircle, Copy, Bot, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FeedbackCategory, FeedbackStatus } from './FeedbackCategoryFilter';
import { cn } from '@/lib/utils';

export interface ResponseSuggestion {
  suggestion: string;
  confidence: number;
  category: string;
  tags?: string[];
  template?: string;
  isAutomated: boolean;
}

export interface FeedbackItem {
  id: number;
  content: string;
  type: FeedbackCategory;
  // rating field removed
  page: string;
  category: string;
  status: FeedbackStatus;
  createdAt: string;
  metadata: {
    browser: string;
    operatingSystem: string;
    screenResolution: string;
    userAgent: string;
    name?: string;
    email?: string;
  };
  internalNotes?: string;
  responseSuggestion?: ResponseSuggestion;
  responseHints?: string[];
}

interface FeedbackDetailsProps {
  feedback: FeedbackItem;
  onStatusChange: (id: number, status: FeedbackStatus) => void;
  onAddNote: (id: number, note: string) => void;
}

export function FeedbackDetails({ feedback, onStatusChange, onAddNote }: FeedbackDetailsProps) {
  const [internalNote, setInternalNote] = useState(feedback.internalNotes || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors: Record<FeedbackStatus, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    all: '' // This won't be used for display
  };

  const categoryColors: Record<FeedbackCategory, string> = {
    bug: 'bg-red-500/10 text-red-500 border-red-500/20',
    suggestion: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    praise: 'bg-green-500/10 text-green-500 border-green-500/20',
    complaint: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    all: '' // This won't be used for display
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    reviewed: <Check className="h-4 w-4" />,
    resolved: <Check className="h-4 w-4" />,
    rejected: <X className="h-4 w-4" />
  };

  const handleSaveNote = () => {
    onAddNote(feedback.id, internalNote);
    setIsEditingNote(false);
    toast.success('Note saved successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 transition-all hover:shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("px-2 py-0.5", categoryColors[feedback.type])}>
              {feedback.type}
            </Badge>
            <Badge variant="outline" className={cn("px-2 py-0.5", statusColors[feedback.status])}>
              {statusIcons[feedback.status as keyof typeof statusIcons]}
              <span className="ml-1">{feedback.status}</span>
            </Badge>
            {/* Rating badge removed */}
          </div>
          <h3 className="text-base font-medium">
            Feedback #{feedback.id}
            {feedback.metadata.name && <span className="text-muted-foreground font-normal ml-2">from {feedback.metadata.name}</span>}
          </h3>
          <p className="text-sm text-muted-foreground">
            {feedback.page && <span>Page: {feedback.page} • </span>}
            Submitted: {formatDate(feedback.createdAt)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'pending')}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'reviewed')}>
              Mark as Reviewed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'resolved')}>
              Mark as Resolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'rejected')}>
              Mark as Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3">
        <div className="text-sm mb-2">{feedback.content}</div>
        
        <Button 
          variant="link" 
          className="px-0 text-xs" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more details'}
        </Button>
        
        {isExpanded && (
          <div className="mt-3 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <p className="font-medium">Browser:</p>
                <p>{feedback.metadata.browser}</p>
              </div>
              <div>
                <p className="font-medium">Operating System:</p>
                <p>{feedback.metadata.operatingSystem}</p>
              </div>
              <div>
                <p className="font-medium">Screen Resolution:</p>
                <p>{feedback.metadata.screenResolution}</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>{feedback.metadata.email || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="font-medium text-xs mb-1 flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                Internal Notes:
              </p>
              {isEditingNote ? (
                <div className="space-y-2">
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add internal notes about this feedback..."
                    className="min-h-[100px] text-xs"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingNote(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveNote}
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground">
                    {internalNote || 'No notes added yet.'}
                  </p>
                  <Button 
                    variant="link" 
                    className="px-0 text-xs mt-1" 
                    onClick={() => setIsEditingNote(true)}
                  >
                    {internalNote ? 'Edit Note' : 'Add Note'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox id={`mark-resolved-${feedback.id}`} />
              <label
                htmlFor={`mark-resolved-${feedback.id}`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as addressed in next release
              </label>
            </div>
            
            {/* AI Response Suggestion Section */}
            {feedback.responseSuggestion && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-xs flex items-center">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Response Suggestion
                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {Math.round(feedback.responseSuggestion.confidence * 100)}% confidence
                    </Badge>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (feedback.responseSuggestion) {
                        navigator.clipboard.writeText(feedback.responseSuggestion.suggestion);
                        toast.success('Response suggestion copied to clipboard');
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy suggestion</span>
                  </Button>
                </div>
                
                <Card className="p-2 bg-muted/50 text-xs">
                  <p>{feedback.responseSuggestion?.suggestion}</p>
                </Card>
                
                {feedback.responseSuggestion?.tags && feedback.responseSuggestion.tags.length > 0 && (
                  <div className="mt-1">
                    <p className="text-[10px] text-muted-foreground flex items-center mb-1">
                      <Tag className="h-3 w-3 mr-1" />
                      Tags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {feedback.responseSuggestion.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="px-1 py-0 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Admin Response Hints */}
            {feedback.responseHints && feedback.responseHints.length > 0 && (
              <div className="pt-3 border-t">
                <p className="font-medium text-xs flex items-center mb-2">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Response Hints
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {feedback.responseHints.map((hint, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-1">•</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}