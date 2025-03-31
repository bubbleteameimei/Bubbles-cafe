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
// Simplified theme categories for the community page
const SIMPLIFIED_THEME_CATEGORIES = {
  'PSYCHOLOGICAL': { name: 'Psychological' },
  'SUPERNATURAL': { name: 'Supernatural' },
  'TECHNOLOGICAL': { name: 'Technological' },
  'BODY_HORROR': { name: 'Body Horror' },
  'GOTHIC': { name: 'Gothic' },
  'APOCALYPTIC': { name: 'Apocalyptic' },
  'HORROR': { name: 'General Horror' }
};
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  Bold, 
  Italic, 
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
  // Slug will be generated from title, not directly input by user
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

  // Get user information if available
  const { user } = useAuth();
  
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
      // Generate a slug from the title
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with a single one
          .trim() + '-' + Date.now().toString().slice(-4); // Add timestamp suffix to ensure uniqueness
      };
      
      const slug = generateSlug(data.title);
      
      // Generate an excerpt from the content (first 150 characters)
      const generateExcerpt = (content: string) => {
        return content.slice(0, 150) + (content.length > 150 ? '...' : '');
      };
      
      const excerpt = generateExcerpt(data.content);
      
      // Always mark as community post in the metadata
      const postData = {
        ...data,
        slug, // Add the generated slug
        excerpt, // Add an excerpt for display in cards
        authorId: user?.id || 1, // Use the logged-in user's ID or fallback to 1 (default user)
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
        // Create new post - use the community-specific endpoint
        return apiRequest('/api/posts/community', {
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
  
  // Apply formatting to selected text - simplified to only bold and italic
  const applyFormatting = (formatType: 'bold' | 'italic') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = form.getValues('content');
    let newText = currentContent;
    
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
    
    // Update form with new text
    form.setValue('content', newText);
  };
  
  // Add keyboard shortcuts for text formatting (simplified to bold and italic only)
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
                      {/* Simplified Formatting toolbar */}
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
                                    <li>• Use <b>bold</b> for emphasis on important words</li>
                                    <li>• Use <i>italic</i> for thoughts or subtle emphasis</li>
                                    <li>• Combine <b><i>both</i></b> for maximum emphasis</li>
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
                          <SelectItem value="PSYCHOLOGICAL">Psychological</SelectItem>
                          <SelectItem value="SUPERNATURAL">Supernatural</SelectItem>
                          <SelectItem value="TECHNOLOGICAL">Technological</SelectItem>
                          <SelectItem value="BODY_HORROR">Body Horror</SelectItem>
                          <SelectItem value="GOTHIC">Gothic</SelectItem>
                          <SelectItem value="APOCALYPTIC">Apocalyptic</SelectItem>
                          <SelectItem value="HORROR">General Horror</SelectItem>
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
                    {/* Enhanced markdown processing in preview */}
                    {form.watch('content')
                      // First handle double line breaks for paragraphs
                      .split('\n\n')
                      .map((paragraph, i) => {
                        // Check if it's a heading
                        if (paragraph.startsWith('# ')) {
                          return (
                            <h1 
                              key={i}
                              className="text-2xl font-bold mt-6 mb-4 font-serif" 
                              dangerouslySetInnerHTML={{ 
                                __html: paragraph.substring(2)
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
                                  .replace(/\n/g, '<br />')
                              }}
                            />
                          );
                        }

                        if (paragraph.startsWith('## ')) {
                          return (
                            <h2 
                              key={i}
                              className="text-xl font-bold mt-5 mb-3 font-serif" 
                              dangerouslySetInnerHTML={{ 
                                __html: paragraph.substring(3)
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
                                  .replace(/\n/g, '<br />')
                              }}
                            />
                          );
                        }

                        // Check if it's a list (unordered)
                        if (paragraph.split('\n').every(line => line.trim().startsWith('- '))) {
                          const listItems = paragraph.split('\n').map(line => {
                            const content = line.substring(2)
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                            return `<li>${content}</li>`;
                          }).join('');

                          return (
                            <ul key={i} className="list-disc pl-6 mb-4 space-y-1 font-serif">
                              <div dangerouslySetInnerHTML={{ __html: listItems }} />
                            </ul>
                          );
                        }

                        // Check if it's a list (ordered)
                        if (paragraph.split('\n').every(line => /^\d+\.\s/.test(line.trim()))) {
                          const listItems = paragraph.split('\n').map(line => {
                            const content = line.replace(/^\d+\.\s+/, '')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                            return `<li>${content}</li>`;
                          }).join('');

                          return (
                            <ol key={i} className="list-decimal pl-6 mb-4 space-y-1 font-serif">
                              <div dangerouslySetInnerHTML={{ __html: listItems }} />
                            </ol>
                          );
                        }

                        // Check if it's a blockquote
                        if (paragraph.split('\n').every(line => line.trim().startsWith('> '))) {
                          const quoteContent = paragraph.split('\n').map(line => {
                            return line.substring(2)
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                          }).join('<br />');

                          return (
                            <blockquote 
                              key={i} 
                              className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1 mb-4 italic font-serif text-slate-700 dark:text-slate-300"
                              dangerouslySetInnerHTML={{ __html: quoteContent }}
                            />
                          );
                        }
                        
                        // Regular paragraph
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