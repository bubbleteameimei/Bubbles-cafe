import { cn } from "@/lib/utils"

// Skeleton component that returns absolutely nothing
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Return null - completely removing all skeleton placeholders
  return null;
}

export { Skeleton }