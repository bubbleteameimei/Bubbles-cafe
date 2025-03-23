import { Badge } from "@/components/ui/badge";
import { isDevelopment } from "@/config/environment";

export function EnvironmentIndicator() {
  if (!isDevelopment()) return null;

  return (
    <Badge
      variant="secondary"
      className="fixed bottom-4 right-4 z-50 bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
    >
      Development Mode
    </Badge>
  );
}
