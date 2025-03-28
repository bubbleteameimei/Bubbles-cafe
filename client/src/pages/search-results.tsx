import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  type: 'post' | 'page';
  url: string;
  matches: {
    field: string;
    text: string;
    position: number;
  }[];
}

export default function SearchResultsPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location]);

  // Perform search across all content
  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Fetch all posts
      const postsResponse = await fetch('/api/posts');
      const posts = await postsResponse.json();
      
      // Search through posts
      const results: SearchResult[] = [];
      
      posts.forEach((post: any) => {
        const matches = [];
        let isMatch = false;
        
        // Search in title
        if (post.title && post.title.toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            field: 'title',
            text: post.title,
            position: post.title.toLowerCase().indexOf(query.toLowerCase())
          });
          isMatch = true;
        }
        
        // Search in content
        if (post.content) {
          const contentLower = post.content.toLowerCase();
          const queryLower = query.toLowerCase();
          let position = contentLower.indexOf(queryLower);
          
          while (position !== -1) {
            // Extract a snippet around the match
            const start = Math.max(0, position - 40);
            const end = Math.min(post.content.length, position + query.length + 40);
            const snippet = post.content.substring(start, end);
            
            matches.push({
              field: 'content',
              text: snippet,
              position: position - start // Relative position in the snippet
            });
            
            isMatch = true;
            position = contentLower.indexOf(queryLower, position + 1);
          }
        }
        
        if (isMatch) {
          results.push({
            id: post.id,
            title: post.title || 'Untitled',
            excerpt: post.excerpt || '',
            content: post.content || '',
            type: 'post',
            url: `/reader/${post.id}`,
            matches
          });
        }
      });
      
      setSearchResults(results);
      
      // Show toast with result count
      toast({
        title: `Search Results for "${query}"`,
        description: `Found ${results.length} ${results.length === 1 ? 'result' : 'results'}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to complete your search. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string, position: number) => {
    if (!text || position === undefined) return text;
    
    const before = text.substring(0, position);
    const match = text.substring(position, position + query.length);
    const after = text.substring(position + query.length);
    
    return (
      <>
        {before}
        <span className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white font-medium px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              type="search"
              placeholder="Search for keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>
      
      {/* Search results */}
      {isSearching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-8">
          {searchResults.map(result => (
            <div key={`${result.type}-${result.id}`} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={result.url}>
                  {result.matches.some(m => m.field === 'title') ? (
                    highlightText(
                      result.title,
                      searchQuery,
                      result.matches.find(m => m.field === 'title')?.position || 0
                    )
                  ) : (
                    result.title
                  )}
                </Link>
              </h2>
              
              {/* Content matches */}
              <div className="space-y-2 mt-3">
                {result.matches
                  .filter(m => m.field === 'content')
                  .slice(0, 3) // Limit to 3 matches per result
                  .map((match, idx) => (
                    <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                      ...{highlightText(match.text, searchQuery, match.position)}...
                    </div>
                  ))}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={result.url} className="inline-flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    Read More
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No results found for "{searchQuery}"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : null}
    </div>
  );
}