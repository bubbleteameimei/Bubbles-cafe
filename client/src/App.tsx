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

// Enhanced lazy loading with better error handling
const loadComponent = (importFn: () => Promise<any>) => {
  const Component = React.lazy(importFn);

  return (props: any) => (
    <React.Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    </React.Suspense>
  );
};

// Lazy load pages
const HomePage = loadComponent(() => import('./pages/home'));
const ReaderPage = loadComponent(() => import('./pages/reader'));
const StoriesPage = loadComponent(() => import('./pages/index'));
const AboutPage = loadComponent(() => import('./pages/about'));
const ContactPage = loadComponent(() => import('./pages/contact'));
const PrivacyPage = loadComponent(() => import('./pages/privacy'));
const ReportBugPage = loadComponent(() => import('./pages/report-bug'));
const FeedbackPage = loadComponent(() => import('./pages/support/feedback'));
const GuidelinesPage = loadComponent(() => import('./pages/support/guidelines'));
const CopyrightPage = loadComponent(() => import('./pages/legal/copyright'));
const TermsPage = loadComponent(() => import('./pages/legal/terms'));
const CookiePolicyPage = loadComponent(() => import('./pages/legal/cookie-policy'));

function App() {
  // Add performance monitoring
  usePerformanceMonitoring();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="relative min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-grow">
                <Switch>
                  {/* Public Routes */}
                  <Route path="/" component={HomePage} />
                  <Route path="/reader" component={ReaderPage} />
                  <Route path="/stories" component={StoriesPage} />

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
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;