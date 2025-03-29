/**
 * This component has been completely removed.
 * 
 * It has been replaced with direct rendering in App.tsx.
 * All page transition animations and effects have been removed.
 */

export function EnhancedPageTransition({
  children
}: {
  children: React.ReactNode;
}) {
  // Simply pass through children with no transition effects
  return <>{children}</>;
}