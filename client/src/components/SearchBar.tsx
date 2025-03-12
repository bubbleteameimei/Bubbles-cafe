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
  compact?: boolean;
  categories?: string[];
}

export const SearchBar = ({
  className = "",
  placeholder = "Search horror stories...",
  showIcon = true,
  animate = true,
  onSearchChange,
  compact = false,
  categories = []
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
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

  // Handle mock search results - replace with actual API call in production
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }

    if (query.trim().length > 1) {
      // This is where you would normally fetch results from an API
      // For now, we're just simulating a search
      const mockResults = [
        { id: 1, title: "The Haunting", excerpt: "A ghost story about..." },
        { id: 2, title: "Midnight Terror", excerpt: "When the clock strikes..." },
        { id: 3, title: "Shadows in the Attic", excerpt: "The family never..." }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setShowResults(isFocused && mockResults.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [query, isFocused, onSearchChange]);

  return (
    <div 
      ref={searchContainerRef}
      className={`relative w-full max-w-md ${className}`}
    >
      <motion.div
        initial={animate ? { opacity: 0, y: -10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
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
            className={`w-full pl-10 pr-10 py-2 bg-background border ${
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

      {/* Search Results Dropdown */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg overflow-hidden"
        >
          <div className="max-h-[300px] overflow-y-auto p-2">
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-2 cursor-pointer hover:bg-accent/10 rounded"
                onClick={() => {
                  navigate(`/reader/${result.id}`);
                  setShowResults(false);
                  setQuery("");
                }}
              >
                <h4 className="font-medium text-foreground">{result.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {result.excerpt}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;