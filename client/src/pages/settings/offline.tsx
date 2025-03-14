import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  LayoutGrid, 
  HardDrive, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Eye,
  BookMarked,
  CloudOff,
  Bookmark
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Simulated downloaded stories
const downloadedStories = [
  { id: 1, title: "The Haunted Forest", size: 1.2, lastRead: "2 days ago", image: "url-placeholder", status: "complete" },
  { id: 2, title: "Midnight Visitor", size: 0.8, lastRead: "1 week ago", image: "url-placeholder", status: "complete" },
  { id: 3, title: "Whispers in the Dark", size: 1.5, lastRead: "3 days ago", image: "url-placeholder", status: "complete" },
  { id: 4, title: "The Abandoned Mansion", size: 0.6, lastRead: "Just now", image: "url-placeholder", status: "downloading", progress: 75 }
];

export default function OfflineSettingsPage() {
  // State management
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [mediaDownload, setMediaDownload] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState("medium");
  const [maxStorage, setMaxStorage] = useState(5);
  const [currentStorage, setCurrentStorage] = useState(2.1);
  const [activeTab, setActiveTab] = useState("settings");
  const [wifiOnly, setWifiOnly] = useState(true);
  
  // Simulate network status
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    // Real implementation would use navigator.onLine and add event listeners
    const checkNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    checkNetworkStatus();
    
    // In a real implementation, you would also add event listeners for online/offline events
    
    return () => {
      // Cleanup event listeners in real implementation
    };
  }, []);
  
  // Storage calculation logic
  const storagePercentage = (currentStorage / maxStorage) * 100;
  const storageColor = storagePercentage > 90 
    ? "bg-red-500" 
    : storagePercentage > 70 
      ? "bg-amber-500" 
      : "bg-emerald-500";
  
  // Download status management
  const [syncStatus, setSyncStatus] = useState("upToDate"); // "syncing", "upToDate", "error"
  
  // Force a sync/refresh
  const handleSync = () => {
    setSyncStatus("syncing");
    // Simulate a sync operation
    setTimeout(() => {
      setSyncStatus("upToDate");
    }, 2000);
  };
  
  // Clear all cached data
  const handleClearCache = () => {
    // In a real implementation, this would clear the cached data
    setCurrentStorage(0);
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
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Downloads</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Stats</span>
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
                    onCheckedChange={setOfflineMode}
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
                    onValueChange={(values) => setMaxStorage(values[0])}
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
                disabled={currentStorage === 0}
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
                    {currentStorage.toFixed(1)} GB / {maxStorage} GB
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={storagePercentage} 
                    className="h-3"
                    indicatorClassName={storageColor}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {storagePercentage > 90 
                        ? "Critical" 
                        : storagePercentage > 70 
                          ? "Filling up" 
                          : "Good"
                      }
                    </span>
                    <span>{Math.round(storagePercentage)}% used</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col space-y-1 rounded-lg bg-primary/5 p-3 border border-border/30">
                    <span className="text-xs text-muted-foreground">Stories</span>
                    <span className="text-lg font-semibold">1.7 GB</span>
                  </div>
                  <div className="flex flex-col space-y-1 rounded-lg bg-primary/5 p-3 border border-border/30">
                    <span className="text-xs text-muted-foreground">Media</span>
                    <span className="text-lg font-semibold">0.4 GB</span>
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
                  <span className="text-sm text-muted-foreground">4 stories available offline</span>
                  <Badge variant="outline" className="text-xs">
                    {isOnline ? "Manage Downloads" : "Offline Mode"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {downloadedStories.map((story) => (
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
                            <Button size="icon" variant="ghost" className="h-8 w-8">
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
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t bg-muted/20 py-4">
              <Button variant="outline" disabled={!isOnline} className="w-full sm:w-auto">
                <Bookmark className="mr-2 h-4 w-4" />
                Download More Stories
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4 mt-2">
          <Card>
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center space-x-2">
                <LayoutGrid className="h-5 w-5" />
                <span>Offline Reading Statistics</span>
              </CardTitle>
              <CardDescription>Track your offline reading activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/5 border border-border/30">
                  <span className="text-sm text-muted-foreground">Stories Read Offline</span>
                  <span className="text-3xl font-bold">12</span>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                
                <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/5 border border-border/30">
                  <span className="text-sm text-muted-foreground">Reading Time</span>
                  <span className="text-3xl font-bold">3.5h</span>
                  <span className="text-xs text-muted-foreground">In offline mode</span>
                </div>
                
                <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/5 border border-border/30">
                  <span className="text-sm text-muted-foreground">Data Saved</span>
                  <span className="text-3xl font-bold">215<span className="text-xl">MB</span></span>
                  <span className="text-xs text-muted-foreground">By reading offline</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Most Read Offline</h3>
                <div className="space-y-2">
                  {["The Haunted Forest", "Whispers in the Dark", "The Cellar Door"].map((story, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span>{story}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Read {index + 1} times</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5" />
                <span>Offline Availability</span>
              </CardTitle>
              <CardDescription>Your reading capability without internet</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-medium text-emerald-700 dark:text-emerald-400">Ready for Offline</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have enough content downloaded to read for approximately <span className="font-semibold">4.5 hours</span> without an internet connection.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/5 border border-border/30">
                    <span className="text-sm text-muted-foreground">Last Synced</span>
                    <span className="text-lg font-semibold">Today, 10:45 AM</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/5 border border-border/30">
                    <span className="text-sm text-muted-foreground">Next Auto-Sync</span>
                    <span className="text-lg font-semibold">Today, 10:45 PM</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t bg-muted/20 py-4">
              <p className="text-xs text-muted-foreground italic">
                Offline syncing happens automatically every 12 hours when connected to WiFi
              </p>
              <Button variant="link" className="text-xs p-0 h-auto" onClick={() => setActiveTab("settings")}>
                Adjust settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
