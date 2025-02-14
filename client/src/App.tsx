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

// Lazy load components with error boundary
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

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground antialiased">
            <Navigation />
            <React.Suspense fallback={<LoadingScreen />}>
              <main className={location === "/" ? "" : "pt-16"}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/stories" component={Stories} />
                  <Route path="/community" component={Community} />
                  <Route path="/story/:slug">
                    {params => <StoryView slug={params.slug} />}
                  </Route>
                  <Route path="/auth" component={Auth} />
                  <Route path="/about" component={About} />
                  <Route path="/contact" component={Contact} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/index" component={Index} />
                  <Route path="/reader" component={Reader} />
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