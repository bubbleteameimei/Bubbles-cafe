import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, FileBadge, FileJson, FileText, Printer, Loader } from "lucide-react";
import { ExportFormat } from "../../types/privacy-settings";
// Import PrivacySettings directly from hooks file to ensure type consistency
import { PrivacySettings } from "../../hooks/use-privacy-settings";
import { UserDataExport, exportAsJson, exportAsCsv, exportAsText, printUserData } from "../../utils/export-utils";
import { useAuth } from "../../hooks/use-auth";
import { usePrivacySettings } from "../../hooks/use-privacy-settings";
import { useToast } from "../../hooks/use-toast";
import { getDefaultPrivacySettings } from "@/utils/privacy-settings-utils";

/**
 * Data Export page component
 * Allows users to export their data in different formats with customization options
 */
export default function DataExportPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { settings: privacySettings, isLoading: privacyLoading } = usePrivacySettings();
  
  // Export options state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedData, setSelectedData] = useState({
    profile: true,
    privacySettings: true,
    readingHistory: false,
    comments: false,
    bookmarks: false,
    activities: false
  });

  // Fetch user's reading history for export (if selected)
  const { data: readingHistory, isLoading: readingHistoryLoading } = useQuery({
    queryKey: ['/api/user/reading-history'],
    queryFn: async () => {
      try {
        if (!selectedData.readingHistory) return [];
        
        const response = await fetch('/api/user/reading-history', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reading history');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching reading history:', error);
        return [];
      }
    },
    enabled: isAuthenticated && selectedData.readingHistory,
  });
  
  // Fetch user's comments for export (if selected)
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/user/comments'],
    queryFn: async () => {
      try {
        if (!selectedData.comments) return [];
        
        const response = await fetch('/api/user/comments', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    },
    enabled: isAuthenticated && selectedData.comments,
  });
  
  // Fetch user's bookmarks for export (if selected)
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['/api/bookmarks'],
    queryFn: async () => {
      try {
        if (!selectedData.bookmarks) return [];
        
        const response = await fetch('/api/bookmarks', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
      }
    },
    enabled: isAuthenticated && selectedData.bookmarks,
  });
  
  // Fetch user's activity data for export (if selected)
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/user/activity'],
    queryFn: async () => {
      try {
        if (!selectedData.activities) return [];
        
        const response = await fetch('/api/user/activity', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching activity data:', error);
        return [];
      }
    },
    enabled: isAuthenticated && selectedData.activities,
  });
  
  // Loading state based on data selection
  const isLoadingData = 
    (selectedData.readingHistory && readingHistoryLoading) ||
    (selectedData.comments && commentsLoading) ||
    (selectedData.bookmarks && bookmarksLoading) ||
    (selectedData.activities && activitiesLoading) ||
    privacyLoading || 
    !isAuthReady;
  
  /**
   * Handle the export action based on selected format
   */
  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to export your data",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Build export data object based on user selections
      const exportData: UserDataExport = {
        profile: selectedData.profile ? {
          id: user.id,
          username: user.username,
          email: user.email,
          // Safely access properties that might not exist
          ...(user.fullName && { fullName: user.fullName }),
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        } : {},
        privacySettings: selectedData.privacySettings 
          ? (privacySettings || getDefaultPrivacySettings()) 
          : getDefaultPrivacySettings(),
        readingHistory: selectedData.readingHistory ? readingHistory || [] : undefined,
        comments: selectedData.comments ? comments || [] : undefined,
        bookmarks: selectedData.bookmarks ? bookmarks || [] : undefined,
        activities: selectedData.activities ? activities || [] : undefined,
      };
      
      // Perform export based on selected format
      switch (selectedFormat) {
        case 'json':
          exportAsJson(exportData);
          break;
        case 'csv':
          exportAsCsv(exportData);
          break;
        case 'text':
          exportAsText(exportData);
          break;
        case 'print':
          printUserData(exportData);
          break;
      }
      
      toast({
        title: "Export successful",
        description: selectedFormat === 'print' 
          ? "Your data has been prepared for printing" 
          : "Your data has been exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  /**
   * Handle data selection change
   */
  const handleDataSelectionChange = (key: string, checked: boolean) => {
    setSelectedData(prev => ({
      ...prev,
      [key]: checked
    }));
  };
  
  /**
   * Render loading skeleton
   */
  if (!isAuthReady) {
    return (
      <div className="container py-10">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  /**
   * Render unauthenticated state
   */
  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access data export features.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Export your personal data for backup or portability purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in to access your data export options.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      {/* Title and SEO would usually be set with Helmet, but we're handling it without the dependency */}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export Your Data</h1>
        <p className="text-muted-foreground">
          Download a copy of your personal data in various formats for backup or portability purposes.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-6">
        {/* Left column - Data selection */}
        <div className="md:col-span-2">
          <Card className="h-full border-2 border-muted hover:border-primary/20 transition-colors">
            <CardHeader className="bg-muted/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Data</CardTitle>
                  <CardDescription>
                    Choose what information to include in your export
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-5">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="profile"
                    className="mt-1"
                    checked={selectedData.profile}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('profile', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="profile" className="font-medium">Profile Information</Label>
                    <p className="text-sm text-muted-foreground">Your username, display name, and account details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacySettings"
                    className="mt-1"
                    checked={selectedData.privacySettings}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('privacySettings', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="privacySettings" className="font-medium">Privacy Settings</Label>
                    <p className="text-sm text-muted-foreground">Your privacy and security preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="readingHistory"
                    className="mt-1"
                    checked={selectedData.readingHistory}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('readingHistory', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="readingHistory" className="font-medium">Reading History</Label>
                    <p className="text-sm text-muted-foreground">Stories you've read and your progress</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="comments"
                    className="mt-1"
                    checked={selectedData.comments}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('comments', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="comments" className="font-medium">Comments</Label>
                    <p className="text-sm text-muted-foreground">Comments you've posted on stories</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="bookmarks"
                    className="mt-1"
                    checked={selectedData.bookmarks}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('bookmarks', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="bookmarks" className="font-medium">Bookmarks</Label>
                    <p className="text-sm text-muted-foreground">Stories you've saved for later</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="activities"
                    className="mt-1"
                    checked={selectedData.activities}
                    onCheckedChange={(checked) => 
                      handleDataSelectionChange('activities', checked === true)
                    }
                  />
                  <div>
                    <Label htmlFor="activities" className="font-medium">Activity History</Label>
                    <p className="text-sm text-muted-foreground">Your recent activity and interactions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Export options */}
        <div className="md:col-span-4">
          <Card className="border-2 border-muted">
            <CardHeader className="bg-muted/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <FileJson className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Choose your export format and customize options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="json" onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
                <TabsList className="w-full grid grid-cols-4 mb-6">
                  <TabsTrigger value="json" className="flex items-center">
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="csv" className="flex items-center">
                    <FileBadge className="w-4 h-4 mr-2" />
                    CSV
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="print" className="flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="json" className="mt-2">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FileJson className="h-5 w-5 text-blue-500" />
                      JSON Format
                    </h3>
                    <p className="text-sm mb-2">
                      Export as a JSON file, which preserves the complete structure of your data.
                      Ideal for data backup or importing into other applications.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">.json</span> format
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="csv" className="mt-2">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FileBadge className="h-5 w-5 text-green-500" />
                      CSV Format
                    </h3>
                    <p className="text-sm mb-2">
                      Export as a CSV (Comma Separated Values) file that can be opened in spreadsheet
                      applications like Excel or Google Sheets. Simple format for viewing tabular data.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">.csv</span> format
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-2">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      Text Format
                    </h3>
                    <p className="text-sm mb-2">
                      Export as a plain text file that can be opened with any text editor.
                      Provides a human-readable format with clearly organized sections.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">.txt</span> format
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="print" className="mt-2">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <Printer className="h-5 w-5 text-purple-500" />
                      Print Format
                    </h3>
                    <p className="text-sm mb-2">
                      Generate a neatly formatted document optimized for printing.
                      Opens in a new window that you can print or save as PDF using your browser.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">.pdf</span> format (when saved)
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t bg-muted/5 px-6 py-6">
              <Alert variant="default" className="mb-2 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Privacy Notice</AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  Your data export may contain sensitive personal information.
                  Keep it secure and be careful when sharing exported files.
                </AlertDescription>
              </Alert>
              
              <Button
                className="w-full"
                size="lg"
                variant="default"
                onClick={handleExport}
                disabled={isExporting || isLoadingData || (!selectedData.profile && !selectedData.privacySettings && !selectedData.readingHistory && !selectedData.comments && !selectedData.bookmarks && !selectedData.activities)}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : `Export as ${selectedFormat.toUpperCase()}`}
              </Button>
              
              {/* Show loading state if any data is still loading */}
              {isLoadingData && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Loading your data...
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}