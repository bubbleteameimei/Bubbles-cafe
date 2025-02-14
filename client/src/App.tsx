import React from 'react';
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
import { AtmosphericEffects } from "@/components/effects/AtmosphericEffects";

// Lazy load components with proper error handling
// Lazy load components
const Home = React.lazy(() => import("./pages/home"));
const Stories = React.lazy(() => import("./pages/stories"));
const StoryView = React.lazy(() => import("./pages/story-view"));
const About = React.lazy(() => import("./pages/about"));
const Privacy = React.lazy(() => import("./pages/privacy"));
const Contact = React.lazy(() => import("./pages/contact"));
const Community = React.lazy(() => import("./pages/community"));
const Auth = React.lazy(() => import("./pages/auth"));
const Index = React.lazy(() => import("./pages/index"));
const Reader = React.lazy(() => import("./pages/reader"));

// Wrap components with error boundary
const withErrorBoundary = (Component: React.ComponentType<any>) => (props: any) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);

const SafeHome = withErrorBoundary(Home);
const SafeStories = withErrorBoundary(Stories);
const SafeStoryView = withErrorBoundary(StoryView);
const SafeAbout = withErrorBoundary(About);
const SafePrivacy = withErrorBoundary(Privacy);
const SafeContact = withErrorBoundary(Contact);
const SafeCommunity = withErrorBoundary(Community);
const SafeAuth = withErrorBoundary(Auth);
const SafeIndex = withErrorBoundary(Index);
const SafeReader = withErrorBoundary(Reader);

function App() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial load delay to ensure proper hydration
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground antialiased">
            <Navigation />
            <ErrorBoundary> {/* Added ErrorBoundary here to catch errors within Suspense */}
              <React.Suspense fallback={<LoadingScreen />}>
                <main className={location === "/" ? "" : "pt-16"}>
                  <Switch>
                    <Route path="/" component={SafeHome} />
                    <Route path="/stories" component={SafeStories} />
                    <Route path="/community" component={SafeCommunity} />
                    <Route path="/story/:slug">
                      {params => <SafeStoryView slug={params.slug} />}
                    </Route>
                    <Route path="/auth" component={SafeAuth} />
                    <Route path="/about" component={SafeAbout} />
                    <Route path="/contact" component={SafeContact} />
                    <Route path="/privacy" component={SafePrivacy} />
                    <Route path="/index" component={SafeIndex} />
                    <Route path="/reader" component={SafeReader} />
                    <Route>
                      {() => (
                        <div className="min-h-screen flex items-center justify-center bg-background">
                          <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold text-foreground">404</h1>
                            <p className="text-muted-foreground">Page not found</p>
                          </div>
                        </div>
                      )}
                    </Route>
                  </Switch>
                </main>
              </React.Suspense>
            </ErrorBoundary>
            <Footer />
            <CookieConsent />
            <AtmosphericEffects />
            <Toaster />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;