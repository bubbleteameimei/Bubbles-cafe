import { cn } from "@/lib/utils"
import { useLoading } from "@/components/GlobalLoadingProvider";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Access the loading context to check if skeletons should be suppressed
  const { suppressSkeletons } = useLoading();
  
  // If global loading screen is active, don't show skeleton loaders to avoid UI conflicts
  if (suppressSkeletons) {
    return null;
  }
  
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }