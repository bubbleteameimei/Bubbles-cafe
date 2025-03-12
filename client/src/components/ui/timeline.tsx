import React from 'react';
import { FileText, User } from 'lucide-react';

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
  };
  isLastItem?: boolean;
}

export interface TimelineGroup {
  date: string;
  items: TimelineItem[];
}

export interface TimelineProps {
  groups: TimelineGroup[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ groups, className = '' }) => {
  return (
    <div className={`timeline ${className}`}>
      {groups.map((group, groupIndex) => (
        <React.Fragment key={`group-${groupIndex}`}>
          {/* Heading */}
          <div className="ps-2 my-2 first:mt-0">
            <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400">
              {group.date}
            </h3>
          </div>
          {/* End Heading */}

          {/* Timeline Items */}
          {group.items.map((item, itemIndex) => (
            <div key={item.id || `item-${groupIndex}-${itemIndex}`} className="flex gap-x-3">
              {/* Icon */}
              <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
                <div className="relative z-10 size-7 flex justify-center items-center">
                  <div className="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"></div>
                </div>
              </div>
              {/* End Icon */}

              {/* Right Content */}
              <div className={`grow pt-0.5 ${item.isLastItem ? 'pb-0' : 'pb-8'}`}>
                <h3 className="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white">
                  {item.icon || (
                    <FileText className="shrink-0 size-4 mt-1" />
                  )}
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                )}
                {item.user && (
                  <button 
                    type="button"
                    className="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    {item.user.avatar ? (
                      <img 
                        className="shrink-0 size-4 rounded-full" 
                        src={item.user.avatar} 
                        alt={`${item.user.name}'s avatar`}
                      />
                    ) : (
                      <span className="flex shrink-0 justify-center items-center size-4 bg-white border border-gray-200 text-[10px] font-semibold uppercase text-gray-600 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                        {item.user.name.charAt(0)}
                      </span>
                    )}
                    {item.user.name}
                  </button>
                )}
              </div>
              {/* End Right Content */}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

// A simpler version for activity logs
export interface ActivityItem {
  id: string;
  timestamp: string;
  action: string;
  user?: string;
  details?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, className = '' }) => {
  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    acc[dateStr].push({
      id: activity.id,
      title: activity.action,
      description: activity.details,
      user: activity.user ? { name: activity.user } : undefined,
      date: date.toISOString()
    });
    
    return acc;
  }, {} as Record<string, TimelineItem[]>);
  
  // Convert to TimelineGroup array
  const timelineGroups: TimelineGroup[] = Object.keys(groupedActivities).map(date => ({
    date,
    items: groupedActivities[date]
  }));
  
  return <Timeline groups={timelineGroups} className={className} />;
};

export default Timeline;