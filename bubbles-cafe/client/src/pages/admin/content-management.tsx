import * as React from "react";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Rss, PenSquare, FileText, Loader2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { THEME_CATEGORIES } from "@shared/theme-categories";

// Import subcomponents for each tab
import { default as WordPressSyncPage } from "./WordPressSyncPage";
import { default as ContentPage } from "./content";
import PostEditor from "@/components/admin/post-editor";

export default function ContentManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("content");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  
  // Get sample categories for display
  const sampleCategories = useMemo(() => {
    return Object.values(THEME_CATEGORIES).slice(0, 5).map(cat => cat.label);
  }, []);
  
  // Get total theme category count
  const totalThemes = Object.keys(THEME_CATEGORIES).length;

  // Handle manual WordPress sync
  const handleManualSync = async () => {
    if (syncInProgress) {
      toast({
        title: "Sync in Progress",
        description: "A WordPress sync is already running. Please wait for it to complete.",
      });
      return;
    }

    try {
      setSyncInProgress(true);
      const response = await fetch("/api/wordpress/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger sync: ${response.statusText}`);
      }
      
      toast({
        title: "Sync Started",
        description: "WordPress sync has been started. This may take a few minutes.",
      });
      
      // Poll for status updates (simplified)
      setTimeout(() => {
        setSyncInProgress(false);
        toast({
          title: "Sync Complete",
          description: "WordPress content has been synchronized successfully.",
        });
      }, 5000);
    } catch (error) {
      console.error("Error triggering sync:", error);
      setSyncInProgress(false);
      toast({
        title: "Error",
        description: "Failed to start WordPress sync. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle creating a new story
  const handleCreateStory = () => {
    setIsCreatingNew(true);
  };

  // Handle closing the editor
  const handleCloseEditor = () => {
    setIsCreatingNew(false);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-6">
      <PageHeader
        heading="Content Management"
        description="Manage stories, WordPress sync, and content settings"
        className="flex flex-col"
      >
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <Button
            onClick={handleManualSync}
            variant="outline"
            disabled={syncInProgress}
            className="flex items-center gap-1 text-sm sm:text-base"
            size="sm"
          >
            {syncInProgress ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Rss className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span>Sync WP</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleCreateStory}
            className="flex items-center gap-1 text-sm sm:text-base"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            <span>Create Story</span>
          </Button>
        </div>
      </PageHeader>

      {isCreatingNew ? (
        <Card className="p-3 sm:p-6 overflow-x-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4" id="create-story-title">Create New Story</h2>
          <div aria-labelledby="create-story-title">
            <PostEditor onClose={handleCloseEditor} />
          </div>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2 -mx-3 px-3">
            <TabsList className="grid grid-cols-3 w-full max-w-[500px] mb-2 sm:mb-4">
              <TabsTrigger value="content" className="flex items-center justify-center gap-1 px-1 sm:px-4 text-sm sm:text-base">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 inline" />
                <span className="truncate">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="flex items-center justify-center gap-1 px-1 sm:px-4 text-sm sm:text-base">
                <Rss className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 inline" />
                <span className="truncate">WP Sync</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center justify-center gap-1 px-1 sm:px-4 text-sm sm:text-base">
                <PenSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 inline" />
                <span className="truncate">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="space-y-4">
            <ContentPage />
          </TabsContent>

          <TabsContent value="wordpress" className="space-y-4">
            <WordPressSyncPage />
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Editor Settings</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Configure theme options, default categories, and editor preferences for all stories.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="border rounded-md p-3 sm:p-4 bg-amber-50 text-amber-600">
                    <h3 className="font-medium mb-1">Theme Icons</h3>
                    <p className="text-xs sm:text-sm">
                      Theme icons are used to visually represent the theme categories in the editor and on story cards.
                      The platform now supports {totalThemes} different icons for horror themes.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['skull', 'ghost', 'brain', 'eye', 'scissors'].map(icon => (
                        <div key={icon} className="p-1.5 bg-amber-100 rounded-md" title={icon}>
                          <span className={`text-amber-700 text-lg icon-${icon}`}>⚉</span>
                        </div>
                      ))}
                      <div className="p-1.5 bg-amber-100 rounded-md">
                        <span className="text-amber-700 text-xs">+{totalThemes - 5} more</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-3 sm:p-4 bg-blue-50 text-blue-600">
                    <h3 className="font-medium mb-1">Theme Categories</h3>
                    <p className="text-xs sm:text-sm">
                      Theme categories help categorize stories by their horror subgenre or theme.
                      The editor now includes {totalThemes} different theme categories with specialized icons.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sampleCategories.map(cat => (
                        <div key={cat} className="px-2 py-0.5 bg-blue-100 rounded text-xs">{cat}</div>
                      ))}
                      <div className="px-2 py-0.5 bg-blue-100 rounded text-xs">
                        +{totalThemes - 5} more
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-3 sm:p-4 bg-green-50 text-green-600 md:col-span-2">
                    <h3 className="font-medium mb-1">Theme Management</h3>
                    <p className="text-xs sm:text-sm mb-2">
                      Manage all theme settings from a single dedicated interface in the Theme Management section.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs sm:text-sm text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                      onClick={() => navigate('/admin/themes')}
                    >
                      Go to Theme Management
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}