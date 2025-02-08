import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/components/effects/audio";
import { AuthProvider } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { CookieConsent } from "@/components/ui/cookie-consent";
import Home from "./pages/home";
import Stories from "./pages/stories";
import Secret from "./pages/secret";
import About from "./pages/about";
import Admin from "./pages/admin";
import AdminLogin from "./pages/admin-login";
import NotFound from "./pages/not-found";
import Privacy from "./pages/privacy";
import { queryClient } from "@/lib/queryClient";
import StoryView from "./pages/story-view";
import Contact from "./pages/contact";

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [location] = useLocation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            {isLoading && <LoadingScreen />}
            <Navigation />
            <main className="flex-1">
              <React.Suspense fallback={<LoadingScreen />}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/stories" component={Stories} />
                  <Route path="/stories/:slug" component={StoryView} />
                  <Route path="/secret" component={Secret} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/about" component={About} />
                  <Route path="/contact" component={Contact} />
                  <Route path="/admin" component={Admin} />
                  <Route path="/admin/login" component={AdminLogin} />
                  <Route component={NotFound} />
                </Switch>
              </React.Suspense>
            </main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </div>
        </AudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;