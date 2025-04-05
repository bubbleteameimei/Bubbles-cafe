import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, Check, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { THEME_CATEGORIES } from '@shared/theme-categories';

export default function ThemesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');

  interface Post {
    id: number;
    title: string;
    theme_category?: string;
    slug: string;
    createdAt: string;
  }

  // Fetch all posts with their theme data
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/posts/admin/themes'],
    queryFn: async () => {
      const response = await fetch('/api/posts/admin/themes', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
  });

  // Mutation for updating a post's theme
  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, theme }: { id: number; theme: string }) => {
      return apiRequest(`/api/posts/${id}/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme_category: theme }),
      });
    },
    onSuccess: () => {
      // Invalidate the posts query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/posts/admin/themes'] });
      toast({
        title: 'Theme updated',
        description: 'The post theme has been successfully updated.',
      });
      setEditingId(null);
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update the post theme. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handler for starting the edit process
  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setSelectedTheme(post.theme_category || 'HORROR');
  };

  // Handler for saving the theme change
  const handleSave = (id: number) => {
    if (selectedTheme) {
      updateThemeMutation.mutate({ id, theme: selectedTheme });
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts ? 
    (posts as Post[]).filter((post: Post) => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  return (
    <AdminLayout title="Theme Management">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Theme Management</CardTitle>
          <CardDescription>
            Manage theme categories for all posts. Each post can be assigned to one of the predefined horror theme categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="flex items-center p-4 text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>Failed to load posts. Please try again.</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Current Theme</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post: Post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          {editingId === post.id ? (
                            <Select
                              value={selectedTheme}
                              onValueChange={setSelectedTheme}
                              disabled={updateThemeMutation.isPending}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a theme" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(THEME_CATEGORIES).map(([key, { label }]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>
                              {post.theme_category
                                ? THEME_CATEGORIES[post.theme_category as keyof typeof THEME_CATEGORIES]?.label || post.theme_category
                                : 'None'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === post.id ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSave(post.id)}
                                disabled={updateThemeMutation.isPending}
                              >
                                {updateThemeMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                <span className="ml-1">Save</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                disabled={updateThemeMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(post)}
                              className="flex items-center"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}