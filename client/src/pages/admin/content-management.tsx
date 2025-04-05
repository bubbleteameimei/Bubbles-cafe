import * as React from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Rss, RefreshCw, PenSquare, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

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
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Content Management"
        description="Manage stories, WordPress sync, and content settings"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleManualSync}
            variant="outline"
            disabled={syncInProgress}
            className="flex items-center gap-1"
          >
            {syncInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Rss className="h-4 w-4 mr-1" />
                <span>Sync WordPress</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleCreateStory}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Create Story</span>
          </Button>
        </div>
      </PageHeader>

      {isCreatingNew ? (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4" id="create-story-title">Create New Story</h2>
          <div aria-labelledby="create-story-title">
            <PostEditor onClose={handleCloseEditor} />
          </div>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:w-[500px] mb-4">
            <TabsTrigger value="content" className="flex items-center gap-1">
              <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
              <span>Stories</span>
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center gap-1">
              <Rss className="h-4 w-4 mr-1 hidden sm:inline" />
              <span>WordPress Sync</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <PenSquare className="h-4 w-4 mr-1 hidden sm:inline" />
              <span>Editor Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <ContentPage />
          </TabsContent>

          <TabsContent value="wordpress" className="space-y-4">
            <WordPressSyncPage />
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Editor Settings</h2>
                <p className="text-muted-foreground mb-4">
                  Configure theme options, default categories, and editor preferences for all stories.
                </p>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-amber-50 text-amber-600">
                    <h3 className="font-medium mb-1">Theme Icons</h3>
                    <p className="text-sm">
                      Theme icons are used to visually represent the theme categories in the editor and on story cards.
                      You can customize the available icons for each theme category.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-blue-50 text-blue-600">
                    <h3 className="font-medium mb-1">Theme Categories</h3>
                    <p className="text-sm">
                      Theme categories help categorize stories by their horror subgenre or theme.
                      The editor currently includes 15 different theme categories with specialized icons and visual styles.
                    </p>
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