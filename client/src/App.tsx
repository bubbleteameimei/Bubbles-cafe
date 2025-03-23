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
// Import commented out as component doesn't exist yet
// import AnimatedSidebar from './components/layout/AnimatedSidebar';
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
// Import global loading manager functions
import { hideGlobalLoading } from '@/utils/global-loading-manager';
// Import WordPress API preload function for enhanced reliability
import { preloadWordPressPosts } from './lib/wordpress-api';
// Import WordPress sync service
import { initWordPressSync } from './lib/wordpress-sync';
// Import FeedbackButton component for site-wide feedback
import { FeedbackButton } from './components/feedback/FeedbackButton';


import AutoHideNavbar from './components/layout/AutoHideNavbar';
import FullscreenButton from './components/FullscreenButton';
import SearchBar from './components/SearchBar';
import { NotificationProvider } from './components/NotificationProvider';
import { NotificationIcon } from './components/ui/notification-icon';
import SidebarHeader from './components/SidebarHeader';
import { PrimaryNav } from './components/primary-nav';
import ErrorToastProvider from './components/providers/error-toast-provider';
import NotFoundRouteHandler from './components/NotFoundRouteHandler';

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
              maximumLoadTime={3000} // 3 seconds maximum to prevent endless loading
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
const ResponsiveDemoPage = withSuspense(React.lazy(() => import('./pages/responsive-demo')));
const HomePage = withSuspense(React.lazy(() => import('./pages/home')));
const StoriesPage = withSuspense(React.lazy(() => import('./pages/index')));
const AboutPage = withSuspense(React.lazy(() => import('./pages/about')));
const ContactPage = withSuspense(React.lazy(() => import('./pages/contact')));
const PrivacyPage = withSuspense(React.lazy(() => import('./pages/privacy')));
const ReportBugPage = withSuspense(React.lazy(() => import('./pages/report-bug')));
const AuthPage = withSuspense(React.lazy(() => import('./pages/auth')));
const AuthSuccessPage = withSuspense(React.lazy(() => import('./pages/auth-success')));
const ProfilePage = withSuspense(React.lazy(() => import('./pages/profile')));
// Removed ContentTestPage
const BookmarksPage = withSuspense(React.lazy(() => import('./pages/bookmarks')));



// Error Pages
const Error403Page = withSuspense(React.lazy(() => import('./pages/errors/403')));
const Error404Page = withSuspense(React.lazy(() => import('./pages/errors/404')));
const Error429Page = withSuspense(React.lazy(() => import('./pages/errors/429')));
const Error500Page = withSuspense(React.lazy(() => import('./pages/errors/500')));
const Error503Page = withSuspense(React.lazy(() => import('./pages/errors/503')));
const Error504Page = withSuspense(React.lazy(() => import('./pages/errors/504')));

// Demo Pages - All Removed
// const ToastDemoPage = withSuspense(React.lazy(() => import('./pages/demo/toast-demo')));
// const ToastDocsPage = withSuspense(React.lazy(() => import('./pages/demo/toast-docs')));
// const ToastTestPage = withSuspense(React.lazy(() => import('./pages/toast-test')));
// const ChartDashboardPage = withSuspense(React.lazy(() => import('./pages/chart-dashboard')));
// const SwitchTestPage = withSuspense(React.lazy(() => import('./pages/switch-test')));
// const ToggleComparisonPage = withSuspense(React.lazy(() => import('./pages/toggle-comparison')));
// const TestRecommendationsPage = withSuspense(React.lazy(() => import('./pages/test-recommendations')));

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
// Removed TextToSpeechPage
const FontSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/fonts')));
const AccessibilitySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/accessibility')));
// Removed AccessibilityTestPage
// DisplaySettingsPage removed
const NotificationSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/notifications')));
const PrivacySettingsPage = withSuspense(React.lazy(() => import('./pages/settings/privacy')));
const DataExportPage = withSuspense(React.lazy(() => import('./pages/settings/data-export')));
const CookieManagementPage = withSuspense(React.lazy(() => import('./pages/settings/cookie-management')));
// Removed offline settings page import
const QuickSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/quick-settings')));
const PreviewSettingsPage = withSuspense(React.lazy(() => import('./pages/settings/preview')));

// Game Pages
const EdenGamePage = withSuspense(React.lazy(() => import('./pages/games/eden')));
const EdenCanvasGamePage = withSuspense(React.lazy(() => import('./pages/games/eden-game')));
const EdenGameNewPage = withSuspense(React.lazy(() => import('./pages/games/eden-game-new')));
const GameTestPage = withSuspense(React.lazy(() => import('./pages/game-test')));

