import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MDEditor from '@uiw/react-md-editor';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { THEME_CATEGORIES } from '@/lib/content-analysis';

// Form schema for post creation/editing
const postSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must be at most 100 characters' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters' }),
  summary: z.string().max(300, { message: 'Summary must be at most 300 characters' }).optional(),
  themeCategory: z.string().optional(),
  triggerWarnings: z.array(z.string()).optional(),
  isCommunityPost: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  isSecret: z.boolean().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostEditorProps {
  postId?: number;
  onClose?: () => void;
  isCommunityPost?: boolean;
}

export default function PostEditor({ postId, onClose, isCommunityPost = false }: PostEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('write');
  const [triggerWarnings, setTriggerWarnings] = useState<string[]>([]);
  const [customTriggerWarning, setCustomTriggerWarning] = useState<string>('');

  // Common trigger warnings
  const commonTriggerWarnings = [
    'Violence', 'Gore', 'Death', 'Suicide', 'Self-harm', 'Sexual content',
    'Child abuse', 'Animal cruelty', 'Drug use', 'Discrimination'
  ];

  // Form setup with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      themeCategory: '',
      triggerWarnings: [],
      isCommunityPost,
      isHidden: false,
      isSecret: false,
    },
  });

  // Fetch post data if editing
  const { isLoading: isLoadingPost } = useQuery({
    queryKey: [`/api/posts/${postId}`, postId],
    enabled: !!postId,
    queryFn: async () => {
      const post = await apiRequest(`/api/posts/${postId}`);
      if (post) {
        // Populate form with existing post data
        form.reset({
          title: post.title,
          content: post.content,
          summary: post.summary || '',
          themeCategory: post.metadata?.themeCategory || '',
          triggerWarnings: post.metadata?.triggerWarnings || [],
          isCommunityPost: post.metadata?.isCommunityPost || isCommunityPost,
          isHidden: post.metadata?.isHidden || false,
          isSecret: post.metadata?.isSecret || false,
        });
        
        // Set trigger warnings state
        setTriggerWarnings(post.metadata?.triggerWarnings || []);
      }
      return post;
    },
  });

  // Create/update post mutation
  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (data: PostFormValues) => {
      // Include all trigger warnings in the form data
      data.triggerWarnings = triggerWarnings;
      
      if (postId) {
        // Update existing post
        return apiRequest(`/api/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        // Create new post
        return apiRequest('/api/posts', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: (data) => {
      // Show success message
      toast({
        title: postId ? 'Post updated' : 'Post created',
        description: postId 
          ? 'Your post has been updated successfully.' 
          : isCommunityPost 
            ? 'Your story has been submitted for review.'
            : 'Your post has been created successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      // Navigate or close
      if (onClose) {
        onClose();
      } else {
        navigate(isCommunityPost ? '/community' : '/admin/posts');
      }
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

  // Add trigger warning
  const addTriggerWarning = (warning: string) => {
    if (warning && !triggerWarnings.includes(warning)) {
      setTriggerWarnings([...triggerWarnings, warning]);
    }
  };

  // Add custom trigger warning
  const addCustomTriggerWarning = () => {
    if (customTriggerWarning.trim() && !triggerWarnings.includes(customTriggerWarning.trim())) {
      setTriggerWarnings([...triggerWarnings, customTriggerWarning.trim()]);
      setCustomTriggerWarning('');
    }
  };

  // Remove trigger warning
  const removeTriggerWarning = (warning: string) => {
    setTriggerWarnings(triggerWarnings.filter(w => w !== warning));
  };

  if (isLoadingPost) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Write/Preview tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="write" className="flex-1">Write</TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Write tab */}
            <TabsContent value="write" className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter story title" 
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="min-h-[300px]">
                        <MDEditor
                          height={500}
                          value={field.value}
                          onChange={(value) => field.onChange(value || '')}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="A brief summary of your story (optional)" 
                        {...field}
                      />
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
                  <h1 className="text-2xl font-bold mb-6">{form.watch('title') || 'Untitled Story'}</h1>
                  <MDEditor.Markdown source={form.watch('content')} />
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Your preview will appear here. Start writing in the Write tab.
                </div>
              )}
            </TabsContent>
            
            {/* Settings tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme category */}
                <FormField
                  control={form.control}
                  name="themeCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Category</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
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
                
                {/* Settings checkboxes */}
                {!isCommunityPost && user?.isAdmin && (
                  <>
                    <FormField
                      control={form.control}
                      name="isSecret"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Secret Story</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Mark this as a hidden/secret story that requires unlocking
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isHidden"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Hidden</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Hide this post from the main feed
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              
              {/* Trigger warnings */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Trigger Warnings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {triggerWarnings.map(warning => (
                        <Button
                          key={warning}
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => removeTriggerWarning(warning)}
                          className="flex items-center"
                        >
                          {warning} <span className="ml-1">✕</span>
                        </Button>
                      ))}
                      {triggerWarnings.length === 0 && (
                        <p className="text-sm text-muted-foreground">No trigger warnings added.</p>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Common Trigger Warnings</h4>
                      <div className="flex flex-wrap gap-2">
                        {commonTriggerWarnings.map(warning => (
                          <Button
                            key={warning}
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => addTriggerWarning(warning)}
                            disabled={triggerWarnings.includes(warning)}
                          >
                            {warning}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                      <Input
                        placeholder="Add custom trigger warning"
                        value={customTriggerWarning}
                        onChange={e => setCustomTriggerWarning(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addCustomTriggerWarning}
                        disabled={!customTriggerWarning.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Submit buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : postId ? 'Update Story' : 'Submit Story'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}