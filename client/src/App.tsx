import React, { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/components/effects/audio";
import { AuthProvider } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Lazy load components that aren't needed immediately
const Home = lazy(() => import("./pages/home"));
const Stories = lazy(() => import("./pages/stories"));
const Secret = lazy(() => import("./pages/secret"));
const About = lazy(() => import("./pages/about"));
const Admin = lazy(() => import("./pages/admin"));
const AdminLogin = lazy(() => import("./pages/admin-login"));
const NotFound = lazy(() => import("./pages/not-found"));
const Privacy = lazy(() => import("./pages/privacy"));
const StoryView = lazy(() => import("./pages/story-view"));
const Contact = lazy(() => import("./pages/contact"));
const Reader = lazy(() => import("./pages/reader"));
const IndexView = lazy(() => import("./pages/index"));

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [location] = useLocation();

  // Prefetch critical routes
  React.useEffect(() => {
    const prefetchRoutes = async () => {
      const routes = ['/', '/stories', '/reader'];
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
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <AudioProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Navigation />
              <main className="flex-1">
                <Suspense fallback={<LoadingScreen />}>
                  <ErrorBoundary>
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/reader" component={Reader} />
                      <Route path="/stories" component={Stories} />
                      <Route path="/index" component={IndexView} />
                      <Route path="/story/:slug" component={StoryView} />
                      <Route path="/secret" component={Secret} />
                      <Route path="/privacy" component={Privacy} />
                      <Route path="/about" component={About} />
                      <Route path="/contact" component={Contact} />
                      <Route path="/admin/login" component={AdminLogin} />
                      <Route path="/admin" component={Admin} />
                      <Route component={NotFound} />
                    </Switch>
                  </ErrorBoundary>
                </Suspense>
              </main>
              <Footer />
              <CookieConsent />
              <Toaster />
            </div>
          </AudioProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;