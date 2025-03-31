import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { THEME_CATEGORIES } from '@/lib/content-analysis';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote,
  Undo,
  HelpCircle
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger, 
} from "@/components/ui/tooltip";

// Simpler form schema for community posts with lower character requirements
const postSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must be at most 100 characters' }),
  content: z.string().min(25, { message: 'Content must be at least 25 characters' }),
  themeCategory: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface SimplePostEditorProps {
  postId?: number;
  onClose?: () => void;
}

export default function SimplePostEditor({ postId, onClose }: SimplePostEditorProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('write');

  // Form setup with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      themeCategory: 'NONE',
    },
  });

  // Create/update post mutation
  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (data: PostFormValues) => {
      // Always mark as community post in the metadata
      const postData = {
        ...data,
        metadata: {
          isCommunityPost: true,
          isAdminPost: false,
          status: 'publish', // Explicitly set status to ensure it's published
          themeCategory: data.themeCategory === 'NONE' ? null : data.themeCategory
        }
      };
      
      if (postId) {
        // Update existing post
        return apiRequest(`/api/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify(postData),
          credentials: 'include', // Include credentials for CSRF
        });
      } else {
        // Create new post
        return apiRequest('/api/posts', {
          method: 'POST',
          body: JSON.stringify(postData),
          credentials: 'include', // Include credentials for CSRF
        });
      }
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: postId ? 'Story updated' : 'Story submitted',
        description: postId 
          ? 'Your horror story has been updated successfully.' 
          : 'Your horror story has been submitted successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      
      // Navigate back to community page
      navigate('/community');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PostFormValues) => {
    submitPost(data);
  };

  // Handle cancel
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/community');
    }
  };

  // Calculate word count and character count
  const wordCount = form.watch('content')?.trim().split(/\s+/).filter(Boolean).length || 0;
  const charCount = form.watch('content')?.length || 0;
  
  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Apply formatting to selected text
  const applyFormatting = (formatType: 'bold' | 'italic' | 'heading1' | 'heading2' | 'list' | 'orderedList' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = form.getValues('content');
    let newText = currentContent;
    
    // Function to find the start of the current line
    const findLineStart = (text: string, position: number): number => {
      for (let i = position; i >= 0; i--) {
        if (text[i] === '\n') return i + 1;
      }
      return 0;
    };
    
    // Get the position of the start of the current line
    const lineStart = findLineStart(currentContent, start);
    
    // Handle different formatting types
    switch (formatType) {
      case 'bold':
      case 'italic': {
        if (selectedText.length === 0) {
          // No text selected, insert placeholder with formatting
          const placeholder = formatType === 'bold' ? 'bold text' : 'italic text';
          const markers = formatType === 'bold' ? '**' : '*';
          const formattedText = `${markers}${placeholder}${markers}`;
          
          newText = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
          
          // Update form
          form.setValue('content', newText);
          
          // Focus back on textarea and select the placeholder text
          setTimeout(() => {
            textarea.focus();
            const placeholderStart = start + markers.length;
            const placeholderEnd = placeholderStart + placeholder.length;
            textarea.setSelectionRange(placeholderStart, placeholderEnd);
          }, 10);
          
          return;
        }
        
        // Check if text is already formatted
        const isAlreadyFormatted = 
          (formatType === 'bold' && selectedText.startsWith('**') && selectedText.endsWith('**')) || 
          (formatType === 'italic' && selectedText.startsWith('*') && selectedText.endsWith('*') && 
           (!selectedText.startsWith('**') && !selectedText.endsWith('**')));
        
        if (isAlreadyFormatted) {
          // Remove formatting
          if (formatType === 'bold') {
            const unformattedText = selectedText.substring(2, selectedText.length - 2);
            newText = currentContent.substring(0, start) + unformattedText + currentContent.substring(end);
            
            // Update cursor position to account for removed formatting
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start, start + unformattedText.length);
            }, 10);
          } else {
            const unformattedText = selectedText.substring(1, selectedText.length - 1);
            newText = currentContent.substring(0, start) + unformattedText + currentContent.substring(end);
            
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start, start + unformattedText.length);
            }, 10);
          }
        } else {
          // Apply formatting
          const markers = formatType === 'bold' ? '**' : '*';
          newText = currentContent.substring(0, start) + 
                    `${markers}${selectedText}${markers}` + 
                    currentContent.substring(end);
          
          // Focus back on textarea and keep the text selected with formatting
          setTimeout(() => {
            textarea.focus();
            const markersLength = markers.length;
            textarea.setSelectionRange(start + markersLength, end + markersLength);
          }, 10);
        }
        break;
      }
      
      case 'heading1':
      case 'heading2': {
        // Get the current line text
        const nextNewline = currentContent.indexOf('\n', lineStart);
        const endOfLine = nextNewline > -1 ? nextNewline : currentContent.length;
        const lineText = currentContent.substring(lineStart, endOfLine);
        
        // Check if line already has heading
        const hasHeading1 = lineText.startsWith('# ');
        const hasHeading2 = lineText.startsWith('## ');
        
        // Determine what to add or remove
        if (formatType === 'heading1' && hasHeading1) {
          // Remove heading 1
          newText = currentContent.substring(0, lineStart) + 
                    lineText.substring(2) + 
                    currentContent.substring(endOfLine);
        } else if (formatType === 'heading2' && hasHeading2) {
          // Remove heading 2
          newText = currentContent.substring(0, lineStart) + 
                    lineText.substring(3) + 
                    currentContent.substring(endOfLine);
        } else {
          // Remove any existing heading first
          let cleanedLine = lineText;
          if (hasHeading1) cleanedLine = lineText.substring(2);
          if (hasHeading2) cleanedLine = lineText.substring(3);
          
          // Add the heading
          const prefix = formatType === 'heading1' ? '# ' : '## ';
          newText = currentContent.substring(0, lineStart) + 
                    prefix + cleanedLine + 
                    currentContent.substring(endOfLine);
        }
        
        // Set cursor at end of line
        setTimeout(() => {
          textarea.focus();
          const newLineEnd = lineStart + (newText.substring(lineStart).indexOf('\n') > -1 
            ? newText.substring(lineStart).indexOf('\n') 
            : newText.substring(lineStart).length);
          textarea.setSelectionRange(newLineEnd, newLineEnd);
        }, 10);
        break;
      }
      
      case 'list':
      case 'orderedList': {
        // Split selected text into lines
        const lines = selectedText.split('\n');
        
        // Check if text already has list formatting
        const listPrefix = formatType === 'list' ? '- ' : '1. ';
        const isAlreadyList = lines.every(line => 
          line.trim().startsWith(formatType === 'list' ? '- ' : /^\d+\.\s/.test(line.trim())));
        
        if (isAlreadyList) {
          // Remove list formatting
          const unlistedText = lines.map(line => {
            if (formatType === 'list') {
              return line.replace(/^-\s+/, '');
            } else {
              return line.replace(/^\d+\.\s+/, '');
            }
          }).join('\n');
          
          newText = currentContent.substring(0, start) + unlistedText + currentContent.substring(end);
        } else {
          // Add list formatting
          const listedText = lines.map((line, index) => {
            if (!line.trim()) return line; // Skip empty lines
            
            if (formatType === 'list') {
              return `- ${line}`;
            } else {
              return `${index + 1}. ${line}`;
            }
          }).join('\n');
          
          newText = currentContent.substring(0, start) + listedText + currentContent.substring(end);
        }
        
        // Set focus after operation
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start, 
            start + newText.substring(start, start + listedText.length).length
          );
        }, 10);
        break;
      }
      
      case 'quote': {
        // Split selected text into lines
        const lines = selectedText.split('\n');
        
        // Check if already quoted
        const isAlreadyQuoted = lines.every(line => line.trim().startsWith('> '));
        
        if (isAlreadyQuoted) {
          // Remove quote
          const unquotedText = lines.map(line => line.replace(/^>\s+/, '')).join('\n');
          newText = currentContent.substring(0, start) + unquotedText + currentContent.substring(end);
        } else {
          // Add quote
          const quotedText = lines.map(line => {
            if (!line.trim()) return line; // Skip empty lines
            return `> ${line}`;
          }).join('\n');
          
          newText = currentContent.substring(0, start) + quotedText + currentContent.substring(end);
        }
        
        // Set focus after operation
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start, 
            start + newText.substring(start, start + selectedText.length * 2).length
          );
        }, 10);
        break;
      }
    }
    
    // Update form with new text
    form.setValue('content', newText);
  };
  
  // Add keyboard shortcuts for text formatting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only proceed if textarea is focused
      if (document.activeElement !== textareaRef.current) return;
      
      // Bold: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        applyFormatting('bold');
      }
      
      // Italic: Ctrl/Cmd + I
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        applyFormatting('italic');
      }
      
      // Heading 1: Ctrl/Cmd + 1
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        applyFormatting('heading1');
      }
      
      // Heading 2: Ctrl/Cmd + 2
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        applyFormatting('heading2');
      }
      
      // Unordered List: Ctrl/Cmd + U
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        applyFormatting('list');
      }
      
      // Ordered List: Ctrl/Cmd + O
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        applyFormatting('orderedList');
      }
      
      // Quote: Ctrl/Cmd + Q
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        applyFormatting('quote');
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Write/Preview tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="write" className="flex-1">Write</TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Write tab */}
            <TabsContent value="write" className="space-y-6">
              <Card className="bg-muted/40 mb-4">
                <CardContent className="p-4 flex gap-2 text-sm">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p>Share your horror story with the community. Keep it simple - use plain text to tell your story.</p>
                    <p>Good horror stories focus on building suspense and creating an unsettling atmosphere.</p>
                  </div>
                </CardContent>
              </Card>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a catchy title for your horror story" 
                        {...field}
                        className="text-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Story</FormLabel>
                    <div className="space-y-2">
                      {/* Enhanced Formatting toolbar */}
                      <div className="border border-input bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 rounded-md mb-2 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 py-2 px-3 border-b border-input">
                          <div className="text-xs font-medium mr-1 text-primary/80">Text Style:</div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('bold')}
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Bold (Ctrl+B)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('italic')}
                                >
                                  <Italic className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Italic (Ctrl+I)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('heading1')}
                                >
                                  <Heading1 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Large Heading (Ctrl+1)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('heading2')}
                                >
                                  <Heading2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Medium Heading (Ctrl+2)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('list')}
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Bullet List (Ctrl+U)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('orderedList')}
                                >
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Numbered List (Ctrl+O)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200"
                                  onClick={() => applyFormatting('quote')}
                                >
                                  <Quote className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Block Quote (Ctrl+Q)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <div className="ml-auto">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="w-[280px]">
                                  <p className="text-xs font-medium mb-1">Formatting Tips:</p>
                                  <ul className="text-xs space-y-1">
                                    <li>• Use <b>bold</b> and <i>italic</i> for emphasis</li>
                                    <li>• Create headings to organize your story</li>
                                    <li>• Use lists for multiple related items</li>
                                    <li>• Block quotes for character dialogue or flashbacks</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-800/20 text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+B</kbd>
                            <span>Bold</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+I</kbd>
                            <span>Italic</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+1/2</kbd>
                            <span>Headings</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+U/O</kbd>
                            <span>Lists</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+Q</kbd>
                            <span>Quote</span>
                          </div>
                        </div>
                      </div>
                      
                      <FormControl>
                        <Textarea
                          {...field}
                          // Correctly combine the textarea ref
                          ref={(element) => {
                            textareaRef.current = element;
                          }}
                          placeholder="Write your horror story here..."
                          className="min-h-[300px] font-serif text-base leading-relaxed resize-y"
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {wordCount} words | {charCount} characters
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="themeCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horror Theme</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a horror theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          {Object.entries(THEME_CATEGORIES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            {/* Preview tab */}
            <TabsContent value="preview" className="min-h-[200px]">
              {form.watch('content') ? (
                <div className="prose dark:prose-invert max-w-none">
                  <h1 className="text-2xl font-bold mb-6 font-serif">{form.watch('title') || 'Untitled Horror Story'}</h1>
                  <div className="font-serif text-base leading-relaxed whitespace-pre-wrap">
                    {/* Handle basic markdown in preview with advanced processing */}
                    {form.watch('content')
                      // First handle double line breaks for paragraphs
                      .split('\n\n')
                      .map((paragraph, i) => {
                        // Process markdown within each paragraph
                        const processed = paragraph
                          // Handle bold text - non-greedy capture
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          // Handle italic text - non-greedy capture
                          .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
                          // Handle single line breaks as <br>
                          .replace(/\n/g, '<br />');
                        
                        return (
                          <p 
                            key={i} 
                            className="mb-4 font-serif text-base leading-relaxed" 
                            dangerouslySetInnerHTML={{ __html: processed }}
                          />
                        );
                      })
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Your preview will appear here. Start writing your horror story in the Write tab.
                </div>
              )}
            </TabsContent>
            
            {/* Submit buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : postId ? 'Update Story' : 'Submit Horror Story'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}