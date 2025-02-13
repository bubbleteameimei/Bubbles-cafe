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

// Lazy load components with proper error handling
const Home = lazy(() => import("./pages/home"));
const Stories = lazy(() => import("./pages/stories"));
const StoryView = lazy(() => import("./pages/story-view"));
const About = lazy(() => import("./pages/about"));
const Privacy = lazy(() => import("./pages/privacy"));
const Contact = lazy(() => import("./pages/contact"));
const Community = lazy(() => import("./pages/community"));
const Auth = lazy(() => import("./pages/auth"));
const NotFound = lazy(() => import("./pages/not-found"));
const Index = lazy(() => import("./pages/index"));
const Reader = lazy(() => import("./pages/reader"));

interface LazyComponentProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ component: Component, ...props }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  </ErrorBoundary>
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
                <Route path="/" component={() => <LazyComponent component={Home} />} />
                <Route path="/stories" component={() => <LazyComponent component={Stories} />} />
                <Route path="/community" component={() => <LazyComponent component={Community} />} />
                <Route path="/story/:slug">
                  {params => <LazyComponent component={StoryView} slug={params.slug} />}
                </Route>
                <Route path="/auth" component={() => <LazyComponent component={Auth} />} />
                <Route path="/about" component={() => <LazyComponent component={About} />} />
                <Route path="/contact" component={() => <LazyComponent component={Contact} />} />
                <Route path="/privacy" component={() => <LazyComponent component={Privacy} />} />
                <Route path="/index" component={() => <LazyComponent component={Index} />} />
                <Route path="/reader" component={() => <LazyComponent component={Reader} />} />
                <Route path="/:rest*" component={() => <LazyComponent component={NotFound} />} />
              </Switch>
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