import React from 'react';
import { Route, Switch } from 'wouter';
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

// Create a wrapper for lazy-loaded components
const withSuspense = <P extends object>(
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

// Settings Pages
const ProfileSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/profile')));
const ThemeSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/theme')));
const FontSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/fonts')));
const AccessibilitySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/accessibility')));
const TextToSpeechPage = withSuspense(React.lazy(() => import('./pages/settings/text-to-speech')));
const DisplaySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/display')));
const NotificationSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/notifications')));
const PrivacySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/privacy')));
const ConnectedAccountsPage = withSuspense(React.lazy(() => import('./pages/settings/connected-accounts')));
const OfflineSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/offline')));
const ContrastSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/contrast')));
const QuickSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/quick-settings')));
const PreviewSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/preview')));

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
                      {/* Auth Routes */}
                      <Route path="/auth" component={AuthPage} />
                      <Route path="/signin" component={AuthPage} />
                      <Route path="/login" component={AuthPage} />
                      <Route path="/signup" component={AuthPage} />

                      {/* Public Routes */}
                      <Route path="/" component={HomePage} />
                      <Route path="/stories" component={StoriesPage} />
                      <Route path="/reader" component={ReaderPage} />
                      <Route path="/story/:slug">
                        {params => <ReaderPage slug={params.slug} />}
                      </Route>
                      <Route path="/about" component={AboutPage} />
                      <Route path="/contact" component={ContactPage} />
                      <Route path="/report-bug" component={ReportBugPage} />
                      <Route path="/privacy" component={PrivacyPage} />

                      {/* Settings Routes */}
                      <Route path="/settings/profile" component={ProfileSettingsPage} />
                      <Route path="/settings/theme" component={ThemeSettingsPage} />
                      <Route path="/settings/fonts" component={FontSettingsPage} />
                      <Route path="/settings/accessibility" component={AccessibilitySettingsPage} />
                      <Route path="/settings/text-to-speech" component={TextToSpeechPage} />
                      <Route path="/settings/display" component={DisplaySettingsPage} />
                      <Route path="/settings/notifications" component={NotificationSettingsPage} />
                      <Route path="/settings/privacy" component={PrivacySettingsPage} />
                      <Route path="/settings/connected-accounts" component={ConnectedAccountsPage} />
                      <Route path="/settings/offline" component={OfflineSettingsPage} />
                      <Route path="/settings/contrast" component={ContrastSettingsPage} />
                      <Route path="/settings/quick-settings" component={QuickSettingsPage} />
                      <Route path="/settings/preview" component={PreviewSettingsPage} />

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