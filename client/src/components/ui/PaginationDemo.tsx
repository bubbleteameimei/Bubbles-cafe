/* @ts-nocheck */

import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="space-y-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
