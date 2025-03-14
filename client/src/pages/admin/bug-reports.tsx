import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertCircle, 
  Bug, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ChevronDown,
  Link2,
  Smartphone,
  Monitor,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Types for our bug report data
interface BugReport {
  id: number;
  affectedPage: string;
  description: string;
  screenshot?: string;
  email?: string;
  status: string;
  createdAt: string;
  metadata: {
    browser?: string;
    operatingSystem?: string;
    screenResolution?: string;
    deviceType?: string;
    userAgent?: string;
  };
}

// Status badge component to visualize status
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'new':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 whitespace-nowrap">
          <Clock className="mr-1 h-3 w-3" /> New
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 whitespace-nowrap">
          <Clock className="mr-1 h-3 w-3" /> In Progress
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 whitespace-nowrap">
          <CheckCircle className="mr-1 h-3 w-3" /> Resolved
        </Badge>
      );
    case 'wont-fix':
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 whitespace-nowrap">
          <XCircle className="mr-1 h-3 w-3" /> Won't Fix
        </Badge>
      );
    case 'duplicate':
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 whitespace-nowrap">
          <FileText className="mr-1 h-3 w-3" /> Duplicate
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          <AlertCircle className="mr-1 h-3 w-3" /> Unknown
        </Badge>
      );
  }
}

