import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showIcon?: boolean;
  animate?: boolean;
  onSearchChange?: (query: string) => void;

}

export const SearchBar = ({
  className = "",
  placeholder = "Search stories...",
  showIcon = true,
  animate = true,
  onSearchChange
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const handleSearch = async () => {
    if (query.trim()) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&types=posts`);
        const data = await response.json();
        
        if (response.ok) {
          setSearchResults(data.results || []);
          setShowResults(true);
          if (onSearchChange) {
            onSearchChange(query);
          }
        } else {
          
        }
      } catch (error) {
        
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setQuery("");
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Click outside handler with improved focus management
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if we're clicking on an input element anywhere (not just in our component)
      const isClickOnInput = (event.target as HTMLElement).tagName === 'INPUT' ||
                            (event.target as HTMLElement).tagName === 'TEXTAREA';
      
      // Only hide results and blur when not clicking on another input
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !isClickOnInput
      ) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add proper search results display
  const renderSearchResults = () => {
    if (!showResults || searchResults.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div 
            key={index}
            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
            onClick={() => {
              navigate(`/reader/${result.slug || result.id}`);
              setShowResults(false);
            }}
          >
            <h4 className="font-medium text-sm">{result.title}</h4>
            {result.excerpt && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {result.excerpt}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Real-time search as user types
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }

    if (query.trim().length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [query, onSearchChange]);

  return (
    <div 
      ref={searchContainerRef}
      className={`relative w-full max-w-md ${className}`}
    >
      <motion.div
        initial={animate ? { opacity: 0, y: -10 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.3 }}
        className={`relative flex items-center w-full`}
      >
        <div className="relative w-full flex items-center">
          {showIcon && (
            <Search 
              className={`absolute left-3 w-5 h-5 ${
                isFocused ? "text-accent" : "text-muted-foreground"
              } transition-colors duration-200`} 
            />
          )}
          <motion.input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-2 bg-background input-solid-bg border ${
              isFocused ? "border-accent" : "border-border"
            } rounded-full text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all`}
            initial={false}
            animate={
              isFocused
                ? { boxShadow: "0 0 0 2px rgba(90, 24, 154, 0.2)" }
                : { boxShadow: "none" }
            }
          />
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Search Results */}
      {renderSearchResults()}
    </div>
  );
};

export default SearchBar;