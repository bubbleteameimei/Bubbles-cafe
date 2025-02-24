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

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/home'));
const ReaderPage = React.lazy(() => import('@/pages/reader'));
const StoriesPage = React.lazy(() => import('@/pages/secret-stories'));
const IndexPage = React.lazy(() => import('@/pages/index'));
const AboutPage = React.lazy(() => import('@/pages/about'));
const ContactPage = React.lazy(() => import('@/pages/contact'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard'));
const AdminAnalytics = React.lazy(() => import('@/pages/admin/analytics'));
const AdminUsers = React.lazy(() => import('@/pages/admin/users'));
const AdminSettings = React.lazy(() => import('@/pages/admin/settings'));
const AdminPosts = React.lazy(() => import('@/pages/admin/posts'));
const PrivacyPage = React.lazy(() => import('@/pages/privacy'));
const ReportBugPage = React.lazy(() => import('@/pages/report-bug'));
const CommunityPage = React.lazy(() => import('@/pages/community'));
const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'));
const AuthPage = React.lazy(() => import('@/pages/auth'));

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

  return <Route path={path} component={Component} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="relative min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-grow">
                <React.Suspense fallback={<LoadingScreen />}>
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
                </React.Suspense>
              </main>
              <Footer />
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