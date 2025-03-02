import React, { useEffect } from 'react';
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
import { initializeTheme, applyTheme } from './lib/theme-toggle'; // Added import

// Lazy load pages with proper error boundaries and suspense
const HomePage = React.lazy(() => import('./pages/home'));
const ReaderPage = React.lazy(() => import('./pages/reader'));
const StoriesPage = React.lazy(() => import('./pages/index'));
const AboutPage = React.lazy(() => import('./pages/about'));
const ContactPage = React.lazy(() => import('./pages/contact'));
const PrivacyPage = React.lazy(() => import('./pages/privacy'));
const ReportBugPage = React.lazy(() => import('./pages/report-bug'));
const AuthPage = React.lazy(() => import('./pages/auth'));

// Settings Pages
const ProfileSettingsPage = React.lazy(() => import('./pages/settings/profile'));
const ThemeSettingsPage = React.lazy(() => import('./pages/settings/theme'));
const FontSettingsPage = React.lazy(() => import('./pages/settings/fonts'));
const AccessibilitySettingsPage = React.lazy(() => import('./pages/settings/accessibility'));
const TextToSpeechPage = React.lazy(() => import('./pages/settings/text-to-speech'));
const DisplaySettingsPage = React.lazy(() => import('./pages/settings/display'));
const NotificationSettingsPage = React.lazy(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = React.lazy(() => import('./pages/settings/privacy'));
const ConnectedAccountsPage = React.lazy(() => import('./pages/settings/connected-accounts'));
const OfflineSettingsPage = React.lazy(() => import('./pages/settings/offline'));
const ContrastSettingsPage = React.lazy(() => import('./pages/settings/contrast'));
const QuickSettingsPage = React.lazy(() => import('./pages/settings/quick-settings'));
const PreviewSettingsPage = React.lazy(() => import('./pages/settings/preview'));

// Wrapper component for lazy-loaded routes with error handling
const LazyRoute: React.FC<{ 
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  params?: Record<string, any>;
}> = ({ 
  component: Component,
  params 
}) => {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <Component {...params} />
    </React.Suspense>
  );
};

function App() {
  usePerformanceMonitoring();

  useEffect(() => {
    // Initialize performance monitoring
    //initPerformanceMonitoring(); // Assuming this function exists elsewhere

    // Initialize theme
    const theme = initializeTheme();
    applyTheme(theme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider defaultOpen={true}>
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
                  <ErrorBoundary>
                    <Switch>
                      {/* Auth Routes */}
                      <Route path="/auth">{() => <LazyRoute component={AuthPage} />}</Route>
                      <Route path="/signin">{() => <LazyRoute component={AuthPage} />}</Route>
                      <Route path="/login">{() => <LazyRoute component={AuthPage} />}</Route>
                      <Route path="/signup">{() => <LazyRoute component={AuthPage} />}</Route>

                      {/* Public Routes */}
                      <Route path="/">{() => <LazyRoute component={HomePage} />}</Route>
                      <Route path="/stories">{() => <LazyRoute component={StoriesPage} />}</Route>
                      <Route path="/reader">{() => <LazyRoute component={ReaderPage} />}</Route>
                      <Route path="/story/:slug">
                        {(params) => <LazyRoute component={ReaderPage} params={{ slug: params.slug }} />}
                      </Route>
                      <Route path="/about">{() => <LazyRoute component={AboutPage} />}</Route>
                      <Route path="/contact">{() => <LazyRoute component={ContactPage} />}</Route>
                      <Route path="/report-bug">{() => <LazyRoute component={ReportBugPage} />}</Route>
                      <Route path="/privacy">{() => <LazyRoute component={PrivacyPage} />}</Route>

                      {/* Settings Routes */}
                      <Route path="/settings/profile">{() => <LazyRoute component={ProfileSettingsPage} />}</Route>
                      <Route path="/settings/theme">{() => <LazyRoute component={ThemeSettingsPage} />}</Route>
                      <Route path="/settings/fonts">{() => <LazyRoute component={FontSettingsPage} />}</Route>
                      <Route path="/settings/accessibility">{() => <LazyRoute component={AccessibilitySettingsPage} />}</Route>
                      <Route path="/settings/text-to-speech">{() => <LazyRoute component={TextToSpeechPage} />}</Route>
                      <Route path="/settings/display">{() => <LazyRoute component={DisplaySettingsPage} />}</Route>
                      <Route path="/settings/notifications">{() => <LazyRoute component={NotificationSettingsPage} />}</Route>
                      <Route path="/settings/privacy">{() => <LazyRoute component={PrivacySettingsPage} />}</Route>
                      <Route path="/settings/connected-accounts">{() => <LazyRoute component={ConnectedAccountsPage} />}</Route>
                      <Route path="/settings/offline">{() => <LazyRoute component={OfflineSettingsPage} />}</Route>
                      <Route path="/settings/contrast">{() => <LazyRoute component={ContrastSettingsPage} />}</Route>
                      <Route path="/settings/quick-settings">{() => <LazyRoute component={QuickSettingsPage} />}</Route>
                      <Route path="/settings/preview">{() => <LazyRoute component={PreviewSettingsPage} />}</Route>

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