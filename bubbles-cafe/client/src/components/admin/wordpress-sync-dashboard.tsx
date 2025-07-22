import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Globe, 
  Settings,
  Play,
  Pause,
  AlertCircle,
  Download,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SyncStatus {
  isRunning: boolean;
  lastSync: string;
  nextSync: string;
  postsCount: number;
  errors: string[];
  totalProcessed: number;
  syncInterval: number;
  enabled: boolean;
}

interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  message: string;
  postsProcessed: number;
  duration: number;
}

export function WordPressSyncDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery<SyncStatus>({
    queryKey: ['/api/admin/wordpress/status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/wordpress/status');
      if (!res.ok) throw new Error('Failed to fetch sync status');
      return res.json();
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: logsLoading } = useQuery<SyncLog[]>({
    queryKey: ['/api/admin/wordpress/logs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/wordpress/logs');
      if (!res.ok) throw new Error('Failed to fetch sync logs');
      return res.json();
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Manual sync trigger
  const triggerSyncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/wordpress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to trigger sync');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sync Triggered",
        description: "WordPress content sync has been started",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wordpress/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wordpress/logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to trigger WordPress sync",
        variant: "destructive",
      });
    },
  });

  // Toggle sync enabled/disabled
  const toggleSyncMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch('/api/admin/wordpress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error('Failed to toggle sync');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.enabled ? "Sync Enabled" : "Sync Disabled",
        description: `WordPress sync has been ${data.enabled ? 'enabled' : 'disabled'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wordpress/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Toggle Failed",
        description: error.message || "Failed to toggle WordPress sync",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Content Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                WordPress Content Sync
              </CardTitle>
              <CardDescription>
                Automatic content synchronization from bubbleteameimei.wordpress.com
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto refresh</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sync Controls */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {syncStatus?.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Sync Status: {syncStatus?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {syncStatus?.isRunning && (
                <Badge variant="secondary" className="animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Running
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSyncMutation.mutate(!syncStatus?.enabled)}
                disabled={toggleSyncMutation.isPending}
              >
                {syncStatus?.enabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
              <Button
                onClick={() => triggerSyncMutation.mutate()}
                disabled={triggerSyncMutation.isPending || syncStatus?.isRunning}
                size="sm"
              >
                {triggerSyncMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {syncStatus?.isRunning ? 'Sync Running' : 'Sync Now'}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{syncStatus?.postsCount || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium">
                  {syncStatus?.lastSync ? formatDate(syncStatus.lastSync) : 'Never'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">{syncStatus?.totalProcessed || 0}</p>
              </div>
            </div>
          </div>

          {/* Next Sync Info */}
          {syncStatus?.enabled && syncStatus?.nextSync && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Next Sync</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled for {formatDate(syncStatus.nextSync)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sync interval: {Math.round((syncStatus.syncInterval || 300000) / 60000)} minutes
              </p>
            </div>
          )}

          {/* Errors */}
          {syncStatus?.errors && syncStatus.errors.length > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">Recent Errors</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {syncStatus.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync History
          </CardTitle>
          <CardDescription>
            Recent WordPress sync activity and logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : !syncLogs || syncLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sync logs available
              </div>
            ) : (
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.message}</span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Posts: {log.postsProcessed}</span>
                        <span>Duration: {formatDuration(log.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}