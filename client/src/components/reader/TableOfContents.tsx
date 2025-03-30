import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shuffle, Search, Home, X, BookOpen } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  date: string;
}

interface TableOfContentsProps {
  currentPostId: number;
  onClose: () => void;
}

export default function TableOfContents({ currentPostId, onClose }: TableOfContentsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts?limit=100');
        if (response.ok) {
          const data = await response.json();
          // Normalize posts to have consistent structure
          const normalizedPosts = data.posts.map((post: any) => ({
            id: post.id,
            title: post.title?.rendered || post.title || 'Untitled',
            slug: post.slug || `post-${post.id}`,
            date: post.date || post.createdAt || new Date().toISOString()
          }));
          setPosts(normalizedPosts);
        } else {
          console.error('Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handlePostClick = (slug: string) => {
    setLocation(`/reader/${slug}`);
    onClose();
  };

  const handleHomeClick = () => {
    setLocation('/');
    onClose();
  };

  const handleRandomStory = () => {
    if (posts.length > 0) {
      // Get random post excluding current post
      const filteredPosts = posts.filter(post => post.id !== currentPostId);
      if (filteredPosts.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredPosts.length);
        const randomPost = filteredPosts[randomIndex];
        setLocation(`/reader/${randomPost.slug}`);
        onClose();
      }
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DialogContent className="sm:max-w-md h-[85vh] md:h-[90vh] flex flex-col p-6" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="flex items-center justify-between">
        <DialogTitle id="dialog-title" className="text-lg font-medium">Table of Contents</DialogTitle>
        <DialogClose asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-9 w-9 border-muted-foreground/20 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>
      <DialogDescription id="dialog-description">
        Browse all available stories or search for a specific title.
      </DialogDescription>
      
      <div className="flex gap-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleHomeClick}
          className="flex items-center gap-1.5 min-w-0 flex-shrink-0"
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Home</span>
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleRandomStory}
          className="flex items-center gap-1.5 min-w-0 flex-shrink-0"
          disabled={posts.length <= 1}
        >
          <Shuffle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Random</span>
        </Button>
      </div>
      
      <div className="relative mt-3">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stories..."
          className="pl-9 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Key fix: Make sure the scroll container has enough height and proper overflow behavior */}
      <div className="flex-1 mt-4 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 h-full pr-4" style={{ maxHeight: 'calc(85vh - 250px)' }}>
          <div className="px-1 pb-10">
            {filteredPosts.length === 0 && searchTerm ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="text-sm text-muted-foreground">No stories found matching "{searchTerm}"</div>
                <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-2 rounded-md transition-colors hover:bg-accent cursor-pointer ${
                      post.id === currentPostId ? "bg-accent/50 font-medium" : ""
                    }`}
                    onClick={() => handlePostClick(post.slug)}
                  >
                    <div className="font-medium truncate w-full">{post.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(post.date)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Search results count */}
      {searchTerm && (
        <div className="text-xs text-muted-foreground py-2 flex items-center justify-center gap-1.5 border-t mt-2">
          <BookOpen className="h-3.5 w-3.5" />
          <span>
            {filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"} found
          </span>
          {posts.length !== filteredPosts.length && (
            <span className="text-xs text-muted-foreground">
              (of {posts.length} total)
            </span>
          )}
        </div>
      )}
      
      {/* Total number of stories at the bottom - fixed position */}
      <div className="text-xs text-muted-foreground py-3 text-center border-t border-border/20 mt-auto">
        <div className="flex items-center justify-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary/70" />
          <span>Total stories in library: <span className="font-medium text-primary/90">{posts.length}</span></span>
        </div>
      </div>
    </DialogContent>
  );
}