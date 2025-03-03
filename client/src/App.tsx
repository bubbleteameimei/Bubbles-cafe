import React from 'react';
import { Route, Switch, RouteComponentProps } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/layout/navigation';
import Footer from './components/layout/footer';
import { ThemeProvider } from './lib/theme-provider';
import { AuthProvider } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { LoadingScreen } from './components/ui/loading-screen';
import { ErrorBoundary } from './components/ui/error-boundary';
import { usePerformanceMonitoring } from './hooks/use-performance-monitoring';
import { SidebarProvider } from './components/ui/sidebar';
import { ProtectedRoute } from './lib/protected-route';

// Create a wrapper for lazy-loaded components
const withSuspense = <P extends RouteComponentProps>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return function WithSuspenseWrapper(props: P) {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
};

// Lazy load pages
const HomePage = withSuspense(React.lazy(() => import('./pages/home')));
const ReaderPage = withSuspense(React.lazy(() => import('./pages/reader')));
const StoriesPage = withSuspense(React.lazy(() => import('./pages/index')));
const AboutPage = withSuspense(React.lazy(() => import('./pages/about')));
const ContactPage = withSuspense(React.lazy(() => import('./pages/contact')));
const PrivacyPage = withSuspense(React.lazy(() => import('./pages/privacy')));
const ReportBugPage = withSuspense(React.lazy(() => import('./pages/report-bug')));
const AuthPage = withSuspense(React.lazy(() => import('./pages/auth')));

// Legal Pages
const CopyrightPage = withSuspense(React.lazy(() => import('./pages/legal/copyright')));
const TermsPage = withSuspense(React.lazy(() => import('./pages/legal/terms')));
const CookiePolicyPage = withSuspense(React.lazy(() => import('./pages/legal/cookie-policy')));

// Community Pages
const CommunityPage = withSuspense(React.lazy(() => import('./pages/community')));
const FeedbackPage = withSuspense(React.lazy(() => import('./pages/feedback')));

// Settings Pages
const ProfileSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/profile')));
const ThemeSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/theme')));
const FontSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/fonts')));
const AccessibilitySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/accessibility')));
const DisplaySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/display')));
const NotificationSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/notifications')));
const PrivacySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/privacy')));
const OfflineSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/offline')));
const ContrastSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/contrast')));
const QuickSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/quick-settings')));
const PreviewSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/preview')));

// Admin Pages
const AdminPage = withSuspense(React.lazy(() => import('./pages/admin')));
const AdminAnalyticsPage = withSuspense(React.lazy(() => import('./pages/admin/analytics')));
const AdminUsersPage = withSuspense(React.lazy(() => import('./pages/admin/users')));
const AdminSettingsPage = withSuspense(React.lazy(() => import('./pages/admin/settings')));
const AdminPostsPage = withSuspense(React.lazy(() => import('./pages/admin/posts')));

function App() {
  usePerformanceMonitoring();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="relative min-h-screen bg-background">
              {/* Desktop Sidebar */}
              <aside className="fixed top-0 left-0 z-50 hidden h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block">
                <Navigation />
              </aside>

              {/* Mobile Navigation */}
              <Navigation />

              {/* Main Content */}
              <main className="min-h-screen lg:pl-64">
                <div className="container mx-auto px-4 py-6">
                  <ErrorBoundary>
                    <Switch>
                      {/* Public Routes */}
                      <Route path="/" component={HomePage} />
                      <Route path="/stories" component={StoriesPage} />
                      <Route path="/about" component={AboutPage} />
                      <Route path="/contact" component={ContactPage} />
                      <Route path="/auth" component={AuthPage} />
                      <Route path="/signin" component={AuthPage} />
                      <Route path="/login" component={AuthPage} />
                      <Route path="/signup" component={AuthPage} />
                      <Route path="/report-bug" component={ReportBugPage} />
                      <Route path="/privacy" component={PrivacyPage} />

                      {/* Legal Routes */}
                      <Route path="/legal/copyright" component={CopyrightPage} />
                      <Route path="/legal/terms" component={TermsPage} />
                      <Route path="/legal/cookie-policy" component={CookiePolicyPage} />

                      {/* Community Routes */}
                      <Route path="/community" component={CommunityPage} />
                      <Route path="/feedback" component={FeedbackPage} />

                      {/* Protected Routes */}
                      <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
                      <ProtectedRoute path="/settings/theme" component={ThemeSettingsPage} />
                      <ProtectedRoute path="/settings/fonts" component={FontSettingsPage} />
                      <ProtectedRoute path="/settings/accessibility" component={AccessibilitySettingsPage} />
                      <ProtectedRoute path="/settings/display" component={DisplaySettingsPage} />
                      <ProtectedRoute path="/settings/notifications" component={NotificationSettingsPage} />
                      <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />
                      <ProtectedRoute path="/settings/offline" component={OfflineSettingsPage} />
                      <ProtectedRoute path="/settings/contrast" component={ContrastSettingsPage} />
                      <ProtectedRoute path="/settings/quick-settings" component={QuickSettingsPage} />
                      <ProtectedRoute path="/settings/preview" component={PreviewSettingsPage} />

                      {/* Admin Routes */}
                      <ProtectedRoute path="/admin" component={AdminPage} requireAdmin />
                      <ProtectedRoute path="/admin/analytics" component={AdminAnalyticsPage} requireAdmin />
                      <ProtectedRoute path="/admin/users" component={AdminUsersPage} requireAdmin />
                      <ProtectedRoute path="/admin/posts" component={AdminPostsPage} requireAdmin />
                      <ProtectedRoute path="/admin/settings" component={AdminSettingsPage} requireAdmin />

                      {/* 404 Route */}
                      <Route>
                        {() => (
                          <div className="flex min-h-[60vh] items-center justify-center">
                            <h1 className="text-2xl">404 - Page Not Found</h1>
                          </div>
                        )}
                      </Route>
                    </Switch>
                  </ErrorBoundary>
                </div>
                <Footer />
              </main>

              {/* Global UI Elements */}
              <Toaster />
              <CookieConsent />
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;