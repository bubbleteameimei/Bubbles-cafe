import React, { useState, useRef } from 'react';
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
import { Info, Bold, Italic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  
  // Apply formatting (bold, italic) to selected text
  const applyFormatting = (formatType: 'bold' | 'italic') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.length === 0) {
      // No text selected, insert placeholder with formatting
      const placeholder = formatType === 'bold' ? 'bold text' : 'italic text';
      const markers = formatType === 'bold' ? '**' : '*';
      const formattedText = `${markers}${placeholder}${markers}`;
      
      const currentContent = form.getValues('content');
      const newText = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
      
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
    
    let newText = '';
    const currentContent = form.getValues('content');
    
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
      // Apply formatting based on type
      if (formatType === 'bold') {
        newText = currentContent.substring(0, start) + `**${selectedText}**` + currentContent.substring(end);
      } else if (formatType === 'italic') {
        newText = currentContent.substring(0, start) + `*${selectedText}*` + currentContent.substring(end);
      }
      
      // Focus back on textarea and keep the text selected with formatting
      setTimeout(() => {
        textarea.focus();
        const markersLength = formatType === 'bold' ? 2 : 1;
        textarea.setSelectionRange(start + markersLength, end + markersLength);
      }, 10);
    }
    
    // Update form
    form.setValue('content', newText);
  };

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
                      {/* Formatting toolbar */}
                      <div className="flex flex-wrap items-center gap-2 py-2 px-3 border border-input bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 rounded-md mb-2 shadow-sm">
                        <div className="text-xs font-medium mr-1 text-primary/80">Format Text:</div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 flex gap-1 items-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200 group"
                          onClick={() => applyFormatting('bold')}
                        >
                          <Bold className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-medium">Bold</span>
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 flex gap-1 items-center hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-all duration-200 group"
                          onClick={() => applyFormatting('italic')}
                        >
                          <Italic className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-medium">Italic</span>
                        </Button>
                        <div className="text-xs text-muted-foreground mt-1 sm:mt-0 ml-0 sm:ml-auto flex flex-wrap gap-1 items-center">
                          <span className="hidden sm:inline">Keyboard shortcuts:</span>
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                            Select text + B
                          </kbd>
                          <span className="hidden xs:inline">/</span>
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                            Select text + I
                          </kbd>
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