import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import Cursor from "./components/layout/cursor";
import Home from "./pages/home";
import Post from "./pages/post";
import Secret from "./pages/secret";
import NotFound from "./pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Cursor />
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/post/:slug" component={Post} />
            <Route path="/secret" component={Secret} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;