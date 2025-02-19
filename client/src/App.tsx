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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col bg-background text-foreground">
            <Navigation />
            <main className="flex-grow">
              <React.Suspense fallback={<LoadingScreen />}>
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/reader" component={ReaderPage} />
                  <Route path="/stories" component={StoriesPage} />
                  <Route path="/index" component={IndexPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/contact" component={ContactPage} />
                  <Route path="/admin/dashboard" component={AdminDashboard} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/privacy" component={PrivacyPage} />
                </Switch>
              </React.Suspense>
            </main>
            <Footer />
            <Toaster />
            <CookieConsent />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;