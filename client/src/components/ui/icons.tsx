
import { type LucideIcon } from "lucide-react";

// Map of icon name to component; extend as needed
const iconMap: Record<string, LucideIcon> = {};

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] ?? (() => null);
}
