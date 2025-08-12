
import type { LucideIcon } from "lucide-react";

export function getIconComponent(_iconName: string): LucideIcon {
  // Simple passthrough since we're not using custom icons yet
  return () => null as any;
}
