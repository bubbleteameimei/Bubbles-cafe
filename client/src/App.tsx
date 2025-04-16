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

// Import essential pages directly
import HomePage from './pages/home';
import StoriesPage from './pages/index';

// Lazy-load all other pages to improve initial load time
const ReaderPage = React.lazy(() => import('./pages/reader'));
const AboutPage = React.lazy(() => import('./pages/about'));
const ContactPage = React.lazy(() => import('./pages/contact'));
const PrivacyPage = React.lazy(() => import('./pages/privacy'));
const ReportBugPage = React.lazy(() => import('./pages/report-bug'));
const PixelArtPage = React.lazy(() => import('./pages/PixelArtPage'));
const AuthPage = React.lazy(() => import('./pages/auth'));
const AuthSuccessPage = React.lazy(() => import('./pages/auth-success'));
const ProfilePage = React.lazy(() => import('./pages/profile'));
const BookmarksPage = React.lazy(() => import('./pages/bookmarks'));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResults'));
const NotificationsPage = React.lazy(() => import('./pages/notifications'));

// Settings pages - lazy loaded
const ProfileSettingsPage = React.lazy(() => import('./pages/settings/profile'));
const ConnectedAccountsPage = React.lazy(() => import('./pages/settings/connected-accounts'));
const FontSettingsPage = React.lazy(() => import('./pages/settings/fonts'));
const AccessibilitySettingsPage = React.lazy(() => import('./pages/settings/accessibility'));
const NotificationSettingsPage = React.lazy(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = React.lazy(() => import('./pages/settings/privacy'));
const CookieManagementPage = React.lazy(() => import('./pages/settings/cookie-management'));
const QuickSettingsPage = React.lazy(() => import('./pages/settings/quick-settings'));
const PreviewSettingsPage = React.lazy(() => import('./pages/settings/preview'));

// Game pages - lazy loaded
const GameTestPage = React.lazy(() => import('./pages/game-test'));

// Demo pages - lazy loaded
const ErrorDemoPage = React.lazy(() => import('./pages/error-demo'));

// Admin pages - lazy loaded
const AdminPage = React.lazy(() => import('./pages/admin'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/analytics'));
const AdminAnalyticsDashboardPage = React.lazy(() => import('./pages/admin/analytics-dashboard'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/users'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/settings'));
const AdminPostsPage = React.lazy(() => import('./pages/admin/posts'));
const AdminManagePostsPage = React.lazy(() => import('./pages/admin/manage-posts'));
const AdminFeedbackPage = React.lazy(() => import('./pages/admin/feedback'));
const AdminFeedbackManagementPage = React.lazy(() => import('./pages/admin/FeedbackAdmin'));
const AdminFeedbackReviewPage = React.lazy(() => import('./pages/admin/feedback-review'));
const AdminBugReportsPage = React.lazy(() => import('./pages/admin/bug-reports'));
const AdminContentModerationPage = React.lazy(() => import('./pages/admin/content-moderation'));
const AdminContentPage = React.lazy(() => import('./pages/admin/content'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/dashboard'));
const AdminSiteStatisticsPage = React.lazy(() => import('./pages/admin/site-statistics'));
const AdminWordPressSyncPage = React.lazy(() => import('./pages/admin/WordPressSyncPage'));
const AdminContentManagementPage = React.lazy(() => import('./pages/admin/content-management'));
const AdminThemesPage = React.lazy(() => import('./pages/admin/themes'));
const ResetPasswordPage = React.lazy(() => import('./pages/reset-password'));

// Error pages - lazy loaded
const Error403Page = React.lazy(() => import('./pages/errors/403'));
const Error404Page = React.lazy(() => import('./pages/errors/404'));
const Error429Page = React.lazy(() => import('./pages/errors/429'));
const Error500Page = React.lazy(() => import('./pages/errors/500'));
const Error503Page = React.lazy(() => import('./pages/errors/503'));
const Error504Page = React.lazy(() => import('./pages/errors/504'));

// Legal Pages - lazy loaded
const CopyrightPage = React.lazy(() => import('./pages/legal/copyright'));
const TermsPage = React.lazy(() => import('./pages/legal/terms'));
const CookiePolicyPage = React.lazy(() => import('./pages/legal/cookie-policy'));

// Community Pages - lazy loaded
const CommunityPage = React.lazy(() => import('./pages/community'));
const SubmitStoryPage = React.lazy(() => import('./pages/submit-story'));
const EditStoryPage = React.lazy(() => import('./pages/edit-story'));
const FeedbackPage = React.lazy(() => import('./pages/feedback'));
const UserFeedbackDashboardPage = React.lazy(() => import('./pages/user/feedback-dashboard'));
const GuidelinesPage = React.lazy(() => import('./pages/support/guidelines'));
const CsrfTestPage = React.lazy(() => import('./pages/csrf-test'));

// Defer WordPress posts preloading until after initial page render
// This improves initial load time significantly
const preloadWordPressPostsDeferred = () => {
  // Use requestIdleCallback for browsers that support it, or setTimeout as fallback
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      preloadWordPressPosts();
    }, { timeout: 2000 }); // 2-second timeout
  } else {
    // Fallback to setTimeout with a slight delay
    setTimeout(() => {
      preloadWordPressPosts();
    }, 1000); // 1-second delay
  }
};

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
  
  // Track page transitions and always show loading animation between pages
  useEffect(() => {
    // Store the current location to detect actual navigation
    const prevLocation = sessionStorage.getItem('current-location');
    
    // Only show loading when actually changing pages (not on initial load)
    if (prevLocation && prevLocation !== location) {
      // Show loading animation for page transitions
      showLoading();
    }
    
    // Update current location in session storage
    sessionStorage.setItem('current-location', location);
    
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

  // Initialize WordPress sync service and defer content preloading
  useEffect(() => {
    // Initialize the sync service first
    initWordPressSync();
    
    // Defer preloading content until after the initial render
    preloadWordPressPostsDeferred();
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
                                <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen" 
                                  data-loading="skeleton"
                                  style={{ display: 'none' }} // Initially hidden, will be managed by the LoadingScreen
                                >
                                  <div className="animate-pulse text-center">
                                    <div className="h-10 w-40 bg-accent mx-auto rounded mb-4"></div>
                                    <div className="h-4 w-60 bg-muted mx-auto rounded"></div>
                                  </div>
                                </div>}>
                                  <AppContent />
                                </React.Suspense>
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