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

// Lazy load pages
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

// Route Components
const RouteComponent: React.FC<{ component: React.LazyExoticComponent<any> }> = ({ component: Component }) => (
  <Component />
);

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
                <SidebarNavigation />
              </aside>

              {/* Mobile Navigation */}
              <Navigation />

              {/* Main Content */}
              <main className="min-h-screen lg:pl-64">
                <div className="container mx-auto px-4 py-6">
                  <ErrorBoundary>
                    <React.Suspense fallback={<LoadingScreen />}>
                      <Switch>
                        {/* Auth Routes */}
                        <Route path="/auth">
                          <RouteComponent component={AuthPage} />
                        </Route>
                        <Route path="/signin">
                          <RouteComponent component={AuthPage} />
                        </Route>
                        <Route path="/login">
                          <RouteComponent component={AuthPage} />
                        </Route>
                        <Route path="/signup">
                          <RouteComponent component={AuthPage} />
                        </Route>

                        {/* Public Routes */}
                        <Route path="/">
                          <RouteComponent component={HomePage} />
                        </Route>
                        <Route path="/stories">
                          <RouteComponent component={StoriesPage} />
                        </Route>
                        <Route path="/reader">
                          <RouteComponent component={ReaderPage} />
                        </Route>
                        <Route path="/story/:slug">
                          <RouteComponent component={ReaderPage} />
                        </Route>
                        <Route path="/about">
                          <RouteComponent component={AboutPage} />
                        </Route>
                        <Route path="/contact">
                          <RouteComponent component={ContactPage} />
                        </Route>
                        <Route path="/report-bug">
                          <RouteComponent component={ReportBugPage} />
                        </Route>
                        <Route path="/privacy">
                          <RouteComponent component={PrivacyPage} />
                        </Route>

                        {/* Settings Routes */}
                        <Route path="/settings/profile">
                          <RouteComponent component={ProfileSettingsPage} />
                        </Route>
                        <Route path="/settings/theme">
                          <RouteComponent component={ThemeSettingsPage} />
                        </Route>
                        <Route path="/settings/fonts">
                          <RouteComponent component={FontSettingsPage} />
                        </Route>
                        <Route path="/settings/accessibility">
                          <RouteComponent component={AccessibilitySettingsPage} />
                        </Route>
                        <Route path="/settings/text-to-speech">
                          <RouteComponent component={TextToSpeechPage} />
                        </Route>
                        <Route path="/settings/display">
                          <RouteComponent component={DisplaySettingsPage} />
                        </Route>
                        <Route path="/settings/notifications">
                          <RouteComponent component={NotificationSettingsPage} />
                        </Route>
                        <Route path="/settings/privacy">
                          <RouteComponent component={PrivacySettingsPage} />
                        </Route>
                        <Route path="/settings/connected-accounts">
                          <RouteComponent component={ConnectedAccountsPage} />
                        </Route>
                        <Route path="/settings/offline">
                          <RouteComponent component={OfflineSettingsPage} />
                        </Route>
                        <Route path="/settings/contrast">
                          <RouteComponent component={ContrastSettingsPage} />
                        </Route>
                        <Route path="/settings/quick-settings">
                          <RouteComponent component={QuickSettingsPage} />
                        </Route>
                        <Route path="/settings/preview">
                          <RouteComponent component={PreviewSettingsPage} />
                        </Route>

                        {/* 404 Route */}
                        <Route>
                          <div className="flex min-h-[60vh] items-center justify-center">
                            <h1 className="text-2xl">404 - Page Not Found</h1>
                          </div>
                        </Route>
                      </Switch>
                    </React.Suspense>
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