import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Post, User } from "@shared/schema";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommunityReaderCard, ExtendedUser, ExtendedPost as CommunityReaderPost } from "@/components/community/community-reader-card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { 
  AlertCircle, 
  Search, 
  Filter, 
  PenSquare,
  RefreshCcw,
  ArrowDown,
  ArrowUp, 
  MessageSquare,
  Calendar,
  EyeIcon,
  ListFilter
} from "lucide-react";

// Import community reader styles
import "@/styles/community-reader.css";

// Extended Post interface with UI-specific properties - use same type as community-reader-card.tsx
type ExtendedPost = CommunityReaderPost;

// Response shape from the API
interface PostsResponse {
  posts: ExtendedPost[];
  hasMore: boolean;
  page: number;
  totalPosts: number;
}

export default function CommunityPage() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // States for filtering and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"grid" | "list">("list");
  
  // Fetch posts with filters
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/posts/community', currentPage, category, sortBy, activeTab],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(view === "list" ? 6 : 12));
      
      if (category !== 'all') {
        params.append('category', category);
      }
      
      if (sortBy === 'newest') {
        params.append('sort', 'date');
        params.append('order', 'desc');
      } else if (sortBy === 'oldest') {
        params.append('sort', 'date');
        params.append('order', 'asc');
      } else if (sortBy === 'popular') {
        params.append('sort', 'likes');
        params.append('order', 'desc');
      } else if (sortBy === 'comments') {
        params.append('sort', 'comments');
        params.append('order', 'desc');
      }
      
      if (activeTab === 'featured') {
        params.append('featured', 'true');
      } else if (activeTab === 'my-stories' && user) {
        params.append('author', String(user.id));
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/posts/community?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch community posts');
      const result: PostsResponse = await response.json();
      return result;
    },
    staleTime: 60000 // 1 minute
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Filter posts that match search term
  const filteredPosts = data?.posts || [];
  
  // Pagination handling
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const totalPages = data ? Math.ceil(data.totalPosts / (view === "list" ? 6 : 12)) : 0;

  // Handle edit post
  const handleEditPost = (post: ExtendedPost) => {
    navigate(`/edit-story/${post.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Stories</h1>
          <p className="text-muted-foreground">
            Explore stories written by our community members or share your own.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/submit-story")} className="flex items-center gap-2">
            <PenSquare className="h-4 w-4" />
            Submit Your Story
          </Button>
        </div>
      </div>
      
      {/* Filter and Search Controls */}
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 overflow-x-auto flex w-full justify-start md:justify-center border-b pb-px">
            <TabsTrigger value="all">All Stories</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger value="my-stories">My Stories</TabsTrigger>
            )}
          </TabsList>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            
            <div className="flex gap-3">
              <div className="w-full md:w-[180px]">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="PSYCHOLOGICAL">Psychological</SelectItem>
                    <SelectItem value="SUPERNATURAL">Supernatural</SelectItem>
                    <SelectItem value="TECHNOLOGICAL">Technological</SelectItem>
                    <SelectItem value="BODY_HORROR">Body Horror</SelectItem>
                    <SelectItem value="GOTHIC">Gothic</SelectItem>
                    <SelectItem value="APOCALYPTIC">Apocalyptic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-[180px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      {sortBy === 'newest' && <Calendar className="h-4 w-4 mr-2" />}
                      {sortBy === 'oldest' && <Calendar className="h-4 w-4 mr-2" />}
                      {sortBy === 'popular' && <ArrowUp className="h-4 w-4 mr-2" />}
                      {sortBy === 'comments' && <MessageSquare className="h-4 w-4 mr-2" />}
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Newest
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Oldest
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="comments">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Most Comments
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={view === "list" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setView("list")}
                  className="flex-shrink-0" 
                  aria-label="List view"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
                <Button 
                  variant={view === "grid" ? "default" : "outline"}
                  size="icon" 
                  onClick={() => setView("grid")}
                  className="flex-shrink-0" 
                  aria-label="Grid view"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  className="flex-shrink-0" 
                  aria-label="Refresh"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              // Loading skeleton
              <div className={view === "list" ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {Array(view === "list" ? 3 : 6).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-8 w-[100px]" />
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              // Error state
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Failed to load community stories'}
                </AlertDescription>
              </Alert>
            ) : filteredPosts.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Stories Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? `No stories matching "${searchTerm}" were found.`
                    : activeTab === 'my-stories'
                      ? "You haven't published any stories yet."
                      : "No stories available for the selected filters."
                  }
                </p>
                {activeTab === 'my-stories' && (
                  <Button onClick={() => navigate("/submit-story")} variant="outline">
                    Write Your First Story
                  </Button>
                )}
              </div>
            ) : (
              // Posts with responsive view toggle
              <div className={view === "list" ? "space-y-6 community-container" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredPosts.map((post) => (
                  <CommunityReaderCard
                    key={post.id}
                    post={post}
                    isAuthenticated={isAuthenticated}
                    currentUser={user as ExtendedUser}
                    onEdit={handleEditPost}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Pagination controls */}
      {!isLoading && filteredPosts.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Guidelines Section */}
      <div className="mt-12 bg-muted/40 rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Community Guidelines</h2>
        <div className="space-y-4">
          <p>When submitting or interacting with stories, please keep the following in mind:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Be respectful of other authors and commenters</li>
            <li>Use appropriate trigger warnings for sensitive content</li>
            <li>Original content only - plagiarism is strictly prohibited</li>
            <li>No excessive gore, explicit content, or hate speech</li>
            <li>Stories that violate our community standards will be removed</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Continued violations may result in account restrictions. For more information, 
            please read our <a href="/support/guidelines" className="underline">full community guidelines</a>.
          </p>
        </div>
      </div>
    </div>
  );
}