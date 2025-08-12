
import { Pagination } from "@/components/ui/pagination";

export function PaginationDemo() {
  return (
    <Pagination
      currentPage={2}
      totalPages={10}
      onPageChange={() => {}}
    />
  );
}
