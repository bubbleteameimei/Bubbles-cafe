import { WordPressSyncDashboard } from "@/components/admin/wordpress-sync-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Database, Activity } from "lucide-react";

export default function WordPressSyncPage() {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WordPress Content Sync</h1>
          <p className="text-muted-foreground">
            Manage automated content synchronization from external WordPress sources
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Live Monitoring</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Source</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">WordPress API</div>
            <p className="text-xs text-muted-foreground">
              bubbleteameimei.wordpress.com
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Frequency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Minutes</div>
            <p className="text-xs text-muted-foreground">
              Automatic synchronization interval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Type</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stories</div>
            <p className="text-xs text-muted-foreground">
              Digital storytelling content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* WordPress Sync Dashboard */}
      <WordPressSyncDashboard />

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
          <CardDescription>
            System configuration and implementation details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">API Configuration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Source: WordPress REST API v2</li>
                <li>• Endpoint: /wp-json/wp/v2/posts</li>
                <li>• Authentication: Public read access</li>
                <li>• Rate limiting: Respects API limits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Database Operations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PostgreSQL with connection pooling</li>
                <li>• Upsert operations for content updates</li>
                <li>• Atomic transactions for data integrity</li>
                <li>• Automatic schema migration support</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Content Processing</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• HTML content sanitization and processing</li>
              <li>• Automatic excerpt generation from content</li>
              <li>• Metadata extraction and categorization</li>
              <li>• Reading time calculation based on content length</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}