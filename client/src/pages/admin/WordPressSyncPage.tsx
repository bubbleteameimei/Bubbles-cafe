import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, parseISO } from "date-fns";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, Rss, Search, Info } from "lucide-react";

interface SyncStatus {
  syncInProgress: boolean;
  lastSyncTime: string | null;
  lastSyncStatus: 'success' | 'failed' | 'partial' | null;
  lastError?: string;
  postsImported?: number;
  totalPosts?: number;
  wpApiEndpoint?: string;
}

interface Post {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  date: string;
  wordpressId?: number;
  status?: string;
  excerpt?: {
    rendered: string;
  };
  categories?: number[];
}

interface WordPressPostsResponse {
  posts: Post[];
  total?: number;
  page?: number;
  hasMore?: boolean;
}

export default function WordPressSyncPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncInProgress: false,
    lastSyncTime: null,
    lastSyncStatus: null
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  
  // Function to fetch WordPress sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch("/api/wordpress/sync/status");
      if (!response.ok) {
        throw new Error(`Failed to fetch sync status: ${response.statusText}`);
      }
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error("Error fetching sync status:", error);
      toast({
        title: "Error",
        description: "Failed to fetch WordPress sync status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger manual sync
  const triggerSync = async () => {
    if (syncStatus.syncInProgress) {
      toast({
        title: "Sync in Progress",
        description: "A WordPress sync is already running. Please wait for it to complete.",
        variant: "default",
      });
      return;
    }

    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      const response = await fetch("/api/wordpress/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger sync: ${response.statusText}`);
      }
      
      toast({
        title: "Sync Started",
        description: "WordPress sync has been started. This may take a few minutes.",
        variant: "default",
      });
      
      // Poll for status updates
      pollSyncStatus();
    } catch (error) {
      console.error("Error triggering sync:", error);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
      toast({
        title: "Error",
        description: "Failed to start WordPress sync. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to sync a single post by ID
  const syncSinglePost = async (postId: number) => {
    try {
      setSearching(true);
      const response = await fetch(`/api/wordpress/sync/${postId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync post: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Post Synced",
        description: `The post "${result.title || 'Unknown'}" has been successfully synced.`,
        variant: "default",
      });
      
      // Refresh post list
      fetchWordPressPosts(1);
      // Refresh sync status
      fetchSyncStatus();
    } catch (error) {
      console.error("Error syncing post:", error);
      toast({
        title: "Error",
        description: "Failed to sync the post. Please check the WordPress API access and try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  // Function to poll for status updates during sync
  const pollSyncStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/wordpress/sync/status");
        if (!response.ok) {
          throw new Error(`Failed to fetch sync status: ${response.statusText}`);
        }
        const data = await response.json();
        setSyncStatus(data);
        
        // If sync is no longer in progress, stop polling
        if (!data.syncInProgress) {
          clearInterval(interval);
          // Refresh the post list
          fetchWordPressPosts(1);
        }
      } catch (error) {
        console.error("Error polling sync status:", error);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up on component unmount
    return () => clearInterval(interval);
  };

  // Function to fetch WordPress posts
  const fetchWordPressPosts = async (pageNum: number, query?: string) => {
    try {
      setSearching(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        ...(query ? { search: query } : {}),
      });
      
      const response = await fetch(`/api/wordpress/posts?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const data: WordPressPostsResponse = await response.json();
      setPosts(data.posts || []);
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching WordPress posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch WordPress posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  // Function to handle search
  const handleSearch = () => {
    fetchWordPressPosts(1, searchQuery);
  };

  // Function to get status badge
  const getStatusBadge = () => {
    if (syncStatus.syncInProgress) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Syncing</span>
        </Badge>
      );
    }
    
    switch (syncStatus.lastSyncStatus) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Success</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Partial</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Unknown</span>
          </Badge>
        );
    }
  };

  // Function to render sync info
  const renderSyncInfo = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>{getStatusBadge()}</div>
              {syncStatus.lastSyncTime && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(parseISO(syncStatus.lastSyncTime), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posts Imported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus.postsImported || 0}
              {syncStatus.totalPosts && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  of {syncStatus.totalPosts}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">WordPress API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm truncate">
              {syncStatus.wpApiEndpoint || "Not configured"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Load initial data
  useEffect(() => {
    fetchSyncStatus();
    fetchWordPressPosts(1);
    
    // If a sync is in progress when the component mounts, start polling
    if (syncStatus.syncInProgress) {
      pollSyncStatus();
    }
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="WordPress Sync"
        description="Manage content synchronization between WordPress and this application"
      >
        <Button
          onClick={triggerSync}
          disabled={syncStatus.syncInProgress}
          className="flex items-center gap-1"
        >
          {syncStatus.syncInProgress ? (
            <>
              <Spinner size="sm" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Sync Now</span>
            </>
          )}
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {syncStatus.lastSyncStatus === 'failed' && syncStatus.lastError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sync Failed</AlertTitle>
          <AlertDescription>{syncStatus.lastError}</AlertDescription>
        </Alert>
      )}

      {/* Sync Status Cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        renderSyncInfo()
      )}

      {/* WordPress Posts */}
      <Tabs defaultValue="posts" className="mt-6">
        <TabsList>
          <TabsTrigger value="posts">WordPress Posts</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSearch} 
              disabled={searching}
            >
              {searching ? <Spinner size="sm" /> : "Search"}
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Title</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-24 text-center text-muted-foreground">
                          {searching ? (
                            <div className="flex flex-col items-center justify-center">
                              <Spinner size="md" className="mb-2" />
                              <span>Searching...</span>
                            </div>
                          ) : (
                            "No posts found"
                          )}
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-2 px-4 align-middle">{post.id}</td>
                          <td className="p-2 px-4 align-middle font-medium" dangerouslySetInnerHTML={{ __html: post.title?.rendered || '' }}></td>
                          <td className="p-2 px-4 align-middle">
                            <Badge variant={post.status === 'publish' ? 'default' : 'outline'}>
                              {post.status || 'draft'}
                            </Badge>
                          </td>
                          <td className="p-2 px-4 align-middle text-muted-foreground">
                            {new Date(post.date).toLocaleDateString()}
                          </td>
                          <td className="p-2 px-4 align-middle text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => syncSinglePost(post.id)}
                              disabled={syncStatus.syncInProgress}
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Sync
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {page}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchWordPressPosts(page > 1 ? page - 1 : 1, searchQuery)}
                  disabled={page <= 1 || searching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchWordPressPosts(page + 1, searchQuery)}
                  disabled={!hasMore || searching}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync-history">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent WordPress content synchronization activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sync history will be implemented in a future update. This will show detailed logs of previous sync operations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}