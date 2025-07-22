import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Check, X, AlertTriangle, Clock, ExternalLink, FileText, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

interface SyncStats {
  lastSync: string;
  totalSyncs: number;
  postsCreated: number;
  postsUpdated: number;
  lastDuration: number;
  status: "idle" | "running" | "error";
  errorMessage?: string;
}

interface WordPressPost {
  id: number;
  wpId: number;
  title: string;
  slug: string;
  status: "published" | "draft" | "pending";
  syncedAt: string;
  lastUpdated: string;
  syncStatus: "success" | "error" | "pending";
}

export default function WordPressSyncPage() {
  const { toast } = useToast();
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncInterval, setSyncInterval] = useState<number>(5);
  const [hideFutureContent, setHideFutureContent] = useState<boolean>(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  // Fetch sync stats and WordPress posts
  const { data: syncStats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery<SyncStats>({
    queryKey: ['/api/wordpress/stats'],
    queryFn: async () => {
      const response = await fetch('/api/wordpress/stats');
      if (!response.ok) {
        throw new Error("Failed to fetch WordPress sync stats");
      }
      return response.json();
    }
  });

  const { data: wordPressPosts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery<WordPressPost[]>({
    queryKey: ['/api/wordpress/posts'],
    queryFn: async () => {
      const response = await fetch('/api/wordpress/posts');
      if (!response.ok) {
        throw new Error("Failed to fetch WordPress posts");
      }
      return response.json();
    }
  });

  // Update sync progress while sync is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (syncInProgress) {
      // Start at 5% to show immediate feedback
      setSyncProgress(5);
      
      interval = setInterval(() => {
        setSyncProgress((prevProgress) => {
          // Gradually increase up to 90% (the last 10% will be set when complete)
          if (prevProgress < 90) {
            return prevProgress + Math.random() * 5;
          }
          return prevProgress;
        });
        
        // Check if sync is complete
        refetchStats().then((result) => {
          if (result.data && result.data.status === "idle") {
            setSyncInProgress(false);
            setSyncProgress(100);
            refetchPosts();
            
            setTimeout(() => {
              setSyncProgress(0);
            }, 1000);
          }
        });
      }, 1000);
    } else {
      // Reset progress when sync is complete
      if (syncProgress === 100) {
        setTimeout(() => {
          setSyncProgress(0);
        }, 1000);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [syncInProgress, refetchStats, refetchPosts, syncProgress]);

  // Handle starting WordPress sync
  const handleStartSync = async () => {
    if (syncInProgress) {
      toast({
        title: "Sync in Progress",
        description: "A WordPress sync is already running. Please wait for it to complete.",
      });
      return;
    }

    try {
      setSyncInProgress(true);
      setSyncLog([]);
      
      const response = await fetch("/api/wordpress/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger sync: ${response.statusText}`);
      }
      
      // Add initial log message
      setSyncLog(prevLog => [...prevLog, "WordPress sync started..."]);
      
      toast({
        title: "Sync Started",
        description: "WordPress sync has been started. This may take a few minutes.",
      });
      
      // Simulate sync log updates
      setTimeout(() => {
        setSyncLog(prevLog => [...prevLog, "Connecting to WordPress API..."]);
      }, 1000);
      
      setTimeout(() => {
        setSyncLog(prevLog => [...prevLog, "Fetching posts from WordPress..."]);
      }, 2500);
      
      setTimeout(() => {
        setSyncLog(prevLog => [...prevLog, "Processing post content..."]);
      }, 4000);
    } catch (error) {
      console.error("Error triggering sync:", error);
      setSyncInProgress(false);
      setSyncProgress(0);
      toast({
        title: "Error",
        description: "Failed to start WordPress sync. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle saving sync settings
  const handleSaveSettings = () => {
    // In a real implementation, this would save to the server
    toast({
      title: "Settings Saved",
      description: "WordPress sync settings have been updated.",
    });
  };

  // Filter posts based on search query
  const filteredPosts = React.useMemo(() => {
    // First ensure wordPressPosts exists and is an array
    if (!wordPressPosts) {
      console.log('wordPressPosts is empty or null, returning empty array');
      return [];
    }
    
    // More robust check to ensure wordPressPosts is an array
    if (!Array.isArray(wordPressPosts)) {
      console.error('Expected wordPressPosts to be an array but got:', typeof wordPressPosts, wordPressPosts);
      return [];
    }
    
    // Now we're sure wordPressPosts is an array
    if (!searchQuery) return [...wordPressPosts]; // Return a shallow copy to ensure it's a fresh array
    
    try {
      const query = searchQuery.toLowerCase();
      const filtered = wordPressPosts.filter(post => {
        // Ensure post is an object with required properties
        if (!post || typeof post !== 'object') {
          console.log('Skipping invalid post:', post);
          return false;
        }
        
        // Handle case where title or slug might be undefined or null
        const title = post.title || '';
        const slug = post.slug || '';
        
        // Verify these properties are strings before calling toLowerCase
        const titleStr = typeof title === 'string' ? title.toLowerCase() : '';
        const slugStr = typeof slug === 'string' ? slug.toLowerCase() : '';
        
        return titleStr.includes(query) || slugStr.includes(query);
      });
      
      // One final check to ensure we return an array
      return Array.isArray(filtered) ? filtered : [];
    } catch (error) {
      console.error('Error filtering posts:', error);
      return [];
    }
  }, [wordPressPosts, searchQuery]);

  // Loading state
  if (isLoadingStats && isLoadingPosts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
            <div>
              <CardTitle>WordPress Sync Status</CardTitle>
              <CardDescription>
                Synchronize content with your WordPress blog
              </CardDescription>
            </div>
            <Button 
              onClick={handleStartSync} 
              disabled={syncInProgress}
              className="min-w-[140px]"
            >
              {syncInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Synchronized:</span>
                <span className="text-sm font-medium">
                  {syncStats?.lastSync ? format(new Date(syncStats.lastSync), "MMM dd, yyyy HH:mm") : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Syncs Performed:</span>
                <span className="text-sm font-medium">{syncStats?.totalSyncs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Sync Duration:</span>
                <span className="text-sm font-medium">
                  {syncStats?.lastDuration ? `${syncStats.lastDuration.toFixed(1)} seconds` : "N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Posts Created:</span>
                <span className="text-sm font-medium">{syncStats?.postsCreated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Posts Updated:</span>
                <span className="text-sm font-medium">{syncStats?.postsUpdated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <span className="text-sm font-medium">
                  {syncStats?.status === "running" ? (
                    <Badge className="bg-blue-500">Running</Badge>
                  ) : syncStats?.status === "error" ? (
                    <Badge variant="destructive">Error</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600">Idle</Badge>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar for sync */}
          {syncInProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sync Progress</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
              
              {/* Sync Log */}
              <div className="mt-4 p-3 border rounded-md bg-muted/30 max-h-32 overflow-y-auto font-mono text-xs">
                {syncLog.map((log, index) => (
                  <div key={index} className="py-0.5 whitespace-pre-wrap">
                    &gt; {log}
                  </div>
                ))}
                {syncInProgress && (
                  <div className="animate-pulse py-0.5">
                    &gt; <span className="inline-block w-2 h-2 bg-primary"></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WordPress Posts List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-2">
            <div>
              <CardTitle>WordPress Content</CardTitle>
              <CardDescription>
                Manage WordPress posts synchronized to your platform
              </CardDescription>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(filteredPosts) || filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No WordPress posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Ensure filteredPosts is 100% an array before mapping
                  (Array.isArray(filteredPosts) ? filteredPosts : []).map(post => {
                    // Safety check for each post
                    if (!post || typeof post !== 'object') return null;
                    
                    // Get a safe key for React
                    const safeKey = post.id || Math.random();
                    
                    return (
                      <TableRow key={safeKey}>
                        <TableCell className="font-medium">{post.title || 'Untitled'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            post.status === 'published' ? 'default' : 
                            post.status === 'draft' ? 'outline' : 
                            'secondary'
                          }>
                            {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.lastUpdated ? format(new Date(post.lastUpdated), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {post.syncStatus === 'success' ? (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-sm">Synced</span>
                            </div>
                          ) : post.syncStatus === 'error' ? (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                              <span className="text-sm">Error</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-amber-600 mr-1" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => post.slug ? window.open(`/reader/${post.slug}`, '_blank') : null}
                              title="View Post"
                              disabled={!post.slug}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => post.wpId ? window.open(`https://bubbleteameimei.wordpress.com/post/${post.wpId}`, '_blank') : null}
                              title="View on WordPress"
                              disabled={!post.wpId}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>
            Configure how WordPress content is synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync WordPress content
                  </p>
                </div>
                <Switch
                  id="autoSync"
                  checked={autoSyncEnabled}
                  onCheckedChange={setAutoSyncEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(parseInt(e.target.value) || 5)}
                  disabled={!autoSyncEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  How often to check for new WordPress content
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hideFuture">Hide Future Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Don't show scheduled WordPress posts until published
                  </p>
                </div>
                <Switch
                  id="hideFuture"
                  checked={hideFutureContent}
                  onCheckedChange={setHideFutureContent}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="syncComments">Sync Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Import comments from WordPress posts
                  </p>
                </div>
                <Switch
                  id="syncComments"
                  checked={false}
                  disabled
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="wordpressUrl">WordPress URL</Label>
            <Input
              id="wordpressUrl"
              value="https://bubbleteameimei.wordpress.com"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              The URL of your WordPress site (contact administrator to change)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}