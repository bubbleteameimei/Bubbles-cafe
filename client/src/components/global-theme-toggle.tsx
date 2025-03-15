import { DayNightToggle } from "@/components/ui/day-night-toggle";

interface GlobalThemeToggleProps {
  className?: string;
}

export function GlobalThemeToggle({ className = "" }: GlobalThemeToggleProps) {
  return <DayNightToggle className={className} />;
}