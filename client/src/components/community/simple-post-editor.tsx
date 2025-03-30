import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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
import { THEME_CATEGORIES } from '@/lib/content-analysis';

// Simpler form schema for community posts
const postSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must be at most 100 characters' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters' }),
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
          themeCategory: data.themeCategory === 'NONE' ? null : data.themeCategory
        }
      };
      
      if (postId) {
        // Update existing post
        return apiRequest(`/api/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify(postData),
        });
      } else {
        // Create new post
        return apiRequest('/api/posts', {
          method: 'POST',
          body: JSON.stringify(postData),
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your horror story title" 
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
                    <FormLabel>Story Content</FormLabel>
                    <FormControl>
                      <div className="min-h-[300px]">
                        <MDEditor
                          height={400}
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
                  <h1 className="text-2xl font-bold mb-6">{form.watch('title') || 'Untitled Horror Story'}</h1>
                  <MDEditor.Markdown source={form.watch('content')} />
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