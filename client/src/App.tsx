import React, { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Loader2 } from "lucide-react";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Lazy load components
const Home = lazy(() => import("@/pages/home"));
const Stories = lazy(() => import("@/pages/stories"));
const StoryView = lazy(() => import("@/pages/story-view"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const AdminDashboardV2 = lazy(() => import("@/pages/admin-v2/dashboard"));
const Secret = lazy(() => import("@/pages/secret"));
const About = lazy(() => import("@/pages/about"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Contact = lazy(() => import("@/pages/contact"));
const Reader = lazy(() => import("@/pages/reader"));
const IndexView = lazy(() => import("@/pages/index"));
const Community = lazy(() => import("@/pages/community"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }: { component: React.ComponentType, path: string }) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      console.log("User not authorized, redirecting to login");
      navigate("/admin/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return <Component {...rest} />;
};

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground antialiased">
            <Navigation />
            <main className={location === "/" ? "" : "pt-16"}>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  }
                >
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/index" component={IndexView} />
                    <Route path="/reader" component={Reader} />
                    <Route path="/stories" component={Stories} />
                    <Route path="/community" component={Community} />
                    <Route path="/story/:slug">
                      {params => <StoryView slug={params.slug} />}
                    </Route>
                    <Route path="/about" component={About} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/privacy" component={Privacy} />
                    <Route path="/admin/login" component={AdminLogin} />
                    <Route path="/admin">
                      <ProtectedRoute component={AdminDashboard} path="/admin" />
                    </Route>
                    <Route path="/admin-v2">
                      <ProtectedRoute component={AdminDashboardV2} path="/admin-v2" />
                    </Route>
                    <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </ErrorBoundary>
            </main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;