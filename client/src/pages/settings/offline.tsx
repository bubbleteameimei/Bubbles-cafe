import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  BookOpen, 
  HardDrive, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Eye,
  BookMarked,
  CloudOff,
  Bookmark,
  RefreshCw,
  HardDriveDownload
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { useShowToast } from '@/components/toast/toast-utils';

// Define types for story data
interface StoryData {
  id: number;
  title: string;
  slug: string;
  size: number;
  lastRead?: string;
  coverImage?: string;
  status: 'complete' | 'downloading' | 'queued';
  progress?: number;
  excerpt?: string;
  author?: string;
}

// Interface for local storage stats
interface StorageStats {
  totalSize: number;
  storySize: number;
  mediaSize: number;
  usedPercentage: number;
}

export default function OfflineSettingsPage() {
  // Toast notification hook
  const showToast = useShowToast();
  
  // State management
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [mediaDownload, setMediaDownload] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState("medium");
  const [maxStorage, setMaxStorage] = useState(5);
  const [activeTab, setActiveTab] = useState("settings");
  const [wifiOnly, setWifiOnly] = useState(true);
  
  // Network status
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const checkNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    checkNetworkStatus();
    
    // Add real event listeners for online/offline events
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
    
    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
    };
  }, []);
  
  // Fetch posts for offline storage
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      return data.posts || [];
    },
    enabled: isOnline
  });
  
  // Storage stats calculation
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSize: 2.1,
    storySize: 1.7,
    mediaSize: 0.4,
    usedPercentage: 42
  });
  
  // Calculate actual storage based on downloaded stories
  useEffect(() => {
    if (posts && posts.length > 0) {
      // Estimate storage size based on content length
      const storySize = posts.slice(0, 6).reduce((total: number, post: any) => {
        // Rough estimate: 1KB per 1000 characters
        const contentSize = (post.content?.length || 0) / 1000 / 1000;
        return total + Math.max(0.1, contentSize);
      }, 0);
      
      // Media size is typically images and audio
      const mediaSize = mediaDownload ? posts.slice(0, 6).length * 0.15 : 0;
      
      const totalSize = storySize + mediaSize;
      const usedPercentage = Math.min(100, Math.round((totalSize / maxStorage) * 100));
      
      setStorageStats({
        totalSize,
        storySize,
        mediaSize,
        usedPercentage
      });
    }
  }, [posts, mediaDownload, maxStorage]);
  
  // Create downloaded stories from the actual posts
  const downloadedStories: StoryData[] = posts ? posts.slice(0, 6).map((post: any, index: number) => {
    // Convert post to downloaded story format
    const estimatedSize = Math.round((post.content?.length || 1000) / 1000 / 10) / 10;
    const lastReadDays = [2, 7, 3, 0, 5, 1];
    const lastReadText = index === 3 ? "Just now" : `${lastReadDays[index]} days ago`;
    
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      size: Math.max(0.1, estimatedSize),
      lastRead: lastReadText,
      coverImage: post.coverImage,
      status: index === 3 ? 'downloading' : 'complete',
      progress: index === 3 ? 75 : undefined,
      excerpt: post.excerpt,
      author: post.author?.username || 'Unknown'
    };
  }) : [];
  
  // Download status management
  const [syncStatus, setSyncStatus] = useState("upToDate"); // "syncing", "upToDate", "error"
  
  // Force a sync/refresh
  const handleSync = () => {
    setSyncStatus("syncing");
    showToast.success("Syncing content...");
    
    // In a real implementation, this would sync content
    setTimeout(() => {
      setSyncStatus("upToDate");
      showToast.withAction({
        title: "Sync Complete",
        description: "All stories are now up to date",
        variant: "success",
        actionText: "View Downloads",
        onAction: () => setActiveTab("downloads")
      });
    }, 2000);
  };
  
  // Clear all cached data
  const handleClearCache = () => {
    // In a real implementation, this would clear the cached data
    setStorageStats({
      ...storageStats,
      totalSize: 0,
      storySize: 0,
      mediaSize: 0,
      usedPercentage: 0
    });
    
    showToast.success("All cached data has been cleared");
  };
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Offline Reading</h1>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "outline" : "destructive"} className="flex items-center space-x-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </Badge>
          
          <Badge variant={syncStatus === "upToDate" ? "outline" : syncStatus === "syncing" ? "secondary" : "destructive"} className="flex items-center space-x-1">
            {syncStatus === "upToDate" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : syncStatus === "syncing" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Clock className="h-3 w-3" />
              </motion.div>
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            <span>
              {syncStatus === "upToDate" 
                ? "All content synced" 
                : syncStatus === "syncing" 
                  ? "Syncing..." 
                  : "Sync error"}
            </span>
          </Badge>
        </div>
      </div>
      
      <Alert variant={isOnline ? "default" : "destructive"} className="border border-primary/20">
        <CloudOff className={`h-4 w-4 ${isOnline ? 'opacity-50' : ''}`} />
        <AlertTitle>{isOnline ? "Offline Mode Available" : "You are currently offline"}</AlertTitle>
        <AlertDescription>
          {isOnline 
            ? "Your downloaded stories are available for reading even without an internet connection." 
            : "You can still access your downloaded stories. Some features may be limited until you reconnect."}
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center space-x-2">
            <HardDriveDownload className="h-4 w-4" />
            <span>Downloads</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Offline Reading Settings</span>
              </CardTitle>
              <CardDescription>Configure how your stories are saved for offline reading</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offline-mode" className="text-base">Enable Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">Save stories for reading without internet</p>
                  </div>
                  <Switch 
                    id="offline-mode" 
                    checked={offlineMode}
                    onCheckedChange={(checked) => {
                      setOfflineMode(checked);
                      showToast.simple(`Offline mode ${checked ? 'enabled' : 'disabled'}`);
                    }}
                    size="md"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-download" className="text-base">Auto-Download New Stories</Label>
                    <p className="text-sm text-muted-foreground">Automatically save new stories when published</p>
                  </div>
                  <Switch 
                    id="auto-download" 
                    checked={autoDownload}
                    onCheckedChange={setAutoDownload}
                    disabled={!offlineMode}
                    size="md"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="media-download" className="text-base">Download Media Content</Label>
                    <p className="text-sm text-muted-foreground">Include images and audio with stories</p>
                  </div>
                  <Switch 
                    id="media-download" 
                    checked={mediaDownload}
                    onCheckedChange={setMediaDownload}
                    disabled={!offlineMode}
                    size="md"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="wifi-only" className="text-base">Download on WiFi Only</Label>
                    <p className="text-sm text-muted-foreground">Save your mobile data by downloading only on WiFi</p>
                  </div>
                  <Switch 
                    id="wifi-only" 
                    checked={wifiOnly}
                    onCheckedChange={setWifiOnly}
                    disabled={!offlineMode}
                    size="md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality-select" className="text-base">Download Quality</Label>
                  <p className="text-sm text-muted-foreground mb-2">Choose the quality level for images and media</p>
                  <Select 
                    value={downloadQuality} 
                    onValueChange={setDownloadQuality}
                    disabled={!offlineMode || !mediaDownload}
                  >
                    <SelectTrigger id="quality-select" className="w-full">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Saves Space)</SelectItem>
                      <SelectItem value="medium">Medium (Recommended)</SelectItem>
                      <SelectItem value="high">High (Better Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Maximum Storage</Label>
                    <span className="text-sm font-medium">{maxStorage} GB</span>
                  </div>
                  <Slider
                    defaultValue={[maxStorage]}
                    max={10}
                    step={0.5}
                    value={[maxStorage]}
                    onValueChange={(values) => {
                      const newValue = values[0];
                      setMaxStorage(newValue);
                      
                      if (newValue > 8) {
                        showToast.withAction({
                          title: "Large Storage Allocated",
                          description: "You've set a large storage limit. Make sure you have enough space on your device.",
                          variant: "default",
                          actionText: "Optimize",
                          onAction: () => setMaxStorage(5)
                        });
                      } else if (newValue < storageStats.totalSize) {
                        showToast.withAction({
                          title: "Warning",
                          description: "Some content may be removed to fit within your new storage limit.",
                          variant: "destructive",
                          actionText: "Restore",
                          onAction: () => setMaxStorage(Math.ceil(storageStats.totalSize * 2) / 2)
                        });
                      } else {
                        showToast.simple(`Storage limit set to ${newValue.toFixed(1)} GB`);
                      }
                    }}
                    disabled={!offlineMode}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Older content will be removed automatically when storage limit is reached
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="text-destructive hover:text-destructive"
                disabled={storageStats.totalSize === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Cached Data
              </Button>
              <Button 
                variant="default" 
                onClick={handleSync}
                disabled={syncStatus === "syncing" || !isOnline}
              >
                <motion.div
                  animate={syncStatus === "syncing" ? { rotate: 360 } : {}}
                  transition={{ repeat: syncStatus === "syncing" ? Infinity : 0, duration: 2, ease: "linear" }}
                  className="mr-2"
                >
                  <Download className="h-4 w-4" />
                </motion.div>
                {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Storage Usage</span>
              </CardTitle>
              <CardDescription>Manage your offline storage</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Used Space</span>
                  <span className="text-sm font-semibold">
                    {storageStats.totalSize.toFixed(1)} GB / {maxStorage} GB
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={storageStats.usedPercentage} 
                    className="h-3"
                    indicatorClassName={
                      storageStats.usedPercentage > 90 
                        ? "bg-red-500" 
                        : storageStats.usedPercentage > 70 
                          ? "bg-amber-500" 
                          : "bg-emerald-500"
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {storageStats.usedPercentage > 90 
                        ? "Critical" 
                        : storageStats.usedPercentage > 70 
                          ? "Filling up" 
                          : "Good"
                      }
                    </span>
                    <span>{Math.round(storageStats.usedPercentage)}% used</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col space-y-1 rounded-lg bg-primary/5 p-3 border border-border/30">
                    <span className="text-xs text-muted-foreground">Stories</span>
                    <span className="text-lg font-semibold">{storageStats.storySize.toFixed(1)} GB</span>
                  </div>
                  <div className="flex flex-col space-y-1 rounded-lg bg-primary/5 p-3 border border-border/30">
                    <span className="text-xs text-muted-foreground">Media</span>
                    <span className="text-lg font-semibold">{storageStats.mediaSize.toFixed(1)} GB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Downloads Tab */}
        <TabsContent value="downloads" className="space-y-4 mt-2">
          <Card>
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center space-x-2">
                <BookMarked className="h-5 w-5" />
                <span>Downloaded Stories</span>
              </CardTitle>
              <CardDescription>Manage your locally saved stories</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {isLoadingPosts 
                      ? "Loading stories..." 
                      : `${downloadedStories.length} stories available offline`
                    }
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {isOnline ? "Manage Downloads" : "Offline Mode"}
                  </Badge>
                </div>
              </div>
              
              {isLoadingPosts ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <RefreshCw className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4">
                  {downloadedStories.length > 0 ? (
                    downloadedStories.map((story) => (
                      <motion.div 
                        key={story.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 rounded-md h-12 w-12 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary/70" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{story.title}</span>
                              {story.status === "downloading" && (
                                <Badge variant="secondary" className="text-xs animate-pulse">
                                  Downloading...
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{story.size} MB</span>
                              <span>•</span>
                              <span>Last read: {story.lastRead}</span>
                            </div>
                            {story.status === "downloading" && (
                              <Progress value={story.progress} className="h-1 mt-1" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => window.location.href = `/reader/${story.slug}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Read Offline</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove Download</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <HardDriveDownload className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No stories downloaded yet</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Download stories for offline reading to access them without an internet connection.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center border-t bg-muted/20 py-4">
              <Button variant="outline" disabled={!isOnline} className="w-full sm:w-auto">
                <Bookmark className="mr-2 h-4 w-4" />
                Download More Stories
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}