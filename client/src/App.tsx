import React from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AudioProvider } from "@/components/effects/audio";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import Sidebar from "./components/blog/sidebar";
import Home from "./pages/home";
import Post from "./pages/post";
import Secret from "./pages/secret";
import About from "./pages/about";
import NotFound from "./pages/not-found";
import Privacy from "./pages/privacy";

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial load time to show the loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AudioProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
          {isLoading && <LoadingScreen />}
          <Navigation />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/post/:slug" component={Post} />
                <Route path="/secret" component={Secret} />
                <Route path="/privacy" component={Privacy} />
                <Route component={NotFound} />
              </Switch>
              <aside className="hidden lg:block">
                <Sidebar />
              </aside>
            </div>
          </main>
          <Footer />
          <Toaster />
        </div>
      </QueryClientProvider>
    </AudioProvider>
  );
}

export default App;