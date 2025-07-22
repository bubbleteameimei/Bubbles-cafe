/**
 * This component has been simplified to remove all animations and transitions.
 * It now simply renders children directly with no animations or effects.
 */

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: "fade" | "slide" | "blur" | "zoom"; // Kept for backward compatibility
  duration?: number; // Kept for backward compatibility
}

/**
 * Simplified page transition that just renders children with no animations
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children
}) => {
  // Simply render children directly with no transition effects or animations
  return <>{children}</>;
};

export default PageTransition;