import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxButtons = 5 
}: PaginationProps) {
  // If there's only one page, don't show pagination
  if (totalPages <= 1) return null;
  
  // Calculate the range of page buttons to show
  const getPageRange = () => {
    const halfMax = Math.floor(maxButtons / 2);
    
    let start = Math.max(currentPage - halfMax, 1);
    let end = Math.min(start + maxButtons - 1, totalPages);
    
    // Adjust the start if we hit the end boundary
    if (end === totalPages) {
      start = Math.max(end - maxButtons + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const pageRange = getPageRange();
  
  // Add dots if range doesn't include the edges
  const showLeftDots = pageRange[0] > 1;
  const showRightDots = pageRange[pageRange.length - 1] < totalPages;
  
  return (
    <div className="flex items-center space-x-2">
      {/* First page button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:flex"
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      {/* Previous page button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {/* Left ellipsis */}
        {showLeftDots && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.max(1, pageRange[0] - 1))}
            className="hidden sm:flex h-8 w-8"
          >
            ...
          </Button>
        )}
        
        {/* Page buttons */}
        {pageRange.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            className="h-8 w-8"
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
        
        {/* Right ellipsis */}
        {showRightDots && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, pageRange[pageRange.length - 1] + 1))}
            className="hidden sm:flex h-8 w-8"
          >
            ...
          </Button>
        )}
      </div>
      
      {/* Next page button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last page button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:flex"
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}