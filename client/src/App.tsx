import React from 'react';
import { Route, Switch, Redirect, RouteComponentProps } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/layout/navigation';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
import { AtmosphericEffects } from '@/components/effects/AtmosphericEffects';

// Enhanced lazy loading with better error handling and retries
const loadComponent = (
  importFn: () => Promise<any>,
  options: {
    priority?: 'high' | 'low';
    retries?: number;
    fallback?: React.ReactNode;
  } = {}
) => {
  const {
    priority = 'low',
    retries = 1,
    fallback
  } = options;

  const Component = React.lazy(() =>
    importFn().catch(async (error) => {
      console.error('Failed to load component:', error);

      // Implement retry logic with delay
      let lastError = error;
      for (let i = 0; i < retries; i++) {
        try {
          // Exponential backoff delay
          await new Promise(resolve =>
            setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))
          );
          return await importFn();
        } catch (retryError) {
          console.error(`Retry ${i + 1} failed:`, retryError);
          lastError = retryError;
        }
      }
      throw lastError;
    })
  );

  // Return wrapped component with error boundary and suspense
  const WrappedComponent = (props: any) => (
    <ErrorBoundary fallback={fallback}>
      <React.Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );

  // Enhanced prefetch method with priority
  WrappedComponent.prefetch = () => {
    if (priority === 'high') {
      // Immediately prefetch high priority routes
      return importFn();
    }
    // Low priority routes are prefetched when idle
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          importFn().then(resolve);
        });
      } else {
        setTimeout(() => {
          importFn().then(resolve);
        }, 0);
      }
    });
  };

  return WrappedComponent;
};

// Lazy load pages with enhanced options
const HomePage = loadComponent(() => import('@/pages/home'), {
  priority: 'high',
  retries: 2
});
const ReaderPage = loadComponent(() => import('@/pages/reader'), {
  priority: 'high',
  retries: 2
});
const StoriesPage = loadComponent(() => import('@/pages/secret-stories'), {
  priority: 'high',
  retries: 2
});
const IndexPage = loadComponent(() => import('@/pages/index'));
const AboutPage = loadComponent(() => import('@/pages/about'));
const ContactPage = loadComponent(() => import('@/pages/contact'));
const AdminDashboard = loadComponent(() => import('@/pages/admin/dashboard'));
const AdminAnalytics = loadComponent(() => import('@/pages/admin/analytics'));
const AdminUsers = loadComponent(() => import('@/pages/admin/users'));
const AdminSettings = loadComponent(() => import('@/pages/admin/settings'));
const AdminPosts = loadComponent(() => import('@/pages/admin/posts'));
const PrivacyPage = loadComponent(() => import('@/pages/privacy'));
const ReportBugPage = loadComponent(() => import('@/pages/report-bug'));
const CommunityPage = loadComponent(() => import('@/pages/community'));
const SettingsPage = loadComponent(() => import('@/pages/settings/SettingsPage'));
const AuthPage = loadComponent(() => import('@/pages/auth'), {
  priority: 'high',
  retries: 2
});

function AdminRoute({
  component: Component,
  path
}: {
  component: React.ComponentType<RouteComponentProps>,
  path: string
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <ErrorBoundary>
      <Route path={path} component={Component} />
    </ErrorBoundary>
  );
}

// Enhanced prefetching strategy with error handling
const prefetchCriticalRoutes = () => {
  // High priority routes
  Promise.allSettled([
    HomePage.prefetch(),
    ReaderPage.prefetch(),
    StoriesPage.prefetch(),
    AuthPage.prefetch()
  ]).then(results => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to prefetch critical route ${index}:`, result.reason);
      }
    });
  });

  // Low priority routes prefetched during idle time
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      Promise.allSettled([
        AboutPage.prefetch(),
        ContactPage.prefetch(),
        CommunityPage.prefetch()
      ]).then(results => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to prefetch non-critical route ${index}:`, result.reason);
          }
        });
      });
    });
  }
};

function App() {
  // Add performance monitoring
  usePerformanceMonitoring();

  // Prefetch critical routes on mount and cache them
  React.useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="relative min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-grow">
                <Switch>
                  {/* Public Routes */}
                  <Route path="/" component={HomePage} />
                  <Route path="/reader" component={ReaderPage} />
                  <Route path="/stories" component={StoriesPage} />
                  <Route path="/index" component={IndexPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/privacy" component={PrivacyPage} />
                  <Route path="/contact" component={ContactPage} />
                  <Route path="/community" component={CommunityPage} />
                  <Route path="/report-bug" component={ReportBugPage} />
                  <Route path="/auth" component={AuthPage} />

                  {/* Settings Routes */}
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/settings/:section" component={SettingsPage} />

                  {/* Admin Routes - Protected */}
                  <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
                  <AdminRoute path="/admin/posts" component={AdminPosts} />
                  <AdminRoute path="/admin/analytics" component={AdminAnalytics} />
                  <AdminRoute path="/admin/users" component={AdminUsers} />
                  <AdminRoute path="/admin/settings" component={AdminSettings} />

                  {/* 404 Route */}
                  <Route path="/:rest*">
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <h1 className="text-2xl">404 - Page Not Found</h1>
                    </div>
                  </Route>
                </Switch>
              </main>
              <Footer />
              <AtmosphericEffects autoPlay={false} />
              <Toaster />
              <CookieConsent />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;