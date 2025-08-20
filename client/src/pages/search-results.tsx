import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Loader2, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

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
  const performSearch = async (query: string, pageNum = 1) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { results, meta } = await apiJson<any>('GET', `/api/search?q=${encodeURIComponent(query)}&types=posts,pages,comments&limit=10&page=${pageNum}`);
      const mapped: SearchResult[] = (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: '',
        type: (r.type === 'post' || r.type === 'page') ? r.type : 'post',
        url: r.url,
        matches: (r.matches || []).map((m: any, idx: number) => ({ field: 'content', text: m.context || m.text || '', position: 0 }))
      }));
      setSearchResults(mapped);
      setPage(meta?.page || 1);
      setPages(meta?.pages || 1);
      setDidYouMean(meta?.didYouMean || null);
      
      // Show toast with result count
      toast({
        title: `Search Results for "${query}"`,
        description: meta?.total !== undefined ? `${meta.total} total results` : `Found ${mapped.length} ${mapped.length === 1 ? 'result' : 'results'}`,
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

  // Suggestions (typeahead)
  useEffect(() => {
    const q = searchQuery.trim();
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = q.length >= 2 ? `/api/search/suggest?q=${encodeURIComponent(q)}&limit=8` : `/api/search/suggest?limit=8`;
        const resp = await apiJson<any>('GET', url);
        setSuggestions(resp?.suggestions || []);
        setShowSuggest(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setShowSuggest(false);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [searchQuery]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, 1);
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ))}
      </>
    );
  };

  return (
    <ErrorBoundary>
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
              onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              onKeyDown={(e) => {
                if (!showSuggest || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === 'Enter') {
                  if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    window.location.href = suggestions[activeIndex].url;
                  } else if (searchQuery.trim()) {
                    performSearch(searchQuery, 1);
                  }
                }
              }}
            />
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-background border border-border rounded-md shadow-sm">
                <ul className="max-h-64 overflow-auto py-1">
                  {suggestions.map((s, idx) => (
                    <li key={s.id}>
                      <Link href={s.url}>
                        <a className={`block px-3 py-2 text-sm hover:bg-accent/30 ${idx === activeIndex ? 'bg-accent/20' : ''}`}>{s.title}</a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
      
      {/* Did you mean */}
      {didYouMean && (
        <div className="mb-4 text-sm">
          Did you mean: <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">{didYouMean}</Link>?
        </div>
      )}

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
                  {highlightText(result.title, searchQuery)}
                </Link>
              </h2>
              
              {/* Content matches */}
              <div className="space-y-2 mt-3">
                {result.matches
                  .filter(m => m.field === 'content')
                  .slice(0, 3) // Limit to 3 matches per result
                  .map((match, idx) => (
                    <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                      ...{highlightText(match.context || match.text, searchQuery)}...
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(searchQuery, page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(searchQuery, page + 1)}>Next</Button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}