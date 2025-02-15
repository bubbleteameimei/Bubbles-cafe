import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
          );
        }

        if (!user?.isAdmin) {
          return <Redirect to="/" />;
        }

        return <Component />;
      }}
    </Route>
  );
}