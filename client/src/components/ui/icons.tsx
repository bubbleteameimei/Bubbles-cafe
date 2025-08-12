
import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export function getIconComponent(_iconName: string): LucideIcon {
  const Icon = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
    <svg ref={ref} width={16} height={16} {...props} />
  ));
  Icon.displayName = "PlaceholderIcon";
  return Icon as LucideIcon;
}
