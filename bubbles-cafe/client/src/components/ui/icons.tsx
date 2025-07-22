
import { Icon } from "lucide-react";
import { ThemeCategory } from "@shared/schema";

export function getIconComponent(iconName: string): Icon {
  // Simple passthrough since we're not using custom icons yet
  return () => null;
}
