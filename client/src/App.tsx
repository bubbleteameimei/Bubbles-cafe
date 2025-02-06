import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AudioProvider } from "@/components/effects/audio";
import { AuthProvider } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import Sidebar from "./components/blog/sidebar";
import { CookieConsent } from "@/components/ui/cookie-consent";
import Home from "./pages/home";
import Stories from "./pages/stories";
import Secret from "./pages/secret";
import About from "./pages/about";
import Admin from "./pages/admin";
import AdminLogin from "./pages/admin-login";
import NotFound from "./pages/not-found";
import Privacy from "./pages/privacy";
import Schoop from "./pages/schoop";

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [location] = useLocation();

  // Initial loading screen
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  // Handle route changes including manual navigation
  React.useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 800);
    };

    // Listen for location changes
    handleRouteChange();
  }, [location]);

  return (
    <AuthProvider>
      <AudioProvider>
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            {isLoading && <LoadingScreen />}
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/stories" component={Stories} />
                  <Route path="/schoop" component={Schoop} />
                  <Route path="/secret" component={Secret} />
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/about" component={About} />
                  <Route path="/admin" component={Admin} />
                  <Route path="/admin/login" component={AdminLogin} />
                  <Route component={NotFound} />
                </Switch>
                <aside className="hidden lg:block">
                  <Sidebar />
                </aside>
              </div>
            </main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </div>
        </QueryClientProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;