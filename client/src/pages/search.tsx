"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  ArrowUpDown,
  Ghost,
  Skull,
  Brain,
  Dna 
} from "lucide-react"

import type { Post } from "@/shared/schema"
import type { ThemeCategory } from "@/shared/types"

interface SearchParams {
  query: string;
  categories: ThemeCategory[];
  readingTimeMin: number;
  readingTimeMax: number;
  sortBy: 'newest' | 'oldest' | 'popular' | 'recommended';
  authorId?: number;
}

export default function SearchPage() {
  // Parse query parameters (if any) from the URL
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: urlParams.get('q') || '',
    categories: (urlParams.get('categories')?.split(',') || []) as ThemeCategory[],
    readingTimeMin: Number(urlParams.get('minTime')) || 0,
    readingTimeMax: Number(urlParams.get('maxTime')) || 60,
    sortBy: (urlParams.get('sort') as 'newest' | 'oldest' | 'popular' | 'recommended') || 'newest'
  });
  
  // Derived states
  const [selectedCategories, setSelectedCategories] = useState<ThemeCategory[]>(searchParams.categories);
  const [readingTimeRange, setReadingTimeRange] = useState<[number, number]>([
    searchParams.readingTimeMin, 
    searchParams.readingTimeMax
  ]);
  
  // Search query
  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [
      '/api/posts/search', 
      searchParams.query, 
      searchParams.categories, 
      searchParams.readingTimeMin, 
      searchParams.readingTimeMax,
      searchParams.sortBy
    ],
    queryFn: async () => {
      // If search is empty and no filters, return all posts
      if (!searchParams.query && !searchParams.categories.length && 
          searchParams.readingTimeMin === 0 && searchParams.readingTimeMax === 60) {
        return await fetch('/api/posts').then(res => res.json());
      }
      
      // Otherwise, perform a search with filters
      const params = new URLSearchParams();
      if (searchParams.query) params.append('q', searchParams.query);
      if (searchParams.categories.length) params.append('categories', searchParams.categories.join(','));
      params.append('minTime', searchParams.readingTimeMin.toString());
      params.append('maxTime', searchParams.readingTimeMax.toString());
      params.append('sort', searchParams.sortBy);
      
      return await fetch(`/api/posts/search?${params.toString()}`).then(res => res.json());
    },
    enabled: true,
  });
  
  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchParams.query) params.append('q', searchParams.query);
    if (searchParams.categories.length) params.append('categories', searchParams.categories.join(','));
    params.append('minTime', searchParams.readingTimeMin.toString());
    params.append('maxTime', searchParams.readingTimeMax.toString());
    params.append('sort', searchParams.sortBy);
    
    window.history.replaceState(
      {}, 
      '', 
      `${location.split('?')[0]}?${params.toString()}`
    );
  }, [searchParams, location]);
  
  // Apply search filters
  const applyFilters = () => {
    setSearchParams({
      ...searchParams,
      categories: selectedCategories,
      readingTimeMin: readingTimeRange[0],
      readingTimeMax: readingTimeRange[1]
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setReadingTimeRange([0, 60]);
    setSearchParams({
      ...searchParams,
      categories: [],
      readingTimeMin: 0,
      readingTimeMax: 60,
      sortBy: 'newest'
    });
  };
  
  // Helper for rendering theme category badges
  const getCategoryIcon = (category: ThemeCategory) => {
    switch(category) {
      case 'SUPERNATURAL': return <Ghost className="h-4 w-4" />;
      case 'DEATH': return <Skull className="h-4 w-4" />;
      case 'PSYCHOLOGICAL': return <Brain className="h-4 w-4" />;
      case 'BODY_HORROR': return <Dna className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };
  
  // Helper for rendering theme categories as badges
  const renderCategoryBadge = (category: ThemeCategory) => {
    const isSelected = selectedCategories.includes(category);
    
    return (
      <Badge 
        key={category}
        variant={isSelected ? "default" : "outline"}
        className={`cursor-pointer ${isSelected ? '' : 'text-muted-foreground'}`}
        onClick={() => {
          if (isSelected) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
          } else {
            setSelectedCategories([...selectedCategories, category]);
          }
        }}
      >
        {getCategoryIcon(category)}
        <span className="ml-1">{category.replace('_', ' ').toLowerCase()}</span>
      </Badge>
    );
  };
  
  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Advanced Search</h1>
      
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          className="pl-10 h-12 text-lg"
          placeholder="Search horror stories by title, content, or author..."
          value={searchParams.query}
          onChange={e => setSearchParams({...searchParams, query: e.target.value})}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
        <Button 
          className="absolute right-1 top-1"
          onClick={applyFilters}
        >
          Search
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
            
            <Separator className="my-3" />
            
            {/* Theme categories */}
            <div className="mb-5">
              <h3 className="text-md font-medium mb-2">Theme Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['SUPERNATURAL', 'PSYCHOLOGICAL', 'BODY_HORROR', 'DEATH', 'GOTHIC', 'LOVECRAFTIAN', 'ISOLATION', 'DREAMSCAPE'].map(
                  category => renderCategoryBadge(category as ThemeCategory)
                )}
              </div>
            </div>
            
            <Separator className="my-3" />
            
            {/* Reading time */}
            <div className="mb-5">
              <h3 className="text-md font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Reading Time (mins)
              </h3>
              <Slider 
                defaultValue={readingTimeRange} 
                min={0}
                max={60}
                step={5}
                value={readingTimeRange}
                onValueChange={(value) => setReadingTimeRange(value as [number, number])}
                className="my-5"
              />
              <div className="flex justify-between text-sm">
                <span>{readingTimeRange[0]} mins</span>
                <span>{readingTimeRange[1]} mins</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            {/* Sort options */}
            <div>
              <h3 className="text-md font-medium mb-2 flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort By
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Newest First', value: 'newest' },
                  { label: 'Oldest First', value: 'oldest' },
                  { label: 'Most Popular', value: 'popular' },
                  { label: 'Recommended', value: 'recommended' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={option.value}
                      checked={searchParams.sortBy === option.value}
                      onCheckedChange={() => 
                        setSearchParams({
                          ...searchParams, 
                          sortBy: option.value as any
                        })
                      }
                    />
                    <label htmlFor={option.value} className="text-sm cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button className="w-full mt-4" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Search results */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">
            {isLoading 
              ? 'Searching...' 
              : `${searchResults?.length || 0} Results Found`
            }
          </h2>
          
          {error ? (
            <div className="p-4 border border-destructive rounded-lg text-destructive">
              An error occurred while searching. Please try again.
            </div>
          ) : isLoading ? (
            // Loading skeletons
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <Skeleton className="h-20 w-full mb-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults?.length ? (
            <div className="space-y-6">
              {searchResults.map((post: Post) => (
                <div key={post.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="text-xl font-semibold mb-1">
                    <a href={`/stories/${post.slug}`} className="hover:underline">
                      {post.title}
                    </a>
                  </h3>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <User className="h-3 w-3 mr-1" />
                    <span className="mr-3">
                      {post.authorName || 'Anonymous'}
                    </span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="mr-3">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {post.readingTime || Math.ceil(post.content.length / 1500)} min read
                    </span>
                  </div>
                  
                  <p className="line-clamp-3 text-muted-foreground mb-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.metadata && post.metadata.triggerWarnings && post.metadata.triggerWarnings.map(warning => (
                      <Badge key={warning} variant="outline">
                        {warning}
                      </Badge>
                    ))}
                    {post.metadata && post.metadata.themeCategory && (
                      <Badge>
                        {getCategoryIcon(post.metadata.themeCategory as ThemeCategory)}
                        <span className="ml-1">
                          {(post.metadata.themeCategory as string).replace('_', ' ').toLowerCase()}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">No stories match your search</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filter criteria
              </p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}