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
      // Handle metadata type safely
      return typeof metadata === 'object' && 
             metadata !== null && 
             'themeCategory' in metadata && 
             metadata.themeCategory === theme;
    });
  };

  if (isLoading) {
    // Return simple loading indicator instead of LoadingScreen
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Loading stories...</h2>
        </div>
      </div>
    );
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
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pt-4 border-b pb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-decorative mb-2 text-primary">Latest Stories</h1>
            <p className="text-muted-foreground italic">Explore our collection of haunting tales that will keep you up at night</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="hover:bg-primary/20 transition-colors shadow-sm"
            >
              Back to Home
            </Button>
            <Button
              variant="default"
              onClick={() => setLocation('/submit-story')}
              className="hidden sm:flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Submit Your Story
            </Button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          className="mb-8 border rounded-lg p-5 bg-card/80 shadow-sm"
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
                  placeholder="Search stories by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 shadow-sm focus:shadow focus:border-primary/40 transition-all"
                />
              </form>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-[180px]">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="shadow-sm hover:border-primary/30 transition-all">
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
                  <SelectTrigger className="shadow-sm hover:border-primary/30 transition-all">
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
                className="shadow-sm hover:shadow hover:bg-primary/5 transition-all"
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
            className="text-center py-12 border-2 border-dashed rounded-lg bg-card/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <Book className="h-16 w-16 mx-auto text-primary/40 mb-4 mt-4" />
              <h3 className="text-xl font-decorative mb-3">No Stories Found</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {searchTerm 
                  ? `We couldn't find any stories matching "${searchTerm}". Try different keywords or check your spelling.`
                  : theme !== "all"
                    ? `There are no stories in the ${theme.toLowerCase().replace(/_/g, ' ')} theme at the moment. Try selecting a different theme.`
                    : "No stories are available at the moment. Check back soon or try refreshing the page."
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setTheme("all");
                    setSortOrder("newest");
                    refetch();
                  }}
                  className="shadow-sm flex items-center gap-1"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Reset Filters
                </Button>
                <Button 
                  variant="default"
                  onClick={() => refetch()}
                  className="shadow-sm"
                >
                  Refresh
                </Button>
              </div>
            </div>
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
              // Handle the type safely
              const themeCategory = typeof metadata === 'object' && metadata !== null && 'themeCategory' in metadata
                ? String(metadata.themeCategory || "") 
                : "";
              
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300 overflow-hidden border-[1.5px] hover:border-primary/30">
                    {themeCategory && THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] && (
                      <div className="h-1.5 bg-primary w-full"></div>
                    )}
                    <CardHeader className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle
                            className="text-xl group-hover:text-primary transition-colors cursor-pointer font-decorative"
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
                            className="w-fit text-xs text-muted-foreground hover:bg-primary/5"
                          >
                            {themeCategory.charAt(0) + themeCategory.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {excerpt}
                      </p>
                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300 font-medium">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 mt-auto border-t">
                      <div className="w-full flex items-center justify-between">
                        <LikeDislike postId={post.id} />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateToReader(globalIndex)}
                          className="shadow-sm hover:shadow transition-all text-xs text-primary hover:text-primary/80 flex items-center gap-1"
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
          <motion.div 
            className="flex justify-center mt-10 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full max-w-sm border-dashed shadow-sm hover:shadow relative group overflow-hidden"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                  <span>Loading more stories...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Load More Stories</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
              <span className="absolute bottom-0 left-0 h-[2px] bg-primary w-0 group-hover:w-full transition-all duration-500"></span>
            </Button>
          </motion.div>
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