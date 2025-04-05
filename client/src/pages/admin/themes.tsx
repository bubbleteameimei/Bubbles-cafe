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
import { 
  Pencil, Check, Loader2, AlertCircle, Skull, Brain, Ghost, Eye, Scissors, 
  Clock, Footprints, Utensils, Car, UserPlus, Bug, Cpu, Globe, AlertTriangle, 
  Scan, Castle, Copy, CloudRain, Hourglass, Axe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { THEME_CATEGORIES } from '@shared/theme-categories';

// Icon mapping for theme categories
const THEME_ICONS: Record<string, React.ReactNode> = {
  'skull': <Skull className="h-4 w-4" />,
  'brain': <Brain className="h-4 w-4" />,
  'ghost': <Ghost className="h-4 w-4" />,
  'eye': <Eye className="h-4 w-4" />,
  'scissors': <Scissors className="h-4 w-4" />,
  'hourglass': <Hourglass className="h-4 w-4" />,
  'footprints': <Footprints className="h-4 w-4" />,
  'utensils': <Utensils className="h-4 w-4" />,
  'axe': <Axe className="h-4 w-4" />,
  'car': <Car className="h-4 w-4" />,
  'user-plus': <UserPlus className="h-4 w-4" />,
  'bug': <Bug className="h-4 w-4" />,
  'cpu': <Cpu className="h-4 w-4" />,
  'globe': <Globe className="h-4 w-4" />,
  'doll': <AlertTriangle className="h-4 w-4" />,
  'scan': <Scan className="h-4 w-4" />,
  'castle': <Castle className="h-4 w-4" />,
  'copy': <Copy className="h-4 w-4" />,
  'clock': <Clock className="h-4 w-4" />,
  'cloud-rain': <CloudRain className="h-4 w-4" />
};

// Available icon options for selection
const ICON_OPTIONS = [
  { value: 'skull', label: 'Skull' },
  { value: 'brain', label: 'Brain' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'eye', label: 'Eye' },
  { value: 'scissors', label: 'Scissors' },
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'footprints', label: 'Footprints' },
  { value: 'utensils', label: 'Utensils' },
  { value: 'axe', label: 'Axe' },
  { value: 'car', label: 'Car' },
  { value: 'user-plus', label: 'Doppelgänger' },
  { value: 'bug', label: 'Bug' },
  { value: 'cpu', label: 'CPU' },
  { value: 'globe', label: 'Globe' },
  { value: 'doll', label: 'Doll' },
  { value: 'scan', label: 'Scan' },
  { value: 'castle', label: 'Castle' },
  { value: 'copy', label: 'Copy' },
  { value: 'clock', label: 'Clock' },
  { value: 'cloud-rain', label: 'Rain' }
];

export default function ThemesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

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
        body: JSON.stringify({ theme_category: theme, icon: selectedIcon }),
      });
    },
    onSuccess: () => {
      // Invalidate multiple queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['/api/posts/admin/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ["wordpress", "posts"] });
      
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
    const currentTheme = post.theme_category || 'HORROR';
    setSelectedTheme(currentTheme);
    
    // Set the default icon based on the theme
    const themeInfo = THEME_CATEGORIES[currentTheme as keyof typeof THEME_CATEGORIES];
    setSelectedIcon(themeInfo?.icon || 'eye');
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
            Manage theme categories for all posts. Each post can be assigned to one of the predefined horror theme categories with a corresponding icon.
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
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Current Theme</TableHead>
                    <TableHead className="hidden md:table-cell">Icon</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post: Post) => {
                      const themeKey = post.theme_category as keyof typeof THEME_CATEGORIES;
                      const themeInfo = themeKey ? THEME_CATEGORIES[themeKey] : null;
                      const themeIcon = themeInfo?.icon || 'eye';
                      
                      return (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{post.title}</span>
                              {/* Mobile-only theme display */}
                              <span className="md:hidden text-xs text-muted-foreground mt-1 flex items-center">
                                {THEME_ICONS[themeIcon.toLowerCase()] || <Eye className="h-3 w-3" />}
                                <span className="ml-1">
                                  {themeInfo?.label || 'Horror'}
                                </span>
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            {editingId === post.id ? (
                              <Select
                                value={selectedTheme}
                                onValueChange={(value) => {
                                  setSelectedTheme(value);
                                  // Update icon when theme changes
                                  const newThemeInfo = THEME_CATEGORIES[value as keyof typeof THEME_CATEGORIES];
                                  setSelectedIcon(newThemeInfo?.icon || 'eye');
                                }}
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
                                {themeInfo?.label || 'None'}
                              </span>
                            )}
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            {editingId === post.id ? (
                              <Select
                                value={selectedIcon}
                                onValueChange={setSelectedIcon}
                                disabled={updateThemeMutation.isPending}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Select an icon">
                                    <div className="flex items-center">
                                      {THEME_ICONS[selectedIcon.toLowerCase()] || <Eye className="h-4 w-4" />}
                                      <span className="ml-2">
                                        {ICON_OPTIONS.find(icon => icon.value === selectedIcon.toLowerCase())?.label || 'Icon'}
                                      </span>
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {ICON_OPTIONS.map((icon) => (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      <div className="flex items-center">
                                        {THEME_ICONS[icon.value]}
                                        <span className="ml-2">{icon.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center">
                                {THEME_ICONS[themeIcon.toLowerCase()] || <Eye className="h-4 w-4" />}
                                <span className="ml-2">
                                  {ICON_OPTIONS.find(icon => icon.value === themeIcon.toLowerCase())?.label || themeIcon}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {editingId === post.id ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Mobile-only theme and icon selection */}
                                <div className="md:hidden space-y-2 mb-2">
                                  <Select
                                    value={selectedTheme}
                                    onValueChange={(value) => {
                                      setSelectedTheme(value);
                                      const newThemeInfo = THEME_CATEGORIES[value as keyof typeof THEME_CATEGORIES];
                                      setSelectedIcon(newThemeInfo?.icon || 'eye');
                                    }}
                                    disabled={updateThemeMutation.isPending}
                                  >
                                    <SelectTrigger className="w-full">
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
                                  
                                  <Select
                                    value={selectedIcon}
                                    onValueChange={setSelectedIcon}
                                    disabled={updateThemeMutation.isPending}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select an icon">
                                        <div className="flex items-center">
                                          {THEME_ICONS[selectedIcon.toLowerCase()] || <Eye className="h-4 w-4" />}
                                          <span className="ml-2">
                                            {ICON_OPTIONS.find(icon => icon.value === selectedIcon.toLowerCase())?.label || 'Icon'}
                                          </span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ICON_OPTIONS.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                          <div className="flex items-center">
                                            {THEME_ICONS[icon.value]}
                                            <span className="ml-2">{icon.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSave(post.id)}
                                  disabled={updateThemeMutation.isPending}
                                  className="w-full sm:w-auto"
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
                                  className="w-full sm:w-auto"
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
                      );
                    })
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