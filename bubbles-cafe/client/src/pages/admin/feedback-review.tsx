"use client"

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, BarChart2, List } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FeedbackDetails, FeedbackItem } from '@/components/feedback/FeedbackDetails';
import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';
import { FeedbackCategoryFilter, FeedbackCategory, FeedbackStatus } from '@/components/feedback/FeedbackCategoryFilter';
import { toast } from 'sonner';

export default function FeedbackReviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<FeedbackCategory[]>(['all']);
  const [selectedStatuses, setSelectedStatuses] = useState<FeedbackStatus[]>(['all']);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [view, setView] = useState<'list' | 'analytics'>('list');
  
  // Fetch all feedback
  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      return response.json();
    }
  });

  const queryClient = useQueryClient();

  // Mutation to update feedback status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: FeedbackStatus }) => {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feedback status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      toast.success('Feedback status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Mutation to add internal notes
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number, note: string }) => {
      // In a real implementation, you would have an API endpoint for this
      // This is a mock implementation
      return { id, note };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
    onError: (error) => {
      toast.error('Failed to add note', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Handle status change
  const handleStatusChange = (id: number, status: FeedbackStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Handle adding note
  const handleAddNote = (id: number, note: string) => {
    addNoteMutation.mutate({ id, note });
  };

  // Derived state - filter and sort feedback items
  const filteredAndSortedFeedback = (() => {
    if (!feedbackData) return [];

    let filtered = [...feedbackData];

    // Apply category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      filtered = filtered.filter(item => selectedCategories.includes(item.type as FeedbackCategory));
    }

    // Apply status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
      filtered = filtered.filter(item => selectedStatuses.includes(item.status as FeedbackStatus));
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(query) || 
        (item.metadata.name && item.metadata.name.toLowerCase().includes(query)) ||
        (item.metadata.email && item.metadata.email.toLowerCase().includes(query)) ||
        item.page.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'highest-rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'lowest-rating':
        return filtered.sort((a, b) => a.rating - b.rating);
      default:
        return filtered;
    }
  })();

  // Sample data for development - this would normally come from the API
  const sampleFeedbackData: FeedbackItem[] = [
    {
      id: 1,
      content: "I found a bug in the comments section. When I try to edit my comment, it doesn't save properly.",
      type: "bug",
      rating: 2,
      page: "/stories/the-haunting",
      category: "User Interface",
      status: "pending",
      createdAt: "2025-03-14T10:30:00Z",
      metadata: {
        browser: "Chrome 121.0.6167.85",
        operatingSystem: "Windows 11",
        screenResolution: "1920x1080",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        name: "John Doe",
        email: "john.doe@example.com"
      }
    },
    {
      id: 2,
      content: "I absolutely love the new dark mode feature! It makes reading horror stories at night so much more immersive.",
      type: "praise",
      rating: 5,
      page: "/settings/display",
      category: "User Experience",
      status: "reviewed",
      createdAt: "2025-03-13T15:45:00Z",
      metadata: {
        browser: "Firefox 123.0",
        operatingSystem: "macOS 13.4",
        screenResolution: "2560x1600",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
        name: "Jane Smith",
        email: "jane.smith@example.com"
      }
    },
    {
      id: 3,
      content: "It would be great if you could add a feature to bookmark specific paragraphs in stories for later reference.",
      type: "suggestion",
      rating: 4,
      page: "/reader/the-shadow-in-the-corner",
      category: "Feature Request",
      status: "resolved",
      createdAt: "2025-03-12T09:15:00Z",
      metadata: {
        browser: "Safari 17.2",
        operatingSystem: "iOS 17.3",
        screenResolution: "1170x2532",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        name: "",
        email: "anonymous@example.com"
      },
      internalNotes: "This is already planned for the next release. Marking as resolved."
    },
    {
      id: 4,
      content: "The pop-up ads are too intrusive and disrupt my reading experience. Please reduce them.",
      type: "complaint",
      rating: 1,
      page: "/reader/whispers-in-the-dark",
      category: "Advertisements",
      status: "rejected",
      createdAt: "2025-03-11T22:05:00Z",
      metadata: {
        browser: "Edge 121.0.2277.83",
        operatingSystem: "Windows 10",
        screenResolution: "1366x768",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.2277.83",
        name: "Chris Johnson",
        email: "chris.johnson@example.com"
      },
      internalNotes: "User might be experiencing third-party ads. We don't show pop-ups. Need to follow up."
    },
    {
      id: 5,
      content: "I think the font size in the reader is too small. Please consider making it adjustable.",
      type: "suggestion",
      rating: 3,
      page: "/reader/the-empty-house",
      category: "Accessibility",
      status: "resolved",
      createdAt: "2025-03-10T14:20:00Z",
      metadata: {
        browser: "Chrome 121.0.6167.85",
        operatingSystem: "Android 14",
        screenResolution: "1080x2400",
        userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Mobile Safari/537.36",
        name: "Alex Wong",
        email: "alex.wong@example.com"
      }
    }
  ];

  // Use sample data for development, real data would come from API
  const displayedFeedback = isLoading || error ? [] : (feedbackData || sampleFeedbackData);
  const totalFeedbackCount = displayedFeedback.length;
  const filteredCount = filteredAndSortedFeedback.length;

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-4" asChild>
          <a href="/admin/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Review</h1>
          <p className="text-muted-foreground">
            Review and respond to user feedback
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <TabsList>
            <TabsTrigger value="all">All Feedback</TabsTrigger>
            <TabsTrigger value="bugs">Bugs</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="praise">Praise</TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button 
              variant={view === 'list' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button 
              variant={view === 'analytics' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setView('analytics')}
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest-rating">Highest Rating</SelectItem>
              <SelectItem value="lowest-rating">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FeedbackCategoryFilter
          selectedCategories={selectedCategories}
          selectedStatuses={selectedStatuses}
          setSelectedCategories={setSelectedCategories}
          setSelectedStatuses={setSelectedStatuses}
          totalCount={totalFeedbackCount}
          filteredCount={filteredCount}
        />

        <TabsContent value="all" className="space-y-4">
          {view === 'analytics' ? (
            <FeedbackAnalytics feedbackItems={displayedFeedback} />
          ) : (
            isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">Error loading feedback</p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/feedback'] })}
                >
                  Retry
                </Button>
              </div>
            ) : filteredAndSortedFeedback.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No feedback matching your filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategories(['all']);
                    setSelectedStatuses(['all']);
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredAndSortedFeedback.map((item) => (
                <FeedbackDetails 
                  key={item.id}
                  feedback={item}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                />
              ))
            )
          )}
        </TabsContent>

        <TabsContent value="bugs" className="space-y-4">
          {view === 'analytics' ? (
            <FeedbackAnalytics 
              feedbackItems={displayedFeedback.filter((item: FeedbackItem) => item.type === 'bug')} 
            />
          ) : (
            filteredAndSortedFeedback
              .filter((item: FeedbackItem) => item.type === 'bug')
              .map((item: FeedbackItem) => (
                <FeedbackDetails 
                  key={item.id}
                  feedback={item}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {view === 'analytics' ? (
            <FeedbackAnalytics 
              feedbackItems={displayedFeedback.filter((item: FeedbackItem) => item.type === 'suggestion')} 
            />
          ) : (
            filteredAndSortedFeedback
              .filter((item: FeedbackItem) => item.type === 'suggestion')
              .map((item: FeedbackItem) => (
                <FeedbackDetails 
                  key={item.id}
                  feedback={item}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="praise" className="space-y-4">
          {view === 'analytics' ? (
            <FeedbackAnalytics 
              feedbackItems={displayedFeedback.filter((item: FeedbackItem) => item.type === 'praise')} 
            />
          ) : (
            filteredAndSortedFeedback
              .filter((item: FeedbackItem) => item.type === 'praise')
              .map((item: FeedbackItem) => (
                <FeedbackDetails 
                  key={item.id}
                  feedback={item}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                />
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}