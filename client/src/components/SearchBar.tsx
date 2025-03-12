import React, { useState } from "react";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "wouter";

interface SearchBarProps {
  data: { title: string; slug: string }[];
}

const SearchBar: React.FC<SearchBarProps> = ({ data }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [, navigate] = useNavigate();

  const filteredData = query.length > 1 
    ? data.filter((item) => 
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleItemClick = (slug: string) => {
    setQuery("");
    navigate(`/reader/${slug}`);
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Search stories..."
        className="w-full px-4 py-2 border border-border rounded-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      <AnimatePresence>
        {isFocused && filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <ul className="py-1">
              {filteredData.map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="cursor-pointer px-4 py-2 hover:bg-muted transition-colors"
                  onClick={() => handleItemClick(item.slug)}
                >
                  {item.title}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;