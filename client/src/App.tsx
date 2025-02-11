import React, { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Navigation from "@/components/layout/navigation";

// Lazy load components that aren't needed immediately
const Home = lazy(() => import("@/pages/home"));
const Stories = lazy(() => import("@/pages/stories"));
const Secret = lazy(() => import("@/pages/secret"));
const About = lazy(() => import("@/pages/about"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Privacy = lazy(() => import("@/pages/privacy"));
const StoryView = lazy(() => import("@/pages/story-view"));
const Contact = lazy(() => import("@/pages/contact"));
const Reader = lazy(() => import("@/pages/reader"));
const IndexView = lazy(() => import("@/pages/index"));

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [location] = useLocation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen />}>
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/reader" component={Reader} />
                    <Route path="/stories" component={Stories} />
                    <Route path="/index" component={IndexView} />
                    <Route path="/story/:slug">
                      {params => <StoryView slug={params.slug} />}
                    </Route>
                    <Route path="/secret" component={Secret} />
                    <Route path="/privacy" component={Privacy} />
                    <Route path="/about" component={About} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/admin/login" component={AdminLogin} />
                    <Route path="/admin" component={Admin} />
                    <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </ErrorBoundary>
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;