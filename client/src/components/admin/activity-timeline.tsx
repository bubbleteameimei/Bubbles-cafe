import React from 'react';
import { Timeline, TimelineProps } from '@/components/ui/timeline';
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { 
  FileText, 
  Flag, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  AlertTriangle,
  Settings,
  Shield,
  FileUp
} from 'lucide-react';

export interface ActivityLog {
  id: number;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

// Map activity types to icons
const getActivityIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('content') || actionLower.includes('post') || actionLower.includes('story')) {
    return <FileText className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('comment')) {
    return <MessageSquare className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('report') || actionLower.includes('flag')) {
    return <Flag className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('approve')) {
    return <CheckCircle className="shrink-0 size-4 mt-1 text-green-500" />;
  } else if (actionLower.includes('reject') || actionLower.includes('delete') || actionLower.includes('remove')) {
    return <XCircle className="shrink-0 size-4 mt-1 text-red-500" />;
  } else if (actionLower.includes('user') || actionLower.includes('account')) {
    return <UserPlus className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('warning') || actionLower.includes('alert')) {
    return <AlertTriangle className="shrink-0 size-4 mt-1 text-amber-500" />;
  } else if (actionLower.includes('setting')) {
    return <Settings className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('permission') || actionLower.includes('role')) {
    return <Shield className="shrink-0 size-4 mt-1" />;
  } else if (actionLower.includes('upload')) {
    return <FileUp className="shrink-0 size-4 mt-1" />;
  }
  
  // Default icon
  return <FileText className="shrink-0 size-4 mt-1" />;
};

// Format date for display in timeline headers
const formatDateHeader = (dateString: string) => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'd MMM, yyyy');
  }
};

interface ActivityTimelineProps {
  activities: ActivityLog[];
  className?: string;
  initialCollapsed?: boolean;
}

export const ActivityTimeline = ({ 
  activities, 
  className,
  initialCollapsed = true
}: ActivityTimelineProps) => {
  // Group activities by date
  const groupedActivities = activities.reduce((acc: Record<string, ActivityLog[]>, activity) => {
    // Format the date as YYYY-MM-DD to use as a key
    const date = activity.timestamp.split('T')[0];
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(activity);
    return acc;
  }, {});
  
  // Convert grouped activities to timeline format
  const timelineGroups: TimelineProps['groups'] = Object.entries(groupedActivities)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()) // Sort by date descending
    .map(([date, activitiesForDate]) => ({
      date: formatDateHeader(date),
      items: activitiesForDate.map((activity) => ({
        id: activity.id,
        title: (
          <>
            {getActivityIcon(activity.action)}
            {activity.action}
          </>
        ),
        description: activity.details,
        user: activity.performedBy ? {
          name: activity.performedBy,
          // We could add avatar here if available
        } : undefined,
        date: formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })
      }))
    }));
  
  return (
    <Timeline 
      groups={timelineGroups} 
      className={className}
      initialCollapsed={initialCollapsed}
      showOlderText="Show older activities"
    />
  );
};