import { ThemeToggleButton } from "./theme-toggle-button";

interface ThemeToggleProps {
  variant?: 'default' | 'full' | 'icon' | 'animated' | 'fancy';
  className?: string;
}

/**
 * @deprecated Use ThemeToggleButton directly instead
 */
export function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  // This is a legacy component that now just wraps ThemeToggleButton
  // for backwards compatibility. Use ThemeToggleButton directly in new code.
  return (
    <div className={className}>
      <ThemeToggleButton className={className} />
    </div>
  );
}