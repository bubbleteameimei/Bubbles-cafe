import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface TimelineItemProps {
  id: string | number;
  date?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  isLast?: boolean;
}

export interface TimelineGroupProps {
  date: string;
  items: TimelineItemProps[];
}

export interface TimelineProps {
  groups: TimelineGroupProps[];
  className?: string;
  showOlderText?: string;
  initialCollapsed?: boolean;
}

const TimelineItem = ({
  title,
  description,
  icon,
  user,
  isLast = false
}: TimelineItemProps) => {
  return (
    <div className="flex gap-x-3">
      {/* Icon */}
      <div className={cn(
        "relative after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700",
        isLast && "after:hidden"
      )}>
        <div className="relative z-10 size-7 flex justify-center items-center">
          {icon || <div className="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"></div>}
        </div>
      </div>
      {/* End Icon */}

      {/* Right Content */}
      <div className="grow pt-0.5 pb-8">
        <h3 className="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            {description}
          </p>
        )}
        {user && (
          <Button 
            variant="ghost" 
            size="sm"
            className="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            {user.avatar ? (
              <Avatar className="shrink-0 size-4 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-[10px]">{user.initials || user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex shrink-0 justify-center items-center size-4 bg-white border border-gray-200 text-[10px] font-semibold uppercase text-gray-600 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                {user.initials || user.name.charAt(0)}
              </span>
            )}
            {user.name}
          </Button>
        )}
      </div>
      {/* End Right Content */}
    </div>
  );
};

export const TimelineHeader = ({ 
  date, 
  className 
}: { 
  date: string, 
  className?: string 
}) => {
  return (
    <div className={cn("ps-2 my-2 first:mt-0", className)}>
      <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400">
        {date}
      </h3>
    </div>
  );
};

export const Timeline = ({ 
  groups, 
  className,
  showOlderText = "Show older",
  initialCollapsed = true
}: TimelineProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [showAll, setShowAll] = useState(!initialCollapsed);
  
  // Show the first two groups by default, unless showAll is true
  const visibleGroups = showAll ? groups : groups.slice(0, 2);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setShowAll(!showAll);
  };

  return (
    <div className={cn("", className)}>
      {visibleGroups.map((group, groupIndex) => (
        <React.Fragment key={group.date}>
          <TimelineHeader date={group.date} />
          
          {group.items.map((item, itemIndex) => (
            <TimelineItem 
              key={item.id} 
              {...item} 
              isLast={itemIndex === group.items.length - 1 && groupIndex === visibleGroups.length - 1}
            />
          ))}
        </React.Fragment>
      ))}

      {groups.length > 2 && (
        <div className="ps-2 -ms-px flex gap-x-3">
          <Button 
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="text-start inline-flex items-center gap-x-1 text-sm text-blue-600 font-medium decoration-2 hover:underline dark:text-blue-500"
          >
            {collapsed ? (
              <>
                <ChevronDown className="shrink-0 size-3.5" />
                {showOlderText}
              </>
            ) : (
              <>
                <ChevronUp className="shrink-0 size-3.5" />
                Show less
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Example Usage:
/*
const timelineData = [
  {
    date: "1 Aug, 2023",
    items: [
      {
        id: 1,
        title: (
          <>
            <FileText className="shrink-0 size-4 mt-1" />
            Created "Preline in React" task
          </>
        ),
        description: "Find more detailed instructions here.",
        user: {
          name: "James Collins",
          avatar: "https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80"
        }
      },
      {
        id: 2,
        title: "Release v5.2.0 quick bug fix 🐞",
        user: {
          name: "Alex Gregarov",
          initials: "AG"
        }
      }
    ]
  },
  {
    date: "31 Jul, 2023",
    items: [
      {
        id: 3,
        title: "Take a break ⛳️",
        description: "Just chill for now... 😉"
      }
    ]
  }
];

<Timeline groups={timelineData} />
*/