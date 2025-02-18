import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import MainNav from '@/components/MainNav';
import { ThemeProvider } from '@/lib/theme-provider';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/home'));
const CommunityPage = React.lazy(() => import('@/pages/community'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="relative min-h-screen bg-background text-foreground">
          <MainNav />
          <React.Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
              </div>
            }
          >
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/community" component={CommunityPage} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
            </Switch>
          </React.Suspense>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;