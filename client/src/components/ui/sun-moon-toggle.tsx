import { DayNightToggle } from "./day-night-toggle";

interface SunMoonToggleProps {
  className?: string;
}

export function SunMoonToggle({ className = "" }: SunMoonToggleProps) {
  return (
    <div className={className}>
      <DayNightToggle />
    </div>
  );
}