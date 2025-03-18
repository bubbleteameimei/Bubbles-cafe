import React, { useState, useEffect } from 'react';
import { Route, Switch, RouteComponentProps, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { Sonner } from './components/ui/sonner';
import Navigation from './components/layout/navigation';
import Footer from './components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { CookieConsentProvider } from './hooks/use-cookie-consent';
import { LoadingScreen } from './components/ui/loading-screen';
import { ErrorBoundary } from './components/ui/error-boundary';
import { usePerformanceMonitoring } from './hooks/use-performance-monitoring';
import { SidebarProvider } from './components/ui/sidebar';
import { ProtectedRoute } from './lib/protected-route';
import ScrollToTopButton from './components/ScrollToTopButton';
import PageTransition from './components/PageTransition';
import { EnhancedPageTransition } from './components/enhanced-page-transition';
import AnimatedSidebar from './components/layout/AnimatedSidebar';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
// Import SidebarNavigation directly from sidebar-menu
import { SidebarNavigation } from './components/ui/sidebar-menu';
// Import the global loading provider
import { LoadingProvider } from './contexts/loading-context';
// Import ApiLoader for Suspense fallback
import ApiLoader from './components/api-loader';
// Import GlobalLoadingOverlay and Registry
import { GlobalLoadingOverlay, GlobalLoadingRegistry } from './components/GlobalLoadingOverlay';

import AutoHideNavbar from './components/layout/AutoHideNavbar';
import FullscreenButton from './components/FullscreenButton';
import SearchBar from './components/SearchBar';
import { NotificationProvider } from './components/NotificationProvider';
import { NotificationIcon } from './components/ui/notification-icon';
import SidebarHeader from './components/SidebarHeader';
import { PrimaryNav } from './components/primary-nav';

// Create a wrapper for lazy-loaded components that properly handles props
// This version fixes the component stack issues and improves error handling
const withSuspense = <P extends Record<string, any>>(
  Component: React.LazyExoticComponent<React.ComponentType<any>>
): React.FC<P> => {
  // Create a named wrapper component to improve debugging in component stack traces
  const WithSuspenseWrapper: React.FC<P> = (props) => {
    // Handle potential errors in suspense rendering
    const renderSuspendedComponent = () => {
      try {
        // For routes with params, ensure they're passed correctly
        return <Component {...props} />;
      } catch (error) {
        console.error("Error rendering lazy component:", error);
        return (
          <div className="p-4 m-4 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
            <h3 className="text-lg font-medium">Component Error</h3>
            <p className="text-sm mt-1">Error loading component: {String(error)}</p>
          </div>
        );
      }
    };

    // The key to making the loading screen show above everything is making sure it's rendered
    // directly in the DOM, outside of any layout containers that might cause z-index stacking issues
    return (
      <ErrorBoundary
        fallback={
          <div className="p-4 m-4 rounded-md bg-red-50 border border-red-200 text-red-700">
            <h3 className="text-lg font-medium">Failed to load component</h3>
            <p className="text-sm mt-1">The page component could not be loaded. Please try refreshing.</p>
          </div>
        }
      >
        <React.Suspense 
          fallback={
            <ApiLoader 
              isLoading={true}
              minimumLoadTime={800}
              debug={true}
            >
              <div aria-hidden="true" className="h-[300px] w-full"></div>
            </ApiLoader>
          }
        >
          {renderSuspendedComponent()}
        </React.Suspense>
      </ErrorBoundary>
    );
  };
  
  // Set display name for better debugging
  WithSuspenseWrapper.displayName = "WithSuspense";
  
  return WithSuspenseWrapper;
};

// Import critical reading components directly for immediate loading
import ReaderPage from './pages/reader';

// Lazy load non-critical pages
const HomePage = withSuspense(React.lazy(() => import('./pages/home')));
const StoriesPage = withSuspense(React.lazy(() => import('./pages/index')));
const AboutPage = withSuspense(React.lazy(() => import('./pages/about')));
const ContactPage = withSuspense(React.lazy(() => import('./pages/contact')));
const PrivacyPage = withSuspense(React.lazy(() => import('./pages/privacy')));
const ReportBugPage = withSuspense(React.lazy(() => import('./pages/report-bug')));
const AuthPage = withSuspense(React.lazy(() => import('./pages/auth')));
const ContentTestPage = withSuspense(React.lazy(() => import('./pages/content-test')));
const BookmarksPage = withSuspense(React.lazy(() => import('./pages/bookmarks')));
const SearchPage = withSuspense(React.lazy(() => import('./pages/search')));
const FeatureShowcasePage = withSuspense(React.lazy(() => import('./pages/feature-showcase')));

// Error Pages
const Error403Page = withSuspense(React.lazy(() => import('./pages/errors/403')));
const Error404Page = withSuspense(React.lazy(() => import('./pages/errors/404')));
const Error429Page = withSuspense(React.lazy(() => import('./pages/errors/429')));
const Error500Page = withSuspense(React.lazy(() => import('./pages/errors/500')));
const Error503Page = withSuspense(React.lazy(() => import('./pages/errors/503')));
const Error504Page = withSuspense(React.lazy(() => import('./pages/errors/504')));

// Demo Pages
const ToastDemoPage = withSuspense(React.lazy(() => import('./pages/demo/toast-demo')));
const ToastDocsPage = withSuspense(React.lazy(() => import('./pages/demo/toast-docs')));
const ToastTestPage = withSuspense(React.lazy(() => import('./pages/toast-test')));
const ChartDashboardPage = withSuspense(React.lazy(() => import('./pages/chart-dashboard')));
const SwitchTestPage = withSuspense(React.lazy(() => import('./pages/switch-test')));
const ToggleComparisonPage = withSuspense(React.lazy(() => import('./pages/toggle-comparison')));
const TestRecommendationsPage = withSuspense(React.lazy(() => import('./pages/test-recommendations')));

// Legal Pages
const CopyrightPage = withSuspense(React.lazy(() => import('./pages/legal/copyright')));
const TermsPage = withSuspense(React.lazy(() => import('./pages/legal/terms')));
const CookiePolicyPage = withSuspense(React.lazy(() => import('./pages/legal/cookie-policy')));

// Community Pages
const CommunityPage = withSuspense(React.lazy(() => import('./pages/community')));
const FeedbackPage = withSuspense(React.lazy(() => import('./pages/feedback')));
const UserFeedbackDashboardPage = withSuspense(React.lazy(() => import('./pages/user/feedback-dashboard')));
const GuidelinesPage = withSuspense(React.lazy(() => import('./pages/support/guidelines')));

// Settings Pages
const ProfileSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/profile')));
const ConnectedAccountsPage = withSuspense(React.lazy(() => import('./pages/settings/connected-accounts')));
const TextToSpeechPage = withSuspense(React.lazy(() => import('./pages/settings/text-to-speech')));
const FontSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/fonts')));
const AccessibilitySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/accessibility')));
const AccessibilityTestPage = withSuspense(React.lazy(() => import('./pages/accessibility-test')));
const DisplaySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/display')));
const NotificationSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/notifications')));
const PrivacySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/privacy')));
// Removed offline settings page import
const QuickSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/quick-settings')));
const PreviewSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/preview')));

// Admin Pages
const AdminPage = withSuspense(React.lazy(() => import('./pages/admin')));
const AdminAnalyticsPage = withSuspense(React.lazy(() => import('./pages/admin/analytics')));
const AdminAnalyticsDashboardPage = withSuspense(React.lazy(() => import('./pages/admin/analytics-dashboard')));
const AdminUsersPage = withSuspense(React.lazy(() => import('./pages/admin/users')));
const AdminSettingsPage = withSuspense(React.lazy(() => import('./pages/admin/settings')));
const AdminPostsPage = withSuspense(React.lazy(() => import('./pages/admin/posts')));
const AdminManagePostsPage = withSuspense(React.lazy(() => import('./pages/admin/manage-posts')));
const AdminFeedbackPage = withSuspense(React.lazy(() => import('./pages/admin/feedback')));
const AdminFeedbackReviewPage = withSuspense(React.lazy(() => import('./pages/admin/feedback-review')));
const AdminBugReportsPage = withSuspense(React.lazy(() => import('./pages/admin/bug-reports')));
const AdminContentModerationPage = withSuspense(React.lazy(() => import('./pages/admin/content-moderation')));
const AdminContentPage = withSuspense(React.lazy(() => import('./pages/admin/content')));
const AdminDashboardPage = withSuspense(React.lazy(() => import('./pages/admin/dashboard')));
const AdminSiteStatisticsPage = withSuspense(React.lazy(() => import('./pages/admin/site-statistics')));
const CookieTestPage = withSuspense(React.lazy(() => import('./pages/cookie-test')));
const ResetPasswordPage = withSuspense(React.lazy(() => import('./pages/reset-password')));

const AppContent = () => {
  const { user, logoutMutation } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const locationStr = location.toString();
  
  // Check if current route is an error page
  const isErrorPage = 
    locationStr.includes('/errors/403') || 
    locationStr.includes('/errors/404') || 
    locationStr.includes('/errors/429') || 
    locationStr.includes('/errors/500') || 
    locationStr.includes('/errors/503') || 
    locationStr.includes('/errors/504');
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // If we're on an error page, render only the error page without layout
  if (isErrorPage) {
    return (
      <ErrorBoundary>
        <Switch>
          <Route path="/errors/403" component={Error403Page} />
          <Route path="/errors/404" component={Error404Page} />
          <Route path="/errors/429" component={Error429Page} />
          <Route path="/errors/500" component={Error500Page} />
          <Route path="/errors/503" component={Error503Page} />
          <Route path="/errors/504" component={Error504Page} />
        </Switch>
      </ErrorBoundary>
    );
  }
  
  // For all other pages, render with normal layout
  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-40 h-screen w-64 hidden lg:block overflow-hidden">
        <div className="h-full w-full">
          <div className="h-[56px] px-4 flex items-center border-b border-border bg-background">
            <h1 className="text-foreground font-medium text-lg">Stories</h1>
          </div>
          <SidebarNavigation onNavigate={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        <AutoHideNavbar />
        <div className="container mx-auto px-4 py-6 pt-20 lg:pt-6">
          <ErrorBoundary>
            <EnhancedPageTransition transitionDuration={400}>
              <Switch>
                {/* Auth Routes */}
                <Route path="/auth" component={AuthPage} />
                <Route path="/signin" component={AuthPage} />
                <Route path="/login" component={AuthPage} />
                <Route path="/signup" component={AuthPage} />
                <Route path="/reset-password" component={ResetPasswordPage} />

                {/* Public Routes */}
                <Route path="/" component={HomePage} />
                <Route path="/stories" component={StoriesPage} />
                <Route path="/reader/:slug?">
                  {(params) => <ReaderPage params={params} />}
                </Route>
                <Route path="/about" component={AboutPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/report-bug" component={ReportBugPage} />
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/content-test" component={ContentTestPage} />
                <Route path="/bookmarks" component={BookmarksPage} />
                <Route path="/cookie-test" component={CookieTestPage} />
                <Route path="/demo/toast" component={ToastDemoPage} />
                <Route path="/demo/toast-docs" component={ToastDocsPage} />
                <Route path="/toast-test" component={ToastTestPage} />
                <Route path="/charts" component={ChartDashboardPage} />
                <Route path="/switch-test" component={SwitchTestPage} />
                <Route path="/toggle-comparison" component={ToggleComparisonPage} />
                <Route path="/accessibility-test" component={AccessibilityTestPage} />
                <Route path="/search" component={SearchPage} />
                <Route path="/features" component={FeatureShowcasePage} />
                <Route path="/test-recommendations" component={TestRecommendationsPage} />

                {/* Legal Routes */}
                <Route path="/legal/copyright" component={CopyrightPage} />
                <Route path="/legal/terms" component={TermsPage} />
                <Route path="/legal/cookie-policy" component={CookiePolicyPage} />

                {/* Community Routes */}
                <Route path="/community" component={CommunityPage} />
                <Route path="/feedback" component={FeedbackPage} />
                <ProtectedRoute path="/feedback/dashboard" component={UserFeedbackDashboardPage} />
                <Route path="/support/guidelines" component={GuidelinesPage} />
                
                {/* Settings Routes */}
                <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
                <ProtectedRoute path="/settings/connected-accounts" component={ConnectedAccountsPage} />
                <ProtectedRoute path="/settings/text-to-speech" component={TextToSpeechPage} />
                <Route path="/settings/fonts" component={FontSettingsPage} />
                <Route path="/settings/accessibility" component={AccessibilitySettingsPage} />
                <Route path="/settings/display" component={DisplaySettingsPage} />
                <ProtectedRoute path="/settings/notifications" component={NotificationSettingsPage} />
                <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />

                <ProtectedRoute path="/settings/quick-settings" component={QuickSettingsPage} />
                <ProtectedRoute path="/settings/preview" component={PreviewSettingsPage} />

                {/* Admin Routes */}
                <ProtectedRoute path="/admin" component={AdminPage} requireAdmin />
                <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} requireAdmin />
                <ProtectedRoute path="/admin/analytics" component={AdminAnalyticsPage} requireAdmin />
                <ProtectedRoute path="/admin/analytics-dashboard" component={AdminAnalyticsDashboardPage} requireAdmin />
                <ProtectedRoute path="/admin/users" component={AdminUsersPage} requireAdmin />
                <ProtectedRoute path="/admin/stories" component={AdminPostsPage} requireAdmin />
                <ProtectedRoute path="/admin/posts" component={AdminPostsPage} requireAdmin />
                <ProtectedRoute path="/admin/manage-posts" component={AdminManagePostsPage} requireAdmin />
                <ProtectedRoute path="/admin/settings" component={AdminSettingsPage} requireAdmin />
                <ProtectedRoute path="/admin/feedback" component={AdminFeedbackPage} requireAdmin />
                <ProtectedRoute path="/admin/feedback-review" component={AdminFeedbackReviewPage} requireAdmin />
                <ProtectedRoute path="/admin/bug-reports" component={AdminBugReportsPage} requireAdmin />
                <ProtectedRoute path="/admin/content-moderation" component={AdminContentModerationPage} requireAdmin />
                <ProtectedRoute path="/admin/content" component={AdminContentPage} requireAdmin />
                <ProtectedRoute path="/admin/site-statistics" component={AdminSiteStatisticsPage} requireAdmin />

                {/* 404 Route */}
                <Route>
                  {() => (
                    <div className="flex min-h-[60vh] items-center justify-center">
                      <h1 className="text-2xl">404 - Page Not Found</h1>
                    </div>
                  )}
                </Route>
              </Switch>
            </EnhancedPageTransition>
          </ErrorBoundary>
        </div>
        <Footer />
      </main>

      {/* Global UI Elements */}
      <Toaster />
      <Sonner />
      <CookieConsent />
      <ScrollToTopButton />
    </div>
  );
};

function App() {
  usePerformanceMonitoring();

  // Detect touch capability and add appropriate class to body
  useEffect(() => {
    const isTouchDevice = () => {
      return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
    };
    
    if (isTouchDevice()) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.add('no-touch');
    }
    
    return () => {
      document.body.classList.remove('touch-device');
      document.body.classList.remove('no-touch');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CookieConsentProvider>
            <NotificationProvider>
              <LoadingProvider>
                <GlobalLoadingOverlay
                  minimumLoadingDuration={800}
                  debugMode={true}
                >
                  <GlobalLoadingRegistry />
                  <SidebarProvider defaultOpen={true}>
                    <AppContent />
                  </SidebarProvider>
                </GlobalLoadingOverlay>
              </LoadingProvider>
            </NotificationProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;