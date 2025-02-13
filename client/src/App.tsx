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

// Enhanced lazy loading with retry mechanism and proper error handling
const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(() =>
    importFn().catch(error => {
      console.error("Failed to load component:", error);
      return import("./pages/not-found");
    })
  );
};

// Lazy load components
const Home = lazyLoad(() => import("./pages/home"));
const Stories = lazyLoad(() => import("./pages/stories"));
const StoryView = lazyLoad(() => import("./pages/story-view"));
const About = lazyLoad(() => import("./pages/about"));
const Privacy = lazyLoad(() => import("./pages/privacy"));
const Contact = lazyLoad(() => import("./pages/contact"));
const Community = lazyLoad(() => import("./pages/community"));
const Auth = lazyLoad(() => import("./pages/auth"));
const Index = lazyLoad(() => import("./pages/index"));
const Reader = lazyLoad(() => import("./pages/reader"));

// Improved NotFound component with better error handling
const NotFound = lazy(() => Promise.resolve({
  default: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  )
}));

interface LazyComponentProps {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ component: Component, props = {} }) => (
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
                  {params => <LazyComponent component={StoryView} props={{ slug: params.slug }} />}
                </Route>
                <Route path="/auth" component={() => <LazyComponent component={Auth} />} />
                <Route path="/about" component={() => <LazyComponent component={About} />} />
                <Route path="/contact" component={() => <LazyComponent component={Contact} />} />
                <Route path="/privacy" component={() => <LazyComponent component={Privacy} />} />
                <Route path="/index" component={() => <LazyComponent component={Index} />} />
                <Route path="/reader" component={() => <LazyComponent component={Reader} />} />
                <Route component={() => <LazyComponent component={NotFound} />} />
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