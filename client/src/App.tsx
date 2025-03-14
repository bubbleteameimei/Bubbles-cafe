import React, { useState, useEffect } from 'react';
import { Route, Switch, RouteComponentProps, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/layout/navigation';
import Footer from './components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { LoadingScreen } from './components/ui/loading-screen';
import { ErrorBoundary } from './components/ui/error-boundary';
import { usePerformanceMonitoring } from './hooks/use-performance-monitoring';
import { SidebarProvider } from './components/ui/sidebar';
import { ProtectedRoute } from './lib/protected-route';
import ScrollToTopButton from './components/ScrollToTopButton';
import PageTransition from './components/PageTransition';
import AnimatedSidebar from './components/layout/AnimatedSidebar';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';

import AutoHideNavbar from './components/layout/AutoHideNavbar';
import FullscreenButton from './components/FullscreenButton';
import SearchBar from './components/SearchBar';
import { NotificationProvider } from './components/NotificationProvider';
import { NotificationIcon } from './components/ui/notification-icon';
import SidebarHeader from './components/SidebarHeader';
import { PrimaryNav } from './components/primary-nav';

// Create a wrapper for lazy-loaded components that properly handles props
// Since this is a TypeScript issue that doesn't affect functionality,
// we're using a simpler implementation that works in practice
const withSuspense = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<any>>
) => {
  return function WithSuspenseWrapper(props: any) {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        {/* @ts-ignore - This works in practice but has TypeScript issues */}
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
const ContentTestPage = withSuspense(React.lazy(() => import('./pages/content-test')));
const BookmarksPage = withSuspense(React.lazy(() => import('./pages/bookmarks')));
const TestDialogPage = withSuspense(React.lazy(() => import('./components/test-dialog')));


// Legal Pages
const CopyrightPage = withSuspense(React.lazy(() => import('./pages/legal/copyright')));
const TermsPage = withSuspense(React.lazy(() => import('./pages/legal/terms')));
const CookiePolicyPage = withSuspense(React.lazy(() => import('./pages/legal/cookie-policy')));

// Community Pages
const CommunityPage = withSuspense(React.lazy(() => import('./pages/community')));
const FeedbackPage = withSuspense(React.lazy(() => import('./pages/feedback')));

// Settings Pages
const ProfileSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/profile')));
const ConnectedAccountsPage = withSuspense(React.lazy(() => import('./pages/settings/connected-accounts')));
const TextToSpeechPage = withSuspense(React.lazy(() => import('./pages/settings/text-to-speech')));
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
const AdminFeedbackPage = withSuspense(React.lazy(() => import('./pages/admin/feedback')));
const AdminBugReportsPage = withSuspense(React.lazy(() => import('./pages/admin/bug-reports')));

function App() {
  usePerformanceMonitoring();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SidebarProvider defaultOpen={true}>
              <div className="relative min-h-screen bg-background">
                {/* Desktop Sidebar */}
                <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden lg:block">
                  <SidebarHeader />
                  <Navigation />
                </aside>

                {/* Main Content */}
                <main className="min-h-screen lg:ml-64">
                  <AutoHideNavbar />
                  <div className="container mx-auto px-4 py-6 pt-20 lg:pt-6">
                    <ErrorBoundary>
                      <PageTransition mode="fade" duration={0.4}>
                        <Switch>
                          {/* Auth Routes */}
                          <Route path="/auth" component={AuthPage} />
                          <Route path="/signin" component={AuthPage} />
                          <Route path="/login" component={AuthPage} />
                          <Route path="/signup" component={AuthPage} />

                          {/* Public Routes */}
                          <Route path="/" component={HomePage} />
                          <Route path="/stories" component={StoriesPage} />
                          <Route path="/reader/:slug?" component={ReaderPage} />
                          <Route path="/about" component={AboutPage} />
                          <Route path="/contact" component={ContactPage} />
                          <Route path="/report-bug" component={ReportBugPage} />
                          <Route path="/privacy" component={PrivacyPage} />
                          <Route path="/content-test" component={ContentTestPage} />
                          <Route path="/test-dialog" component={TestDialogPage} />
                          <ProtectedRoute path="/bookmarks" component={BookmarksPage} />


                          {/* Legal Routes */}
                          <Route path="/legal/copyright" component={CopyrightPage} />
                          <Route path="/legal/terms" component={TermsPage} />
                          <Route path="/legal/cookie-policy" component={CookiePolicyPage} />

                          {/* Community Routes */}
                          <Route path="/community" component={CommunityPage} />
                          <Route path="/feedback" component={FeedbackPage} />

                          {/* Settings Routes */}
                          <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
                          <ProtectedRoute path="/settings/connected-accounts" component={ConnectedAccountsPage} />
                          <ProtectedRoute path="/settings/text-to-speech" component={TextToSpeechPage} />
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
                          <ProtectedRoute path="/admin/feedback" component={AdminFeedbackPage} requireAdmin />
                          <ProtectedRoute path="/admin/bug-reports" component={AdminBugReportsPage} requireAdmin />

                          {/* 404 Route */}
                          <Route>
                            {() => (
                              <div className="flex min-h-[60vh] items-center justify-center">
                                <h1 className="text-2xl">404 - Page Not Found</h1>
                              </div>
                            )}
                          </Route>
                        </Switch>
                      </PageTransition>
                    </ErrorBoundary>
                  </div>
                  <Footer />
                </main>

                {/* Global UI Elements */}
                <Toaster />
                <CookieConsent />
                <ScrollToTopButton />
              </div>
            </SidebarProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;