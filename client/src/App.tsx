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

// Enhanced error boundary with better fallback UI
const LazyLoadErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-xl font-semibold mb-2">Unable to load page</h2>
        <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// Add logging to lazyLoad wrapper
const lazyLoad = (importFn: () => Promise<any>) => {
  const Component = React.lazy(() => {
    console.log('[LazyLoad] Loading component...');
    return importFn().then(module => {
      console.log('[LazyLoad] Component loaded successfully');
      return module;
    }).catch(error => {
      console.error('[LazyLoad] Failed to load component:', error);
      throw error;
    });
  });

  return (props: any) => (
    <LazyLoadErrorBoundary>
      <React.Suspense 
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingScreen />
          </div>
        }
      >
        <Component {...props} />
      </React.Suspense>
    </LazyLoadErrorBoundary>
  );
};

// Lazy load pages with proper error boundaries
const HomePage = lazyLoad(() => import('./pages/home'));
const ReaderPage = lazyLoad(() => import('./pages/reader'));
const StoriesPage = lazyLoad(() => import('./pages/index'));
const AboutPage = lazyLoad(() => import('./pages/about'));
const ContactPage = lazyLoad(() => import('./pages/contact'));
const PrivacyPage = lazyLoad(() => import('./pages/privacy'));
const ReportBugPage = lazyLoad(() => import('./pages/report-bug'));
const AuthPage = lazyLoad(() => import('./pages/auth'));

// Settings Pages
const ProfileSettingsPage = lazyLoad(() => import('./pages/settings/profile'));
const ThemeSettingsPage = lazyLoad(() => import('./pages/settings/theme'));
const FontSettingsPage = lazyLoad(() => import('./pages/settings/fonts'));
const AccessibilitySettingsPage = lazyLoad(() => import('./pages/settings/accessibility'));
const TextToSpeechPage = lazyLoad(() => import('./pages/settings/text-to-speech'));
const DisplaySettingsPage = lazyLoad(() => import('./pages/settings/display'));
const NotificationSettingsPage = lazyLoad(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = lazyLoad(() => import('./pages/settings/privacy'));
const ConnectedAccountsPage = lazyLoad(() => import('./pages/settings/connected-accounts'));
const OfflineSettingsPage = lazyLoad(() => import('./pages/settings/offline'));
const ContrastSettingsPage = lazyLoad(() => import('./pages/settings/contrast'));
const QuickSettingsPage = lazyLoad(() => import('./pages/settings/quick-settings'));
const PreviewSettingsPage = lazyLoad(() => import('./pages/settings/preview'));

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
                        {(params) => <ReaderPage slug={params.slug} />}
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