// Admin Pages
const AdminPage = withSuspense(React.lazy(() => import('./pages/admin')));
const AdminAnalyticsPage = withSuspense(React.lazy(() => import('./pages/admin/analytics')));
const AdminAnalyticsDashboardPage = withSuspense(React.lazy(() => import('./pages/admin/analytics-dashboard')));
const AdminUsersPage = withSuspense(React.lazy(() => import('./pages/admin/users')));
const AdminSettingsPage = withSuspense(React.lazy(() => import('./pages/admin/settings')));
const AdminPostsPage = withSuspense(React.lazy(() => import('./pages/admin/posts')));
const AdminManagePostsPage = withSuspense(React.lazy(() => import('./pages/admin/manage-posts')));
const AdminFeedbackPage = withSuspense(React.lazy(() => import('./pages/admin/feedback')));
const AdminFeedbackManagementPage = withSuspense(React.lazy(() => import('./pages/admin/FeedbackAdmin')));
const AdminFeedbackReviewPage = withSuspense(React.lazy(() => import('./pages/admin/feedback-review')));
const AdminBugReportsPage = withSuspense(React.lazy(() => import('./pages/admin/bug-reports')));
const AdminContentModerationPage = withSuspense(React.lazy(() => import('./pages/admin/content-moderation')));
const AdminContentPage = withSuspense(React.lazy(() => import('./pages/admin/content')));
const AdminDashboardPage = withSuspense(React.lazy(() => import('./pages/admin/dashboard')));
const AdminSiteStatisticsPage = withSuspense(React.lazy(() => import('./pages/admin/site-statistics')));
// const CookieTestPage = withSuspense(React.lazy(() => import('./pages/cookie-test')));
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
      {/* Desktop Sidebar - optimized for larger screens */}
      <aside className="fixed top-0 left-0 z-40 h-screen w-64 sm:w-60 md:w-64 lg:w-72 hidden lg:block overflow-hidden border-r border-border/80">
        <div className="h-full w-full">
          <div className="h-[56px] md:h-[64px] lg:h-[72px] px-4 md:px-6 flex items-center border-b border-border bg-background">
            <h1 className="text-foreground font-medium text-lg md:text-xl lg:text-2xl">Stories</h1>
          </div>
          <SidebarNavigation onNavigate={() => {}} />
        </div>
      </aside>

      {/* Main Content - responsive spacing for different device sizes */}
      <main className="min-h-screen lg:ml-72">
        <AutoHideNavbar />
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 md:py-6 lg:py-8 pt-20 lg:pt-8 max-w-7xl">
          <ErrorBoundary>
            <EnhancedPageTransition>
              <Switch>
                {/* Auth Routes */}
                <Route path="/auth" component={AuthPage} />
                <Route path="/auth/success" component={AuthSuccessPage} />
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
                {/* Responsive Demo Page */}
                <Route path="/responsive-demo" component={ResponsiveDemoPage} />
                {/* Removed test pages routes */}
                <Route path="/bookmarks" component={BookmarksPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                {/* Removed other test page routes */}

                {/* Game Routes */}
                <Route path="/eden-game" component={EdenGamePage} />
                <Route path="/eden-pixelgame" component={EdenCanvasGamePage} />
                <Route path="/eden-game-new" component={EdenGameNewPage} />
                <Route path="/game-test" component={GameTestPage} />

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
                {/* Removed text-to-speech page route */}
                <Route path="/settings/fonts" component={FontSettingsPage} />
                <Route path="/settings/accessibility" component={AccessibilitySettingsPage} />

                <ProtectedRoute path="/settings/notifications" component={NotificationSettingsPage} />
                <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />
                <ProtectedRoute path="/settings/data-export" component={DataExportPage} />
                <ProtectedRoute path="/settings/cookie-management" component={CookieManagementPage} />

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
                <ProtectedRoute path="/admin/feedback-management" component={AdminFeedbackManagementPage} requireAdmin />

                {/* 404 Route - Using a stable component to fix hooks ordering */}
                <Route>
                  <NotFoundRouteHandler />
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
      <ScrollToTopButton position="bottom-right" />
      {/* Only show feedback button on homepage */}
      {location === '/' && (
        <FeedbackButton position="bottom-left" showIcon={true} buttonText="Feedback" />
      )}
    </div>
  );
};

// The NotFoundRouteHandler component is now imported from './components/NotFoundRouteHandler'

function App() {
  usePerformanceMonitoring();

  // We now use the WordPress API provider for status management
  useEffect(() => {
    // Initialize WordPress sync service for auto-syncing every 5 minutes
    const syncIntervalId = initWordPressSync();
    
    // Preload posts if needed
    preloadWordPressPosts()
      .catch(error => {
        console.error('[App] Error preloading WordPress posts:', 
          error instanceof Error ? error.message : 'Unknown error');
      });
    
    // Clean up sync service on component unmount
    return () => {
      if (syncIntervalId) clearInterval(syncIntervalId);
    };
  }, []);

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
          <ErrorToastProvider>
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
          </ErrorToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;