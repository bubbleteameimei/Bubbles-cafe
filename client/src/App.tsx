import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
// Import our new GlobalLoadingProvider component that handles loading state
import GlobalLoadingProvider, { useLoading } from './components/GlobalLoadingProvider';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { Sonner } from './components/ui/sonner';
import { toast } from 'sonner';
import Footer from './components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { CookieConsentProvider } from './hooks/use-cookie-consent';
import { ErrorBoundary } from './components/ui/error-boundary';
import { usePerformanceMonitoring } from './hooks/use-performance-monitoring';
import { SidebarProvider } from './components/ui/sidebar';
import { ProtectedRoute } from './lib/protected-route';
import ScrollToTopButton from './components/ScrollToTopButton';
// Import our enhanced page transition component
// EnhancedPageTransition removed to fix loading animation conflicts
// Add critical fullwidth fix stylesheet
import './styles/fullwidth-fix.css';
// Scroll-to-top now uses inline styles
// Using EnhancedPageTransition for smooth page transitions
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
// Import SidebarNavigation directly from sidebar-menu
import { SidebarNavigation } from './components/ui/sidebar-menu';
// Import WordPress API preload function for enhanced reliability
import { preloadWordPressPosts } from './lib/wordpress-api';
// Import WordPress sync service
import { initWordPressSync } from './lib/wordpress-sync';
// Import WordPress sync status component
import { WordPressSyncStatus } from './components/wordpress-sync-status';
// Import FeedbackButton component for site-wide feedback
import { FeedbackButton } from './components/feedback/FeedbackButton';
// Import our scroll effects provider for multi-speed scroll and gentle return
import ScrollEffectsProvider from './components/ScrollEffectsProvider';
// Import our performance monitoring component
import PerformanceMonitor from './components/performance-monitor';

import AutoHideNavbar from './components/layout/AutoHideNavbar';
import FullscreenButton from './components/FullscreenButton';
import SearchBar from './components/SearchBar';
// Import our notification system components
import { NotificationProvider } from './contexts/notification-context';
import { NotificationIcon } from './components/ui/notification-icon';
// Import Silent Ping feature
import { SilentPingProvider } from './contexts/silent-ping-context';
// Import music provider for background music functionality
import { MusicProvider } from './contexts/music-context';
import SidebarHeader from './components/SidebarHeader';
import { PrimaryNav } from './components/primary-nav';
import ErrorToastProvider from './components/providers/error-toast-provider';
import NotFoundRouteHandler from './components/NotFoundRouteHandler';
// Import our new refresh components
import { PullToRefresh } from './components/ui/pull-to-refresh';
import { RefreshProvider } from './contexts/refresh-context';

// Import all pages directly - no lazy loading
import ReaderPage from './pages/reader';
import HomePage from './pages/home';
import StoriesPage from './pages/index';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import PrivacyPage from './pages/privacy';
import ReportBugPage from './pages/report-bug';
import PixelArtPage from './pages/PixelArtPage';
import AuthPage from './pages/auth';
import AuthSuccessPage from './pages/auth-success';
import ProfilePage from './pages/profile';
import BookmarksPage from './pages/bookmarks';
import SearchResultsPage from './pages/SearchResults';
import NotificationsPage from './pages/notifications';

// Settings pages
import ProfileSettingsPage from './pages/settings/profile';
import ConnectedAccountsPage from './pages/settings/connected-accounts';
import FontSettingsPage from './pages/settings/fonts';
import AccessibilitySettingsPage from './pages/settings/accessibility';
import NotificationSettingsPage from './pages/settings/notifications';
import PrivacySettingsPage from './pages/settings/privacy';
// DataExportPage import removed
import CookieManagementPage from './pages/settings/cookie-management';
import QuickSettingsPage from './pages/settings/quick-settings';
import PreviewSettingsPage from './pages/settings/preview';

// Game pages
import GameTestPage from './pages/game-test';

// Demo pages
import ErrorDemoPage from './pages/error-demo';

// Admin pages
import AdminPage from './pages/admin';
import AdminAnalyticsPage from './pages/admin/analytics';
import AdminAnalyticsDashboardPage from './pages/admin/analytics-dashboard';
import AdminUsersPage from './pages/admin/users';
import AdminSettingsPage from './pages/admin/settings';
import AdminPostsPage from './pages/admin/posts';
import AdminManagePostsPage from './pages/admin/manage-posts';
import AdminFeedbackPage from './pages/admin/feedback';
import AdminFeedbackManagementPage from './pages/admin/FeedbackAdmin';
import AdminFeedbackReviewPage from './pages/admin/feedback-review';
import AdminBugReportsPage from './pages/admin/bug-reports';
import AdminContentModerationPage from './pages/admin/content-moderation';
import AdminContentPage from './pages/admin/content';
import AdminDashboardPage from './pages/admin/dashboard';
import AdminSiteStatisticsPage from './pages/admin/site-statistics';
import AdminWordPressSyncPage from './pages/admin/WordPressSyncPage';
import AdminContentManagementPage from './pages/admin/content-management';
import AdminThemesPage from './pages/admin/themes';
import ResetPasswordPage from './pages/reset-password';

