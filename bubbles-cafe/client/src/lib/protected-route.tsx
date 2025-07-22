import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteComponentProps } from "wouter";

export interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<RouteComponentProps>;
  requireAdmin?: boolean;
  adminOnly?: boolean; // Added for backward compatibility
  children?: React.ReactNode; // Add support for children as an alternative
}

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
  adminOnly = false, // Support both adminOnly and requireAdmin
  children
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  // Use either adminOnly or requireAdmin flags
  const requireAdminAccess = adminOnly || requireAdmin;

  // If children are provided, use that instead of the component
  if (children) {
    return (
      <Route path={path}>
        {() => {
          if (isLoading) {
            // Return empty div with no loading indicators
            return <div className="min-h-[60vh]"></div>;
          }

          if (!user) {
            return <Redirect to="/auth" />;
          }

          if (requireAdminAccess && !user.isAdmin) {
            return <Redirect to="/" />;
          }

          return <>{children}</>;
        }}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          // Return empty div with no loading indicators
          return <div className="min-h-[60vh]"></div>;
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (requireAdminAccess && !user.isAdmin) {
          return <Redirect to="/" />;
        }

        return <Component params={params} />;
      }}
    </Route>
  );
}