import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, Search, ArrowLeft, Filter, File, MessageSquare, 
  User, Flag, BookOpen, X, CheckCircle2, Settings, Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Type for search results
interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  type: 'post' | 'page' | 'comment' | 'user' | 'report' | 'legal' | 'settings';
  url: string;
  matches: { text: string; context: string }[];
  adminOnly?: boolean;
  createdAt?: string | Date;
}

// Helper function to highlight match in text
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
};

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['posts', 'comments', 'pages', 'legal', 'settings']);
  const [resultLimit, setResultLimit] = useState<number>(20);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const { toast } = useToast();

  // Type icon mapping for visual cues
  const typeIcons = {
    'posts': <BookOpen className="h-4 w-4" />,
    'pages': <File className="h-4 w-4" />,
    'comments': <MessageSquare className="h-4 w-4" />,
    'users': <User className="h-4 w-4" />,
    'reported': <Flag className="h-4 w-4" />,
    'legal': <Scale className="h-4 w-4" />,
    'settings': <Settings className="h-4 w-4" />
  };
  
  // Extract query parameter from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const q = queryParams.get("q");
    const types = queryParams.get("types");
    const limit = queryParams.get("limit");
    const admin = queryParams.get("admin");
    
    if (q) {
      setSearchQuery(q);
    }
    
    if (types) {
      setSelectedTypes(types.split(','));
    }
    
    if (limit && !isNaN(parseInt(limit))) {
      setResultLimit(Math.min(Math.max(parseInt(limit), 5), 50));
    }
    
    if (admin === 'true') {
      setIsAdminMode(true);
    }
  }, []);
  
  // Build search URL with filters
  const getSearchUrl = (query: string) => {
    if (!query.trim()) return '';
    
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
      params.set('types', selectedTypes.join(','));
    }
    
    if (resultLimit !== 20) {
      params.set('limit', resultLimit.toString());
    }
    
    if (isAdminMode) {
      params.set('admin', 'true');
    }
    
    return `/search?${params.toString()}`;
  };
  
  // Handle search form submission
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLocation(getSearchUrl(searchQuery));
  };
  
  // Toggle content type filter
  const toggleContentType = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Fetch search results with filters
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ["search", searchQuery, selectedTypes, resultLimit, isAdminMode],
    queryFn: async () => {
      if (!searchQuery.trim()) return { results: [] };
      
      // Build query URL with all filters
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      
      if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        params.set('types', selectedTypes.join(','));
      }
      
      if (resultLimit !== 20) {
        params.set('limit', resultLimit.toString());
      }
      
      if (isAdminMode) {
        params.set('admin', 'true');
      }
      
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      
      return response.json();
    },
    enabled: !!searchQuery,
  });
  
  // Use fallback search implementation if API search fails
  const fallbackSearch = async () => {
    try {
      // Fetch posts to search through
      const postsResponse = await fetch('/api/posts');
      if (!postsResponse.ok) throw new Error('Failed to fetch posts');
      
      const posts = await postsResponse.json();
      const query = searchQuery.toLowerCase();
      
      // Search through posts
      const results: SearchResult[] = [];
      
      posts.forEach((post: any) => {
        const title = post.title || '';
        const content = post.content || '';
        
        // Check if query exists in title or content
        if (title.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
          // Create excerpt with context around match
          let excerpt = '';
          let matches: { text: string; context: string }[] = [];
          
          // Extract content without HTML
          const plainContent = content.replace(/<[^>]+>/g, '');
          
          // Find all occurrences of the search term
          const regex = new RegExp(`[^.!?]*(?<=[.!?\\s]|^)${query}(?=[\\s.!?]|$)[^.!?]*[.!?]`, 'gi');
          const matchResults = plainContent.match(regex);
          
          if (matchResults && matchResults.length > 0) {
            // Take first 3 matches as context
            const contextMatches = matchResults.slice(0, 3);
            excerpt = contextMatches.join(' ... ');
            
            // Store each match with context
            matches = contextMatches.map((context: string) => ({
              text: query,
              context: context.trim()
            }));
          } else {
            // If no clear sentence matches, just take some context
            const index = plainContent.toLowerCase().indexOf(query);
            if (index !== -1) {
              const start = Math.max(0, index - 60);
              const end = Math.min(plainContent.length, index + query.length + 60);
              excerpt = plainContent.substring(start, end);
              
              matches = [{
                text: query,
                context: excerpt
              }];
            } else {
              // Fallback to first 150 chars
              excerpt = plainContent.substring(0, 150) + '...';
            }
          }
          
          results.push({
            id: post.id,
            title: post.title,
            excerpt,
            type: 'post',
            url: `/reader/${post.id}`,
            matches
          });
        }
      });
      
      return { results };
      
    } catch (error) {
      console.error("Fallback search error:", error);
      return { results: [] };
    }
  };
  
  // State for fallback search results
  const [fallbackResults, setFallbackResults] = useState<{ results: SearchResult[] }>({ results: [] });
  
  // Use fallback search if API fails
  useEffect(() => {
    if (isError && searchQuery) {
      console.log("Using fallback search mechanism");
      fallbackSearch().then(results => {
        setFallbackResults(results);
      });
    }
  }, [isError, searchQuery]);
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex items-center mb-10 border-b pb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation('/')}
          className="mr-4 h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Search Results</h1>
      </div>
      
      {/* Enhanced Search input with filters */}
      <div className="relative mb-6 max-w-3xl mx-auto">
        <div className="relative w-full shadow-md rounded-lg bg-accent/10 hover:bg-accent/15 transition-colors duration-200 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50 group-focus-within:text-primary transition-colors duration-200" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for keywords..."
            className="w-full rounded-lg bg-transparent text-foreground placeholder:text-foreground/50 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-none
                     px-4 py-3.5 pl-12 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 h-10 border-primary/20 bg-primary/5 hover:bg-primary/10"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Content Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className={`flex items-center gap-2 cursor-pointer ${selectedTypes.includes('posts') ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleContentType('posts')}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Stories</span>
                    </div>
                    {selectedTypes.includes('posts') && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`flex items-center gap-2 cursor-pointer ${selectedTypes.includes('comments') ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleContentType('comments')}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comments</span>
                    </div>
                    {selectedTypes.includes('comments') && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`flex items-center gap-2 cursor-pointer ${selectedTypes.includes('pages') ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleContentType('pages')}
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span>Pages</span>
                    </div>
                    {selectedTypes.includes('pages') && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`flex items-center gap-2 cursor-pointer ${selectedTypes.includes('legal') ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleContentType('legal')}
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      <span>Legal</span>
                    </div>
                    {selectedTypes.includes('legal') && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`flex items-center gap-2 cursor-pointer ${selectedTypes.includes('settings') ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleContentType('settings')}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                    {selectedTypes.includes('settings') && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Results</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setResultLimit(10)}>
                    <div className="flex items-center gap-2">
                      <span>10 results</span>
                      {resultLimit === 10 && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResultLimit(20)}>
                    <div className="flex items-center gap-2">
                      <span>20 results</span>
                      {resultLimit === 20 && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResultLimit(50)}>
                    <div className="flex items-center gap-2">
                      <span>50 results</span>
                      {resultLimit === 50 && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={isAdminMode ? 'bg-primary/10' : ''}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Admin mode</span>
                    {isAdminMode && (
                      <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="default" 
              className="h-10 shadow-sm"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
        
        {/* Active filters display */}
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTypes.map(type => (
            <Badge 
              key={type} 
              variant="outline"
              className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            >
              {typeIcons[type as keyof typeof typeIcons]}
              <span className="ml-1">{type}</span>
              <X 
                className="h-3 w-3 ml-1 hover:text-destructive" 
                onClick={() => toggleContentType(type)}
              />
            </Badge>
          ))}
          
          {resultLimit !== 20 && (
            <Badge 
              variant="outline"
              className="bg-accent/10"
            >
              Limit: {resultLimit}
              <X 
                className="h-3 w-3 ml-1 hover:text-destructive" 
                onClick={() => setResultLimit(20)}
              />
            </Badge>
          )}
          
          {isAdminMode && (
            <Badge 
              variant="outline"
              className="bg-red-500/10 text-red-600 dark:text-red-400"
            >
              Admin Mode
              <X 
                className="h-3 w-3 ml-1 hover:text-destructive" 
                onClick={() => setIsAdminMode(false)}
              />
            </Badge>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-primary/40 rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-primary/80" />
          </div>
          <span className="text-lg font-medium">Searching through stories...</span>
        </div>
      )}
      
      {/* Results display */}
      {!isLoading && searchResults && (
        <>
          <div className="mb-6 text-foreground/80 rounded-md bg-background/50 p-3 border border-border/20 shadow-sm max-w-3xl mx-auto">
            {searchResults.results?.length === 0 ? (
              <p className="text-center">No results found for "<span className="font-semibold text-primary/90">{searchQuery}</span>"</p>
            ) : (
              <p className="text-center">Found <span className="font-semibold text-primary/90">{searchResults.results?.length}</span> results for "<span className="italic">{searchQuery}</span>"</p>
            )}
          </div>
          
          <div className="grid gap-6">
            {searchResults.results?.map((result: SearchResult) => (
              <Card key={`${result.type}-${result.id}`} className="overflow-hidden border-border/30 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3 border-b border-border/10">
                  <div className="flex items-center mb-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary mr-2 uppercase tracking-wide">
                      {result.type}
                    </span>
                    <span className="text-sm text-foreground/60">ID: {result.id}</span>
                  </div>
                  <CardTitle className="text-xl font-serif">
                    <HighlightedText text={result.title} query={searchQuery} />
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="py-4">
                  {result.matches.map((match, index) => (
                    <div key={index} className="mb-4 last:mb-0 text-foreground/80 bg-accent/5 p-3 rounded-md border-l-2 border-primary/30">
                      <p className="italic text-sm mb-1 text-foreground/60">Match {index + 1}:</p>
                      <p className="text-foreground/90">...{<HighlightedText text={match.context} query={searchQuery} />}...</p>
                    </div>
                  ))}
                </CardContent>
                
                <CardFooter className="pt-3 border-t flex justify-between items-center bg-muted/10">
                  <div className="text-sm text-foreground/60">
                    <span className="text-sm text-muted-foreground">
                      {result.type === 'post' ? 'Story' : 
                       result.type === 'comment' ? 'Comment' : 
                       result.type === 'page' ? 'Page' : 
                       result.type === 'legal' ? 'Legal' : 
                       result.type === 'settings' ? 'Settings' : 
                       result.type}
                    </span>
                  </div>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setLocation(result.url)}
                    className="font-medium hover:bg-primary/20 transition-colors"
                  >
                    View {result.type === 'post' ? 'Story' : result.type}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Error state with fallback results */}
      {isError && (
        <div>
          <div className="text-center py-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md p-3 max-w-3xl mx-auto">
            <p className="text-amber-700 dark:text-amber-400 mb-0">Using fallback search mechanism</p>
          </div>
          
          {fallbackResults.results.length > 0 ? (
            <>
              <div className="mb-6 text-foreground/80 rounded-md bg-background/50 p-3 border border-border/20 shadow-sm max-w-3xl mx-auto">
                <p className="text-center">Found <span className="font-semibold text-primary/90">{fallbackResults.results.length}</span> results for "<span className="italic">{searchQuery}</span>"</p>
              </div>
              
              <div className="grid gap-6">
                {fallbackResults.results.map((result: SearchResult) => (
                  <Card key={`${result.type}-${result.id}`} className="overflow-hidden border-border/30 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3 border-b border-border/10">
                      <div className="flex items-center mb-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary mr-2 uppercase tracking-wide">
                          {result.type}
                        </span>
                        <span className="text-sm text-foreground/60">ID: {result.id}</span>
                      </div>
                      <CardTitle className="text-xl font-serif">
                        <HighlightedText text={result.title} query={searchQuery} />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="py-4">
                      {result.matches.map((match, index) => (
                        <div key={index} className="mb-4 last:mb-0 text-foreground/80 bg-accent/5 p-3 rounded-md border-l-2 border-primary/30">
                          <p className="italic text-sm mb-1 text-foreground/60">Match {index + 1}:</p>
                          <p className="text-foreground/90">...{<HighlightedText text={match.context} query={searchQuery} />}...</p>
                        </div>
                      ))}
                    </CardContent>
                    
                    <CardFooter className="pt-3 border-t flex justify-between items-center bg-muted/10">
                      <div className="text-sm text-foreground/60">
                        <span className="text-sm text-muted-foreground">
                          {result.type === 'post' ? 'Story' : 
                           result.type === 'comment' ? 'Comment' : 
                           result.type === 'page' ? 'Page' : 
                           result.type === 'legal' ? 'Legal' : 
                           result.type === 'settings' ? 'Settings' : 
                           result.type}
                        </span>
                      </div>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => setLocation(result.url)}
                        className="font-medium hover:bg-primary/20 transition-colors"
                      >
                        View {result.type === 'post' ? 'Story' : result.type}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 shadow-sm border border-red-200 dark:border-red-800/40">
                <p className="text-red-600 dark:text-red-400 mb-4 font-medium">No results found in fallback search</p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}