// Error pages
import Error403Page from './pages/errors/403';
import Error404Page from './pages/errors/404';
import Error429Page from './pages/errors/429';
import Error500Page from './pages/errors/500';
import Error503Page from './pages/errors/503';
import Error504Page from './pages/errors/504';

// Legal Pages
import CopyrightPage from './pages/legal/copyright';
import TermsPage from './pages/legal/terms';
import CookiePolicyPage from './pages/legal/cookie-policy';

// Community Pages
import CommunityPage from './pages/community';
import SubmitStoryPage from './pages/submit-story';
import EditStoryPage from './pages/edit-story';
import FeedbackPage from './pages/feedback';
import UserFeedbackDashboardPage from './pages/user/feedback-dashboard';
import GuidelinesPage from './pages/support/guidelines';
import CsrfTestPage from './pages/csrf-test';

// Preload WordPress posts immediately on app load
preloadWordPressPosts();

const AppContent = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const locationStr = location.toString();
  
  // Get loading functions from context after provider is initialized
  const { showLoading, hideLoading } = useLoading();
  
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
  
  // Track page transitions and show loading animation
  useEffect(() => {
    // Don't show loading screen on initial load
    if (sessionStorage.getItem(`visited-${location}`)) {
      // Skip loading if the page has been visited before
      return;
    }
    
    // Show loading animation for page transitions
    showLoading();
    
    // Mark this page as visited
    sessionStorage.setItem(`visited-${location}`, 'true');
    
    // The loading screen will automatically be hidden after the animation completes
  }, [location, showLoading]);
  
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
    <div className="relative min-h-screen flex flex-col w-full">
      {/* Desktop Sidebar - optimized for larger screens - Now hidden */}
      <aside className="hidden">
        <div className="h-full w-full">
          <div className="h-[56px] md:h-[64px] lg:h-[72px] px-4 md:px-6 flex items-center border-b border-border bg-background">
            {/* Title removed as requested */}
          </div>
          <SidebarNavigation onNavigate={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen flex-1 flex flex-col w-full min-w-full max-w-[100vw] ${location === '/' ? '' : 'bg-background'}`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <AutoHideNavbar />
        <div className={`w-full min-w-full max-w-full ${location.startsWith('/reader') ? 'pt-4' : 'pt-20'} lg:pt-6 flex-1 ${location === '/' ? '' : 'bg-background'} m-0 p-0 px-0 mx-0`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', margin: '0 auto' }}>
          {/* Display WordPress sync status notifications */}
          <WordPressSyncStatus />
          <ErrorBoundary>
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
              <Route path="/search" component={SearchResultsPage} />
              <Route path="/notifications" component={NotificationsPage} />
              
              <Route path="/pixel-art" component={PixelArtPage} />
              {/* Export test route removed */}
              <Route path="/bookmarks" component={BookmarksPage} />
              <ProtectedRoute path="/profile" component={ProfilePage} />

              {/* Game Routes */}
              <Route path="/game-test" component={GameTestPage} />
              
              {/* Demo Routes */}
              <Route path="/error-demo" component={ErrorDemoPage} />

              {/* Legal Routes */}
              <Route path="/legal/copyright" component={CopyrightPage} />
              <Route path="/legal/terms" component={TermsPage} />
              <Route path="/legal/cookie-policy" component={CookiePolicyPage} />

              {/* Community Routes */}
              <Route path="/community" component={CommunityPage} />
              <Route path="/submit-story" component={SubmitStoryPage} />
              <Route path="/edit-story/:id">
                {(params) => <EditStoryPage params={params} />}
              </Route>
              {/* Community Reader Route - Using the same reader component but with community flag */}
              <Route path="/community-story/:slug">
                {(params) => <ReaderPage params={params} isCommunityContent={true} />}
              </Route>
              <Route path="/feedback" component={FeedbackPage} />
              <ProtectedRoute path="/feedback/dashboard" component={UserFeedbackDashboardPage} />
              <Route path="/support/guidelines" component={GuidelinesPage} />
              <Route path="/csrf-test" component={CsrfTestPage} />
              
              {/* Settings Routes */}
              <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
              <ProtectedRoute path="/settings/connected-accounts" component={ConnectedAccountsPage} />
              <Route path="/settings/fonts" component={FontSettingsPage} />
              <ProtectedRoute path="/settings/accessibility" component={AccessibilitySettingsPage} />
              <Route path="/settings/notifications" component={NotificationSettingsPage} />
              <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />
              {/* Redirect data export route to privacy settings */}
              <Route path="/settings/data-export">
                {() => {
                  const [, setLocation] = useLocation();
                  React.useEffect(() => {
                    // Show toast notification with the Toaster component
                    toast.error("Data Export Feature Removed", {
                      description: "The data export functionality has been removed. Please contact support if you need your data."
                    });
                    // Redirect to privacy settings page
                    setLocation('/settings/privacy');
                  }, [setLocation]);
                  // Return null while redirecting
                  return null;
                }}
              </Route>
              <Route path="/settings/cookie-management" component={CookieManagementPage} />
              <Route path="/settings/quick-settings" component={QuickSettingsPage} />
              <Route path="/settings/preview" component={PreviewSettingsPage} />

              {/* Admin Routes */}
              <ProtectedRoute path="/admin" component={AdminPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/analytics" component={AdminAnalyticsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/analytics-dashboard" component={AdminAnalyticsDashboardPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/users" component={AdminUsersPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/settings" component={AdminSettingsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/posts" component={AdminPostsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/manage-posts" component={AdminManagePostsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/feedback" component={AdminFeedbackPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/feedback-management" component={AdminFeedbackManagementPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/feedback-review" component={AdminFeedbackReviewPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/bug-reports" component={AdminBugReportsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/content-moderation" component={AdminContentModerationPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/content" component={AdminContentPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/site-statistics" component={AdminSiteStatisticsPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/wordpress-sync" component={AdminWordPressSyncPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/content-management" component={AdminContentManagementPage} requireAdmin={true} />
              <ProtectedRoute path="/admin/themes" component={AdminThemesPage} requireAdmin={true} />
                
              {/* 404 fallback */}
              <Route>
                <NotFoundRouteHandler>
                  <Error404Page />
                </NotFoundRouteHandler>
              </Route>
            </Switch>
          </ErrorBoundary>
        </div>
        <Footer />
      </main>
    </div>
  );
};

// Main App component
function App() {
  // Setup performance monitoring
  usePerformanceMonitoring();
  const [location] = useLocation();
  
  // The page transition loading will be handled by AppContent component
  // where useLoading will be called after LoadingProvider is mounted

  // Initialize WordPress sync service - managed internally with its own state
  useEffect(() => {
    initWordPressSync();
  }, []);
  
  // Create a FeedbackButton wrapper component to handle visibility logic
  const ConditionalFeedbackButton = () => {
    const [currentPath] = useLocation();
    // Check if current page is index, reader, community page, community-story, or game-test
    const shouldHideButton = 
      currentPath === "/" || 
      currentPath === "/index" || 
      currentPath.startsWith("/reader") || 
      currentPath.startsWith("/community-story") || 
      currentPath === "/community" ||
      currentPath === "/game-test";
      
    return !shouldHideButton ? <FeedbackButton /> : null;
  };
  
  // Function to handle data refresh
  const handleDataRefresh = async () => {
    // Invalidate all queries to refresh data
    await queryClient.invalidateQueries();
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CookieConsentProvider>
          <ThemeProvider>
            <SidebarProvider>
              <NotificationProvider>
                <SilentPingProvider>
                  <MusicProvider>
                    <ScrollEffectsProvider>
                      <ErrorToastProvider>
                        <GlobalLoadingProvider>
                          <RefreshProvider>
                            {/* Wrap AppContent with PullToRefresh */}
                            <PullToRefresh onRefresh={handleDataRefresh}>
                              {/* Add PerformanceMonitor for metrics collection */}
                              <PerformanceMonitor />
                              <div className="app-content">
                                <AppContent />
                              </div>
                            </PullToRefresh>
                            {/* Site-wide elements outside of the main layout */}
                            <CookieConsent />
                            {location !== '/' && (
                              <ScrollToTopButton position="bottom-right" /* Using inline styles for reliable positioning */ />
                            )}
                            {/* Conditionally show FeedbackButton */}
                            <ConditionalFeedbackButton />
                            
                            {/* Toast notifications */}
                            <Toaster />
                            <Sonner position="bottom-left" className="fixed-sonner" />
                          </RefreshProvider>
                        </GlobalLoadingProvider>
                      </ErrorToastProvider>
                    </ScrollEffectsProvider>
                  </MusicProvider>
                </SilentPingProvider>
              </NotificationProvider>
            </SidebarProvider>
          </ThemeProvider>
        </CookieConsentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;