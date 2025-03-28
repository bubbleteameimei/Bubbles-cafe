import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Type for search results
interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  type: 'post' | 'page' | 'comment';
  url: string;
  matches: { text: string; context: string }[];
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
  const { toast } = useToast();
  
  // Extract query parameter from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const q = queryParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, []);
  
  // Fetch search results
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { results: [] };
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
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
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Search Results</h1>
      </div>
      
      {/* Search input */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for keywords..."
          className="w-full rounded-md bg-accent/20 text-foreground placeholder:text-foreground/50 
                   focus:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-primary/50
                   px-4 py-3 pl-12 text-lg"
          onKeyDown={(e) => e.key === 'Enter' && setLocation(`/search?q=${encodeURIComponent(searchQuery)}`)}
        />
        <Button 
          variant="default" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9"
          onClick={() => setLocation(`/search?q=${encodeURIComponent(searchQuery)}`)}
        >
          Search
        </Button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          <span className="ml-3 text-lg">Searching...</span>
        </div>
      )}
      
      {/* Results display */}
      {!isLoading && searchResults && (
        <>
          <div className="mb-4 text-foreground/70">
            {searchResults.results?.length === 0 ? (
              <p>No results found for "{searchQuery}"</p>
            ) : (
              <p>Found {searchResults.results?.length} results for "{searchQuery}"</p>
            )}
          </div>
          
          <div className="grid gap-6">
            {searchResults.results?.map((result: SearchResult) => (
              <Card key={`${result.type}-${result.id}`} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">
                    <HighlightedText text={result.title} query={searchQuery} />
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {result.matches.map((match, index) => (
                    <div key={index} className="mb-3 last:mb-0 text-foreground/80">
                      <p className="italic text-sm mb-1">Context {index + 1}:</p>
                      <p>...{<HighlightedText text={match.context} query={searchQuery} />}...</p>
                    </div>
                  ))}
                </CardContent>
                
                <CardFooter className="pt-3 border-t">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setLocation(result.url)}
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
          <div className="text-center py-4">
            <p className="text-orange-500 mb-4">Using fallback search mechanism</p>
          </div>
          
          {fallbackResults.results.length > 0 ? (
            <>
              <div className="mb-4 text-foreground/70">
                <p>Found {fallbackResults.results.length} results for "{searchQuery}"</p>
              </div>
              
              <div className="grid gap-6">
                {fallbackResults.results.map((result: SearchResult) => (
                  <Card key={`${result.type}-${result.id}`} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">
                        <HighlightedText text={result.title} query={searchQuery} />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {result.matches.map((match, index) => (
                        <div key={index} className="mb-3 last:mb-0 text-foreground/80">
                          <p className="italic text-sm mb-1">Context {index + 1}:</p>
                          <p>...{<HighlightedText text={match.context} query={searchQuery} />}...</p>
                        </div>
                      ))}
                    </CardContent>
                    
                    <CardFooter className="pt-3 border-t">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => setLocation(result.url)}
                      >
                        View {result.type === 'post' ? 'Story' : result.type}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">No results found in fallback search</p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}