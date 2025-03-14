import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ArrowRight, ChevronRight, Clock, Calendar, BookOpen, Search, Filter, Book } from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { FloatingPagination } from "@/components/ui/floating-pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getReadingTime, getExcerpt, THEME_CATEGORIES } from "@/lib/content-analysis";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";

interface WordPressResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
}

export default function IndexView() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [theme, setTheme] = useState("all");
  const POSTS_PER_PAGE = 10; // Number of posts to display per page

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery<WordPressResponse>({
    queryKey: ["wordpress", "posts", sortOrder, theme],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      console.log('[Index] Fetching posts page:', page);
      const wpPosts = await fetchWordPressPosts(page);
      console.log('[Index] Received posts:', wpPosts.length);
      const posts = wpPosts.map(post => convertWordPressPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length > 0,
        page
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Load more data if needed
    const pagesNeeded = Math.ceil(page * POSTS_PER_PAGE / (data?.pages.length || 1) / POSTS_PER_PAGE);
    if (pagesNeeded > (data?.pages.length || 0) && hasNextPage) {
      fetchNextPage();
    }
  };

  const navigateToReader = (index: number) => {
    console.log('[Index] Navigating to reader:', {
      index,
      totalPosts: data?.pages.reduce((acc, page) => acc + page.posts.length, 0)
    });

    try {
      // Clear any existing index first
      sessionStorage.removeItem('selectedStoryIndex');
      // Set the new index
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      console.log('[Index] Story index set successfully');
      setLocation('/reader');
    } catch (error) {
      console.error('[Index] Error setting story index:', error);
      // Attempt recovery by clearing storage and using a default
      try {
        sessionStorage.clear();
        sessionStorage.setItem('selectedStoryIndex', '0');
        setLocation('/reader');
      } catch (retryError) {
        console.error('[Index] Recovery attempt failed:', retryError);
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Filter posts by search term (client-side for now)
  const filterPosts = (posts: Post[]) => {
    if (!searchTerm) return posts;
    
    const term = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(term) || 
      post.content.toLowerCase().includes(term)
    );
  };

  // Filter posts by category
  const filterByTheme = (posts: Post[]) => {
    if (theme === "all") return posts;
    
    return posts.filter(post => {
      const metadata = post.metadata || {};
      return metadata.themeCategory === theme;
    });
  };

  if (isLoading) {
    // Use the primary loading screen component
    return <LoadingScreen />;
  }

  if (error || !data?.pages[0]?.posts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Please try again later"}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const allPosts = data.pages.flatMap(page => page.posts);
  
  // Apply filters and sorting
  let filteredPosts = filterPosts(allPosts);
  filteredPosts = filterByTheme(filteredPosts);
  
  // Sort posts
  if (sortOrder === "newest") {
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortOrder === "oldest") {
    filteredPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  
  // Get current page of posts
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container pb-20">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-decorative mb-2">Latest Stories</h1>
            <p className="text-muted-foreground">Explore our collection of haunting tales</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="hover:bg-primary/20 transition-colors"
            >
              Back to Home
            </Button>
            <Button
              variant="default"
              onClick={() => setLocation('/submit-story')}
              className="hidden sm:flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Submit Your Story
            </Button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          className="mb-8 border rounded-lg p-4 bg-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </form>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-[180px]">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Theme" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {Object.entries(THEME_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-[180px]">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => refetch()}
                title="Refresh stories"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Story Count */}
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{currentPosts.length}</span> of <span className="font-medium text-foreground">{filteredPosts.length}</span> stories
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Book className="h-3 w-3" />
            {filteredPosts.length} Stories
          </Badge>
        </motion.div>

        {/* Stories Grid */}
        {currentPosts.length === 0 ? (
          <motion.div
            className="text-center py-12 border rounded-lg bg-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Stories Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? `No stories matching "${searchTerm}" were found.`
                : theme !== "all"
                  ? `No stories in the selected theme were found.`
                  : "No stories available at the moment."
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setTheme("all");
              setSortOrder("newest");
              refetch();
            }}>
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentPosts.map((post, index) => {
              const readingTime = getReadingTime(post.content);
              const excerpt = getExcerpt(post.content);
              const globalIndex = startIndex + index; // Calculate the global index for navigation
              const metadata = post.metadata || {};
              const themeCategory = metadata.themeCategory as string || "";
              
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300 overflow-hidden">
                    {themeCategory && THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] && (
                      <div className="h-1 bg-primary w-full"></div>
                    )}
                    <CardHeader className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle
                            className="text-xl group-hover:text-primary transition-colors cursor-pointer"
                            onClick={() => navigateToReader(globalIndex)}
                          >
                            {post.title}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                            <div className="flex items-center gap-1 justify-end">
                              <Calendar className="h-3 w-3" />
                              <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{readingTime}</span>
                            </div>
                          </div>
                        </div>
                        
                        {themeCategory && THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] && (
                          <Badge 
                            variant="outline" 
                            className="w-fit text-xs text-muted-foreground"
                          >
                            {themeCategory.charAt(0) + themeCategory.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {excerpt}
                      </p>
                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 mt-auto border-t">
                      <div className="w-full flex items-center justify-between">
                        <LikeDislike postId={post.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToReader(globalIndex)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          Read More <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {/* Standard Pagination for Larger Screens */}
        <div className="mt-8 hidden lg:flex justify-center">
          {totalPages > 1 && (
            <motion.div 
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[40px] ${
                    page === currentPage 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10 transition-colors"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Load More Button - Alternative to pagination */}
        {hasNextPage && allPosts.length < 50 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full max-w-xs"
            >
              {isFetchingNextPage ? 'Loading more stories...' : 'Load More Stories'}
            </Button>
          </div>
        )}
        
        {/* Floating Pagination Component - visible on all screens */}
        {totalPages > 1 && (
          <FloatingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="default"
          />
        )}
      </div>
    </div>
  );
}