// Bug Report timeline item component
function BugReportItem({ report, onStatusChange }: { 
  report: BugReport; 
  onStatusChange: (id: number, status: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [status, setStatus] = useState(report.status);
  const { toast } = useToast();
  
  // Format date for display
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(report.createdAt), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  }, [report.createdAt]);
  
  // Format time for display
  const formattedTime = useMemo(() => {
    try {
      return format(new Date(report.createdAt), 'h:mm a');
    } catch (error) {
      return '';
    }
  }, [report.createdAt]);
  
  // Get icon based on device type
  const getDeviceIcon = () => {
    if (report.metadata.deviceType === 'mobile') {
      return <Smartphone className="h-4 w-4" />;
    } else if (report.metadata.deviceType === 'tablet') {
      return <Smartphone className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };
  
  // Truncate content for preview
  const truncatedDescription = useMemo(() => {
    if (report.description.length > 120) {
      return `${report.description.substring(0, 120)}...`;
    }
    return report.description;
  }, [report.description]);
  
  // Status change handler
  const handleStatusChange = (newStatus: string) => {
    console.log('[Admin:BugReports] Status update attempt', {
      reportId: report.id,
      newStatus: newStatus,
      previousStatus: status,
      timestamp: new Date().toISOString()
    });
    
    setStatus(newStatus);
    onStatusChange(report.id, newStatus);
  };

  return (
    <div className="flex gap-x-3">
      {/* Icon column */}
      <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
        <div className="relative z-10 size-7 flex justify-center items-center">
          <div className={`size-5 rounded-full flex items-center justify-center ${
            status === 'resolved' 
              ? 'bg-green-100 text-green-600' 
              : status === 'wont-fix' 
                ? 'bg-gray-100 text-gray-600' 
                : status === 'in-progress' 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-blue-100 text-blue-600'
          }`}>
            <Bug className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {/* Content column */}
      <div className="grow pt-0.5 pb-8">
        <div className="bg-card border rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
          {/* Header */}
          <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex justify-between items-start flex-wrap gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-gray-800 dark:text-white text-base">
                  Bug #{report.id}
                </h3>
                <StatusBadge status={status} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <ChevronDown className={`h-4 w-4 ${isExpanded ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                <span className="sr-only">Toggle details</span>
              </Button>
            </div>
            
            {/* Preview content */}
            <div className="mb-2">
              <p className="text-sm text-gray-600 dark:text-neutral-400 whitespace-pre-line">
                {isExpanded ? report.description : truncatedDescription}
              </p>
            </div>
            
            {/* Meta info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                <span>{formattedDate}</span>
                <span className="ml-1 opacity-70">{formattedTime}</span>
              </div>
              <div className="flex items-center">
                <Link2 className="mr-1 h-3 w-3" />
                <span>{report.affectedPage}</span>
              </div>
              {report.metadata.deviceType && (
                <div className="flex items-center">
                  {getDeviceIcon()}
                  <span className="ml-1">{report.metadata.deviceType}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Expanded details */}
          {isExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-border mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical details */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Technical Details</h4>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    {report.metadata?.browser && (
                      <p><span className="font-medium">Browser:</span> {report.metadata.browser}</p>
                    )}
                    {report.metadata?.operatingSystem && (
                      <p><span className="font-medium">OS:</span> {report.metadata.operatingSystem}</p>
                    )}
                    {report.metadata?.screenResolution && (
                      <p><span className="font-medium">Resolution:</span> {report.metadata.screenResolution}</p>
                    )}
                  </div>
                </div>
                
                {/* Contact info - only display if available */}
                {report.email && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        <a href={`mailto:${report.email}`} className="text-primary hover:underline">
                          {report.email}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Screenshot preview */}
              {report.screenshot && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Screenshot</h4>
                  <div 
                    className="relative w-full h-40 bg-muted/50 rounded overflow-hidden cursor-pointer" 
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${report.screenshot})` }}></div>
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                  
                  <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Screenshot</DialogTitle>
                        <DialogDescription>
                          Screenshot submitted with bug report #{report.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="w-full overflow-auto max-h-[70vh]">
                        <img 
                          src={report.screenshot} 
                          alt={`Screenshot for bug report #${report.id}`} 
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button>Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {/* Status management */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-medium">Status</h4>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="wont-fix">Won't Fix</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Group bug reports by date for timeline display
function groupReportsByDate(reports: BugReport[]): Record<string, BugReport[]> {
  const grouped: Record<string, BugReport[]> = {};
  
  reports.forEach(item => {
    try {
      const date = format(new Date(item.createdAt), 'MMM d, yyyy');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    } catch (error) {
      // Handle invalid dates
      const fallback = 'Undated';
      if (!grouped[fallback]) {
        grouped[fallback] = [];
      }
      grouped[fallback].push(item);
    }
  });
  
  return grouped;
}

// Mock data to simulate bug reports (would be fetched from API in production)
const MOCK_BUG_REPORTS: BugReport[] = [
  {
    id: 1,
    affectedPage: '/reader',
    description: "The audio player doesn't stop when navigating away from the page, which causes multiple audio tracks to play simultaneously if I go back.",
    status: 'new',
    createdAt: '2025-03-13T15:30:00Z',
    metadata: {
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      screenResolution: '1920x1080',
      deviceType: 'desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 2,
    affectedPage: '/stories',
    description: "Infinite scroll doesn't work properly on mobile. The page stops loading new stories after about 3-4 scrolls.",
    status: 'in-progress',
    email: 'user@example.com',
    createdAt: '2025-03-12T10:15:00Z',
    metadata: {
      browser: 'Safari',
      operatingSystem: 'iOS 17',
      screenResolution: '390x844',
      deviceType: 'mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    }
  },
  {
    id: 3,
    affectedPage: '/settings',
    description: "Theme settings not saving. When I switch from dark to light mode and refresh the page, it reverts back to dark mode.",
    status: 'resolved',
    createdAt: '2025-03-11T09:45:00Z',
    metadata: {
      browser: 'Firefox 124',
      operatingSystem: 'macOS',
      screenResolution: '2560x1600',
      deviceType: 'desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0)'
    }
  },
  {
    id: 4,
    affectedPage: '/login',
    description: "Login form doesn't validate email address properly. I can enter 'test' instead of a proper email and the form submits.",
    status: 'duplicate',
    email: 'tester@example.com',
    createdAt: '2025-03-11T14:22:00Z',
    metadata: {
      browser: 'Edge',
      operatingSystem: 'Windows 10',
      screenResolution: '1366x768',
      deviceType: 'desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 5,
    affectedPage: '/reader/horror-in-the-dark',
    description: "Images not loading on the story page. All I see are blank squares where images should be.",
    screenshot: 'https://placehold.co/800x600/e63946/FFFFFF.png?text=Image+Error+Screenshot',
    status: 'new',
    email: 'reader@example.com',
    createdAt: '2025-03-10T16:50:00Z',
    metadata: {
      browser: 'Chrome',
      operatingSystem: 'Android 14',
      screenResolution: '412x915',
      deviceType: 'mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 6)'
    }
  }
];

export default function BugReportsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const [reportStats, setReportStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    wontFix: 0,
    duplicate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update stats when data changes
  useEffect(() => {
    const stats = {
      total: MOCK_BUG_REPORTS.length,
      new: 0,
      inProgress: 0,
      resolved: 0,
      wontFix: 0,
      duplicate: 0
    };
    
    MOCK_BUG_REPORTS.forEach((item) => {
      if (item.status === 'new') stats.new++;
      else if (item.status === 'in-progress') stats.inProgress++;
      else if (item.status === 'resolved') stats.resolved++;
      else if (item.status === 'wont-fix') stats.wontFix++;
      else if (item.status === 'duplicate') stats.duplicate++;
    });
    
    setReportStats(stats);
  }, []);

  // Track tab changes for debugging
  const handleTabChange = (newTab: string) => {
    console.log('[Admin:BugReports] Tab changed', { 
      from: activeTab, 
      to: newTab
    });
    setActiveTab(newTab);
  };
  
  // Status update handler (would make API call in production)
  const handleStatusChange = (id: number, newStatus: string) => {
    console.log(`Changing bug report #${id} status to ${newStatus}`);
    
    // Simulate successful update
    toast({
      title: 'Status Updated',
      description: `Bug report #${id} status changed to ${newStatus}`,
    });
  };
  
  // Filter reports based on the active tab
  const filteredReports = useMemo(() => {
    const reports = [...MOCK_BUG_REPORTS]; // Clone to avoid modifying original
    
    const filtered = reports.filter((item) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'in-progress') return item.status === 'in-progress';
      return item.status === activeTab;
    });
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return filtered;
  }, [activeTab]);
  
  // Group reports by date for timeline display
  const groupedReports = useMemo(() => {
    return groupReportsByDate(filteredReports);
  }, [filteredReports]);

  // Loading skeleton for timeline
  const TimelineSkeleton = () => (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-x-3">
          <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
            <div className="relative z-10 size-7 flex justify-center items-center">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
          <div className="grow pt-0.5 pb-8 w-full">
            <Skeleton className="h-[160px] w-full rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-10 w-64 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-12 w-full mb-6 rounded-lg" />
        
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Bug Report Management</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <h3 className="text-2xl font-bold">{reportStats.total}</h3>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bug className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-card ${activeTab === 'new' ? 'border-blue-400' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New</p>
                <h3 className="text-2xl font-bold">{reportStats.new}</h3>
              </div>
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="size-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-card ${activeTab === 'in-progress' ? 'border-yellow-400' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold">{reportStats.inProgress}</h3>
              </div>
              <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="size-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-card ${activeTab === 'resolved' ? 'border-green-400' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <h3 className="text-2xl font-bold">{reportStats.resolved}</h3>
              </div>
              <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="size-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-card ${activeTab === 'wont-fix' || activeTab === 'duplicate' ? 'border-red-400' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closed</p>
                <h3 className="text-2xl font-bold">{reportStats.wontFix + reportStats.duplicate}</h3>
              </div>
              <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="size-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="all">
            All
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.total}
            </span>
          </TabsTrigger>
          <TabsTrigger value="new">
            New
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.new}
            </span>
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.inProgress}
            </span>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.resolved}
            </span>
          </TabsTrigger>
          <TabsTrigger value="wont-fix">
            Won't Fix
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.wontFix}
            </span>
          </TabsTrigger>
          <TabsTrigger value="duplicate">
            Duplicate
            <span className="ml-1.5 size-5 inline-flex items-center justify-center rounded-full bg-muted text-xs">
              {reportStats.duplicate}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
              <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} bug reports found</p>
            </div>
          ) : (
            <div>
              {/* Timeline view */}
              {Object.entries(groupedReports).map(([date, items]) => (
                <div key={date}>
                  {/* Date heading */}
                  <div className="ps-2 my-4 first:mt-0">
                    <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400 flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      {date}
                    </h3>
                  </div>
                  
                  {/* Bug report items for this date */}
                  {items.map(item => (
                    <BugReportItem 
                      key={item.id} 
                      report={item} 
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}