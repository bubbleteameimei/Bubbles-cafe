import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

export default function ErrorFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-xl">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Failed to load component</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>There was an error loading this part of the page.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleReload}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
