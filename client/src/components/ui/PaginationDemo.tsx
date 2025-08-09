import React from "react";

import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export function PaginationDemo() {
  const [page, setPage] = React.useState(1);
  const totalPages = 10;
  
  return (
    <div className="space-y-4">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
    </div>
  );
}
