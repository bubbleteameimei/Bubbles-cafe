import React, { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { StoryView } from "@/components/StoryView";

// Lazy load components that aren't needed immediately
const Home = lazy(() => import("@/pages/home"));
const Stories = lazy(() => import("@/pages/stories"));
const Secret = lazy(() => import("@/pages/secret"));
const About = lazy(() => import("@/pages/about"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Contact = lazy(() => import("@/pages/contact"));
const Reader = lazy(() => import("@/pages/reader"));
const IndexView = lazy(() => import("@/pages/index"));
const SubmitStory = lazy(() => import("@/pages/submit-story"));
const Community = lazy(() => import("@/pages/community"));

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [location] = useLocation();

  // Prefetch critical routes
  React.useEffect(() => {
    const prefetchRoutes = async () => {
      const routes = ['/', '/index', '/reader', '/submit-story', '/community'];
      await Promise.all(
        routes.map(route =>
          queryClient.prefetchQuery({
            queryKey: [`/api${route}`],
            staleTime: 5 * 60 * 1000 // 5 minutes
          })
        )
      );
    };
    prefetchRoutes();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Scroll to top on route change
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
          <div className="relative min-h-screen bg-background text-foreground antialiased">
            <Navigation />

            {/* Main Content */}
            <main className="pt-14">
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen />}>
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/index" component={IndexView} />
                    <Route path="/reader" component={Reader} />
                    <Route path="/stories" component={Stories} />
                    <Route path="/community" component={Community} />
                    <Route path="/submit-story" component={SubmitStory} />
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