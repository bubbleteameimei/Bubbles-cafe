"use client"

import React from 'react';
import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export type FeedbackCategory = 'suggestion' | 'bug' | 'praise' | 'complaint' | 'all';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected' | 'all';

interface FeedbackFilterProps {
  selectedCategories: FeedbackCategory[];
  selectedStatuses: FeedbackStatus[];
  setSelectedCategories: (categories: FeedbackCategory[]) => void;
  setSelectedStatuses: (statuses: FeedbackStatus[]) => void;
  totalCount: number;
  filteredCount: number;
}

export function FeedbackCategoryFilter({
  selectedCategories,
  selectedStatuses,
  setSelectedCategories,
  setSelectedStatuses,
  totalCount,
  filteredCount
}: FeedbackFilterProps) {
  
  const toggleCategory = (category: FeedbackCategory) => {
    if (category === 'all') {
      if (selectedCategories.includes('all')) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(['all', 'suggestion', 'bug', 'praise', 'complaint']);
      }
    } else {
      if (selectedCategories.includes(category)) {
        const newCategories = selectedCategories.filter(c => c !== category);
        // If removing a category would make the list empty, reset to all
        if (newCategories.length === 0) {
          setSelectedCategories(['all', 'suggestion', 'bug', 'praise', 'complaint']);
        } else {
          // Remove 'all' if it's there and a specific category is being removed
          const withoutAll = newCategories.filter(c => c !== 'all');
          setSelectedCategories(withoutAll);
        }
      } else {
        // If adding a category and all categories will be selected, add 'all' too
        const newCategories = [...selectedCategories, category];
        const allSpecificCategories = ['suggestion', 'bug', 'praise', 'complaint'];
        const allSelected = allSpecificCategories.every(c => 
          newCategories.includes(c as FeedbackCategory));
        if (allSelected) {
          setSelectedCategories([...newCategories, 'all']);
        } else {
          // Remove 'all' if it's there but not all specific categories are selected
          const withoutAll = newCategories.filter(c => c !== 'all');
          setSelectedCategories(withoutAll);
        }
      }
    }
  };
  
  const toggleStatus = (status: FeedbackStatus) => {
    if (status === 'all') {
      if (selectedStatuses.includes('all')) {
        setSelectedStatuses([]);
      } else {
        setSelectedStatuses(['all', 'pending', 'reviewed', 'resolved', 'rejected']);
      }
    } else {
      if (selectedStatuses.includes(status)) {
        const newStatuses = selectedStatuses.filter(s => s !== status);
        // If removing a status would make the list empty, reset to all
        if (newStatuses.length === 0) {
          setSelectedStatuses(['all', 'pending', 'reviewed', 'resolved', 'rejected']);
        } else {
          // Remove 'all' if it's there and a specific status is being removed
          const withoutAll = newStatuses.filter(s => s !== 'all');
          setSelectedStatuses(withoutAll);
        }
      } else {
        // If adding a status and all statuses will be selected, add 'all' too
        const newStatuses = [...selectedStatuses, status];
        const allSpecificStatuses = ['pending', 'reviewed', 'resolved', 'rejected'];
        const allSelected = allSpecificStatuses.every(s => 
          newStatuses.includes(s as FeedbackStatus));
        if (allSelected) {
          setSelectedStatuses([...newStatuses, 'all']);
        } else {
          // Remove 'all' if it's there but not all specific statuses are selected
          const withoutAll = newStatuses.filter(s => s !== 'all');
          setSelectedStatuses(withoutAll);
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{filteredCount}</span> of <span className="font-medium">{totalCount}</span> feedback items
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-4 w-4" />
              Categories
              {selectedCategories.length > 0 && selectedCategories[0] !== 'all' && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {selectedCategories.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedCategories.includes('all')}
              onCheckedChange={() => toggleCategory('all')}
            >
              All Categories
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedCategories.includes('suggestion')}
              onCheckedChange={() => toggleCategory('suggestion')}
            >
              Suggestions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedCategories.includes('bug')}
              onCheckedChange={() => toggleCategory('bug')}
            >
              Bug Reports
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedCategories.includes('praise')}
              onCheckedChange={() => toggleCategory('praise')}
            >
              Praise
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedCategories.includes('complaint')}
              onCheckedChange={() => toggleCategory('complaint')}
            >
              Complaints
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-4 w-4" />
              Status
              {selectedStatuses.length > 0 && selectedStatuses[0] !== 'all' && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {selectedStatuses.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('all')}
              onCheckedChange={() => toggleStatus('all')}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('pending')}
              onCheckedChange={() => toggleStatus('pending')}
            >
              Pending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('reviewed')}
              onCheckedChange={() => toggleStatus('reviewed')}
            >
              Reviewed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('resolved')}
              onCheckedChange={() => toggleStatus('resolved')}
            >
              Resolved
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('rejected')}
              onCheckedChange={() => toggleStatus('rejected')}
            >
              Rejected
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}