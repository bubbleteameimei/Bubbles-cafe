import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { SidebarNavigation } from './components/ui/sidebar-menu';
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

// Lazy load pages
const HomePage = React.lazy(() => {
  console.log('[App] Loading HomePage');
  return import('./pages/home');
});
const ReaderPage = React.lazy(() => import('./pages/reader'));
const StoriesPage = React.lazy(() => import('./pages/index'));
const AboutPage = React.lazy(() => import('./pages/about'));
const ContactPage = React.lazy(() => import('./pages/contact'));
const PrivacyPage = React.lazy(() => import('./pages/privacy'));
const ReportBugPage = React.lazy(() => import('./pages/report-bug'));
const FeedbackPage = React.lazy(() => import('./pages/support/feedback'));
const GuidelinesPage = React.lazy(() => import('./pages/support/guidelines'));
const CopyrightPage = React.lazy(() => import('./pages/legal/copyright'));
const TermsPage = React.lazy(() => import('./pages/legal/terms'));
const CookiePolicyPage = React.lazy(() => import('./pages/legal/cookie-policy'));

// Settings Pages
const ProfileSettingsPage = React.lazy(() => {
  console.log('[App] Loading ProfileSettingsPage');
  return import('./pages/settings/profile');
});
const ThemeSettingsPage = React.lazy(() => import('./pages/settings/theme'));
const FontSettingsPage = React.lazy(() => import('./pages/settings/fonts'));
const TextToSpeechPage = React.lazy(() => import('./pages/settings/text-to-speech'));
const NotificationSettingsPage = React.lazy(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = React.lazy(() => import('./pages/settings/privacy'));
const AccessibilitySettingsPage = React.lazy(() => import('./pages/settings/accessibility'));
const OfflineSettingsPage = React.lazy(() => import('./pages/settings/offline'));

function App() {
  console.log('[App] Initializing application');
  usePerformanceMonitoring();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider defaultOpen={true}>
            {/* Main Layout Container */}
            <div className="relative min-h-screen bg-background">
              {/* Desktop Sidebar */}
              <aside className="fixed top-0 left-0 z-50 hidden h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block">
                <SidebarNavigation />
              </aside>

              {/* Mobile Navigation */}
              <Navigation />

              {/* Main Content */}
              <main className="min-h-screen lg:pl-64">
                <div className="container mx-auto px-4 py-6">
                  <React.Suspense fallback={<LoadingScreen />}>
                    <ErrorBoundary>
                      <Switch>
                        {/* Public Routes */}
                        <Route path="/" component={HomePage} />
                        <Route path="/reader" component={ReaderPage} />
                        <Route path="/stories" component={StoriesPage} />

                        {/* Protected Settings Routes */}
                        <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
                        <ProtectedRoute path="/settings/theme" component={ThemeSettingsPage} />
                        <ProtectedRoute path="/settings/fonts" component={FontSettingsPage} />
                        <ProtectedRoute path="/settings/text-to-speech" component={TextToSpeechPage} />
                        <ProtectedRoute path="/settings/accessibility" component={AccessibilitySettingsPage} />
                        <ProtectedRoute path="/settings/notifications" component={NotificationSettingsPage} />
                        <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />
                        <ProtectedRoute path="/settings/offline" component={OfflineSettingsPage} />

                        {/* Support Pages */}
                        <Route path="/about" component={AboutPage} />
                        <Route path="/contact" component={ContactPage} />
                        <Route path="/report-bug" component={ReportBugPage} />
                        <Route path="/support/feedback" component={FeedbackPage} />
                        <Route path="/support/guidelines" component={GuidelinesPage} />

                        {/* Legal Pages */}
                        <Route path="/privacy" component={PrivacyPage} />
                        <Route path="/legal/copyright" component={CopyrightPage} />
                        <Route path="/legal/terms" component={TermsPage} />
                        <Route path="/legal/cookie-policy" component={CookiePolicyPage} />

                        {/* 404 Route */}
                        <Route path="/:rest*">
                          <div className="flex min-h-[60vh] items-center justify-center">
                            <h1 className="text-2xl">404 - Page Not Found</h1>
                          </div>
                        </Route>
                      </Switch>
                    </ErrorBoundary>
                  </React.Suspense>
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