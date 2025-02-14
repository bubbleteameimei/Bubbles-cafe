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
import { createLazyComponent } from "@/lib/utils";
import type { RouteParams } from "@/lib/utils";

// Lazy load components with error boundary
const Home = createLazyComponent(() => import("./pages/home"));
const Stories = createLazyComponent(() => import("./pages/stories"));
const StoryView = createLazyComponent(() => import("./pages/story-view"));
const About = createLazyComponent(() => import("./pages/about"));
const Privacy = createLazyComponent(() => import("./pages/privacy"));
const Contact = createLazyComponent(() => import("./pages/contact"));
const Community = createLazyComponent(() => import("./pages/community"));
const Auth = createLazyComponent(() => import("./pages/auth"));
const Index = createLazyComponent(() => import("./pages/index"));
const Reader = createLazyComponent(() => import("./pages/reader"));

// NotFound component with proper typing
const NotFound = createLazyComponent(() => 
  Promise.resolve({
    default: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  })
);

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground antialiased">
            <Navigation />
            <main className={location === "/" ? "" : "pt-16"}>
              <Switch>
                <Route path="/">
                  {() => <Home />}
                </Route>
                <Route path="/stories">
                  {() => <Stories />}
                </Route>
                <Route path="/community">
                  {() => <Community />}
                </Route>
                <Route path="/story/:slug">
                  {params => <StoryView slug={params.slug} />}
                </Route>
                <Route path="/auth">
                  {() => <Auth />}
                </Route>
                <Route path="/about">
                  {() => <About />}
                </Route>
                <Route path="/contact">
                  {() => <Contact />}
                </Route>
                <Route path="/privacy">
                  {() => <Privacy />}
                </Route>
                <Route path="/index">
                  {() => <Index />}
                </Route>
                <Route path="/reader">
                  {() => <Reader />}
                </Route>
                <Route>
                  {() => <NotFound />}
                </Route>
              </Switch>
            </main>
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