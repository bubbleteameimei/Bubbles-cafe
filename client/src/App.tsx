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

// Lazy load components with proper error handling and loading fallback
const Home = lazy(() => import("./pages/home").catch(err => {
  console.error("Failed to load Home page:", err);
  return import("./pages/not-found");
}));

const Stories = lazy(() => import("./pages/stories").catch(err => {
  console.error("Failed to load Stories page:", err);
  return import("./pages/not-found");
}));

const StoryView = lazy(() => import("./pages/story-view").catch(err => {
  console.error("Failed to load StoryView page:", err);
  return import("./pages/not-found");
}));

const About = lazy(() => import("./pages/about").catch(err => {
  console.error("Failed to load About page:", err);
  return import("./pages/not-found");
}));

const Privacy = lazy(() => import("./pages/privacy").catch(err => {
  console.error("Failed to load Privacy page:", err);
  return import("./pages/not-found");
}));

const Contact = lazy(() => import("./pages/contact").catch(err => {
  console.error("Failed to load Contact page:", err);
  return import("./pages/not-found");
}));

const Community = lazy(() => import("./pages/community").catch(err => {
  console.error("Failed to load Community page:", err);
  return import("./pages/not-found");
}));

const Auth = lazy(() => import("./pages/auth").catch(err => {
  console.error("Failed to load Auth page:", err);
  return import("./pages/not-found");
}));

// Update NotFound to return proper module format
const NotFound = lazy(() => import("./pages/not-found").catch(err => {
  console.error("Failed to load NotFound page:", err);
  return Promise.resolve({
    default: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  });
}));

const Index = lazy(() => import("./pages/index").catch(err => {
  console.error("Failed to load Index page:", err);
  return import("./pages/not-found");
}));

const Reader = lazy(() => import("./pages/reader").catch(err => {
  console.error("Failed to load Reader page:", err);
  return import("./pages/not-found");
}));

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