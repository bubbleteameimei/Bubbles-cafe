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
import { TutorialProvider } from '@/hooks/use-tutorial';
import { TutorialTooltip } from '@/components/ui/tutorial-tooltip';
import { ProtectedRoute } from '@/lib/protected-route';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/home'));
const ReaderPage = React.lazy(() => import('@/pages/reader'));
const StoriesPage = React.lazy(() => import('@/pages/secret-stories'));
const IndexPage = React.lazy(() => import('@/pages/index'));
const AboutPage = React.lazy(() => import('@/pages/about'));
const ContactPage = React.lazy(() => import('@/pages/contact'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard'));
const AuthPage = React.lazy(() => import('@/pages/auth'));
const PrivacyPage = React.lazy(() => import('@/pages/privacy'));
const ReportBugPage = React.lazy(() => import('@/pages/report-bug'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TutorialProvider>
            <div className="relative min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-grow">
                <React.Suspense fallback={<LoadingScreen />}>
                  <Switch>
                    {/* Public Routes */}
                    <Route path="/auth" component={AuthPage} />
                    <Route path="/about" component={AboutPage} />
                    <Route path="/privacy" component={PrivacyPage} />
                    <Route path="/contact" component={ContactPage} />

                    {/* Protected Routes */}
                    <ProtectedRoute path="/" component={HomePage} />
                    <ProtectedRoute path="/reader" component={ReaderPage} />
                    <ProtectedRoute path="/stories" component={StoriesPage} />
                    <ProtectedRoute path="/index" component={IndexPage} />
                    <ProtectedRoute path="/report-bug" component={ReportBugPage} />

                    {/* Admin Routes */}
                    <ProtectedRoute 
                      path="/admin/dashboard" 
                      component={AdminDashboard} 
                      requireAdmin={true} 
                    />

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
              <TutorialTooltip />
              <Toaster />
              <CookieConsent />
            </div>
          </TutorialProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;