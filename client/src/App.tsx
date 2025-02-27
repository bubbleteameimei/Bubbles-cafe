import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/layout/navigation';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/lib/protected-route';

// Enhanced lazy loading with better error handling
const loadComponent = (importFn: () => Promise<any>) => {
  const Component = React.lazy(importFn);

  return (props: any) => (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

// Lazy load pages
const HomePage = loadComponent(() => import('@/pages/home'));
const ReaderPage = loadComponent(() => import('@/pages/reader'));
const StoriesPage = loadComponent(() => import('@/pages/secret-stories'));
const IndexPage = loadComponent(() => import('@/pages/index'));
const AboutPage = loadComponent(() => import('@/pages/about'));
const ContactPage = loadComponent(() => import('@/pages/contact'));
const AdminPage = loadComponent(() => import('@/pages/admin'));
const AdminAnalytics = loadComponent(() => import('@/pages/admin/analytics'));
const AdminUsers = loadComponent(() => import('@/pages/admin/users'));
const AdminSettings = loadComponent(() => import('@/pages/admin/settings'));
const AdminPosts = loadComponent(() => import('@/pages/admin/posts'));
const PrivacyPage = loadComponent(() => import('@/pages/privacy'));
const ReportBugPage = loadComponent(() => import('@/pages/report-bug'));
const CommunityPage = loadComponent(() => import('@/pages/community'));
const SettingsPage = loadComponent(() => import('@/pages/settings/SettingsPage'));
const AuthPage = loadComponent(() => import('@/pages/auth'));

console.log('[App] Initializing application with SidebarProvider...');

function App() {
  // Add performance monitoring
  usePerformanceMonitoring();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider defaultOpen={true}>
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
                    <ProtectedRoute path="/settings" component={SettingsPage} />
                    <ProtectedRoute path="/settings/:section" component={SettingsPage} />

                    {/* Admin Routes */}
                    <ProtectedRoute path="/admin" component={AdminPage} requireAdmin />
                    <ProtectedRoute path="/admin/posts" component={AdminPosts} requireAdmin />
                    <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} requireAdmin />
                    <ProtectedRoute path="/admin/users" component={AdminUsers} requireAdmin />
                    <ProtectedRoute path="/admin/settings" component={AdminSettings} requireAdmin />

                    {/* 404 Route */}
                    <Route path="/:rest*">
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <h1 className="text-2xl">404 - Page Not Found</h1>
                      </div>
                    </Route>
                  </Switch>
                </main>
                <Footer />
                <Toaster />
                <CookieConsent />
              </div>
            </ErrorBoundary>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;