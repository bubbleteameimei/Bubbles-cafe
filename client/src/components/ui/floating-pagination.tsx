import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './button';

interface FloatingPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  variant?: 'default' | 'ghost' | 'minimalist';
}

export function FloatingPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  variant = 'default'
}: FloatingPaginationProps) {
  // Generate the page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of visible page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if near the start
    if (currentPage <= 3) {
      endPage = Math.min(maxVisiblePages, totalPages - 1);
    }
    
    // Adjust if near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('start-ellipsis');
    }
    
    // Add the visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('end-ellipsis');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Variants for motion animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Different styling based on variant
  const getContainerClass = () => {
    const baseClass = "flex items-center justify-center space-x-1 md:space-x-2";
    
    if (variant === 'ghost') {
      return `${baseClass} bg-transparent ${className}`;
    }
    
    if (variant === 'minimalist') {
      return `${baseClass} ${className}`;
    }
    
    // Default variant
    return `${baseClass} bg-background/80 backdrop-blur-sm rounded-full py-2 px-3 shadow-lg border border-border/50 ${className}`;
  };
  
  const getButtonClass = (isActive: boolean) => {
    if (variant === 'ghost') {
      return isActive 
        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
        : "bg-transparent hover:bg-muted";
    }
    
    if (variant === 'minimalist') {
      return isActive 
        ? "font-bold text-primary underline underline-offset-4" 
        : "text-muted-foreground hover:text-foreground";
    }
    
    // Default variant
    return isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "bg-muted/50 text-muted-foreground hover:bg-muted";
  };

  return (
    <motion.div
      className={getContainerClass()}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Previous button */}
      <motion.div variants={itemVariants}>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <motion.div key={`page-${index}`} variants={itemVariants}>
          {page === 'start-ellipsis' || page === 'end-ellipsis' ? (
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="h-8 w-8 rounded-full cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "ghost"}
              size="icon"
              onClick={() => onPageChange(page as number)}
              className={`h-8 w-8 rounded-full ${getButtonClass(currentPage === page)}`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          )}
        </motion.div>
      ))}

      {/* Next button */}
      <motion.div variants={itemVariants}>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}