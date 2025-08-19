import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { Sonner } from './components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { CookieConsentProvider } from './hooks/use-cookie-consent';
import { GlobalErrorBoundary, setupGlobalErrorHandlers } from './components/error-boundary/global-error-boundary';
import { ErrorBoundary } from './components/ErrorBoundary';
// Performance monitoring removed
import { SidebarProvider } from './components/ui/sidebar';
import ScrollToTopButton from './components/ScrollToTopButton';
// Import our enhanced page transition component
// EnhancedPageTransition removed to fix loading animation conflicts
// Add critical fullwidth fix stylesheet
import './styles/fullwidth-fix.css';
// Scroll-to-top now uses inline styles
// Using EnhancedPageTransition for smooth page transitions
// Removed unused imports: Button, Menu
// Import SidebarNavigation directly from sidebar-menu
import { SidebarNavigation } from './components/ui/sidebar-menu';
// Import WordPress API preload function for enhanced reliability
import { preloadWordPressPosts } from './lib/wordpress-api';
// Import WordPress sync service
import { initWordPressSync } from './lib/wordpress-sync';
// Import WordPress sync status component
// Import FeedbackButton component for site-wide feedback
import { FeedbackButton } from './components/feedback/FeedbackButton';
// Import our scroll effects provider for multi-speed scroll and gentle return
import ScrollEffectsProvider from './components/ScrollEffectsProvider';
// Import our performance monitoring component
// Performance monitor overlay removed
import StoryProgressBar from './components/StoryProgressBar';

import AutoHideNavbar from './components/layout/AutoHideNavbar';
// Removed unused imports: FullscreenButton, SearchBar
// Import our notification system components
import { NotificationProvider } from './contexts/notification-context';
// Removed unused import: NotificationIcon
// Import Silent Ping feature
import { SilentPingProvider } from './contexts/silent-ping-context';
// Import our like/dislike test page
// Import music provider for background music functionality
import { MusicProvider } from './contexts/music-context';
// Removed unused imports: SidebarHeader, PrimaryNav
import ErrorToastProvider from './components/providers/error-toast-provider';
// Import our new refresh components
import { PullToRefresh } from './components/ui/pull-to-refresh';
import { RefreshProvider } from './contexts/refresh-context';

// Import essential pages directly
import HomePage from './pages/home';
import StoriesPage from './pages/index';
// Import footer component
import Footer from './components/layout/footer';

// Eager-load all pages for faster route switching
const ReaderPage = React.lazy(() => import('./pages/reader'));
const AboutPage = React.lazy(() => import('./pages/about'));
const ContactPage = React.lazy(() => import('./pages/contact'));
const PrivacyPage = React.lazy(() => import('./pages/privacy'));
const ReportBugPage = React.lazy(() => import('./pages/report-bug'));

import AuthPage from './pages/auth';
import AuthSuccessPage from './pages/auth-success';
import ProfilePage from './pages/profile';
import BookmarksPage from './pages/bookmarks';
import SearchResultsPage from './pages/search-results';
import NotificationsPage from './pages/notifications';
import RecommendationsPage from './pages/recommendations';

// Settings pages - eager loaded
import ProfileSettingsPage from './pages/settings/profile';
import ConnectedAccountsPage from './pages/settings/connected-accounts';
import FontSettingsPage from './pages/settings/fonts';
import AccessibilitySettingsPage from './pages/settings/accessibility';
import NotificationSettingsPage from './pages/settings/notifications';
import PrivacySettingsPage from './pages/settings/privacy';
import CookieManagementPage from './pages/settings/cookie-management';
import QuickSettingsPage from './pages/settings/quick-settings';
import PreviewSettingsPage from './pages/settings/preview';



// Demo pages - lazy loaded
// Admin pages - eager loaded
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
import ResetPasswordPage from './pages/reset-password';

// Placeholder for discontinued features removed

// Error pages - eager loaded
import Error403Page from './pages/errors/403';
import Error404Page from './pages/errors/404';
import Error429Page from './pages/errors/429';
import Error500Page from './pages/errors/500';
import Error503Page from './pages/errors/503';
import Error504Page from './pages/errors/504';

// Legal Pages - eager loaded
import CopyrightPage from './pages/legal/copyright';
import TermsPage from './pages/legal/terms';
import CookiePolicyPage from './pages/legal/cookie-policy';

// Community Pages - eager loaded
import CommunityPage from './pages/community';
import SubmitStoryPage from './pages/submit-story';
import EditStoryPage from './pages/edit-story';
import FeedbackPage from './pages/feedback';
import UserFeedbackDashboardPage from './pages/user/feedback-dashboard';
import GuidelinesPage from './pages/support/guidelines';

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

  // Simplified location tracking - no loading delays
  useEffect(() => {
    if (!isErrorPage) {
      sessionStorage.setItem('current-location', location);
    }
  }, [location, isErrorPage]);
  
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
      <main id="main" className={`min-h-screen flex-1 flex flex-col w-full min-w-full max-w-[100vw] ${location === '/' ? '' : 'bg-background'}`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <AutoHideNavbar />
        {(location.startsWith('/reader') || location.startsWith('/community-story')) && (
          <div className="w-full z-30">
            <StoryProgressBar height={3} showPercentage={false} />
          </div>
        )}
        <div className={`w-full min-w-full max-w-full 
                        lg:pt-6 
                        flex-1 
                        ${location === '/' ? '' : 'bg-background'} 
                        m-0 p-0 px-0 mx-0`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', margin: '0 auto', paddingTop: 'var(--navbar-height, 56px)' }}>
          <Switch>
            {/* Main Pages */}
            <Route path="/" component={HomePage} />
            <Route path="/stories" component={StoriesPage} />
            <Route path="/reader" component={ReaderPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/report-bug" component={ReportBugPage} />
            
            {/* Authentication */}
            <Route path="/auth" component={AuthPage} />
            <Route path="/auth-success" component={AuthSuccessPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            
            {/* User Pages */}
            <Route path="/profile" component={ProfilePage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/recommendations" component={RecommendationsPage} />
            
            {/* Settings Pages */}
            <Route path="/settings/profile" component={ProfileSettingsPage} />
            <Route path="/settings/connected-accounts" component={ConnectedAccountsPage} />
            <Route path="/settings/fonts" component={FontSettingsPage} />
            <Route path="/settings/accessibility" component={AccessibilitySettingsPage} />
            <Route path="/settings/notifications" component={NotificationSettingsPage} />
            <Route path="/settings/privacy" component={PrivacySettingsPage} />
            <Route path="/settings/cookie-management" component={CookieManagementPage} />
            <Route path="/settings/quick-settings" component={QuickSettingsPage} />
            <Route path="/settings/preview" component={PreviewSettingsPage} />
            
            {/* Community Pages */}
            <Route path="/community" component={CommunityPage} />
            <Route path="/submit-story" component={SubmitStoryPage} />
            <Route path="/edit-story" component={EditStoryPage} />
            <Route path="/feedback" component={FeedbackPage} />
            <Route path="/user/feedback-dashboard" component={UserFeedbackDashboardPage} />
            <Route path="/support/guidelines" component={GuidelinesPage} />
            
            {/* Legal Pages */}
            <Route path="/legal/copyright" component={CopyrightPage} />
            <Route path="/legal/terms" component={TermsPage} />
            <Route path="/legal/cookie-policy" component={CookiePolicyPage} />
            
            {/* Admin Pages */}
            <Route path="/admin" component={AdminPage} />
            <Route path="/admin/dashboard" component={AdminDashboardPage} />
            <Route path="/admin/analytics" component={AdminAnalyticsPage} />
            <Route path="/admin/analytics-dashboard" component={AdminAnalyticsDashboardPage} />
            <Route path="/admin/users" component={AdminUsersPage} />
            <Route path="/admin/settings" component={AdminSettingsPage} />
            <Route path="/admin/posts" component={AdminPostsPage} />
            <Route path="/admin/manage-posts" component={AdminManagePostsPage} />
            <Route path="/admin/content" component={AdminContentPage} />
            <Route path="/admin/content-management" component={AdminContentManagementPage} />
            <Route path="/admin/content-moderation" component={AdminContentModerationPage} />
            <Route path="/admin/feedback" component={AdminFeedbackPage} />
            <Route path="/admin/feedback-management" component={AdminFeedbackManagementPage} />
            <Route path="/admin/feedback-review" component={AdminFeedbackReviewPage} />
            <Route path="/admin/bug-reports" component={AdminBugReportsPage} />
            <Route path="/admin/site-statistics" component={AdminSiteStatisticsPage} />
            <Route path="/admin/wordpress-sync" component={AdminWordPressSyncPage} />
            <Route path="/admin/themes" component={AdminThemesPage} />
            
            {/* Dynamic Routes */}
            <Route path="/search" component={SearchResultsPage} />
            <Route path="/community-story/:slug">
              {(params) => <ReaderPage params={params} isCommunityContent={true} />}
            </Route>
            <Route path="/reader/:slug">
              {(params) => <ReaderPage params={params} isCommunityContent={false} />}
            </Route>
            <Route path="/story/:slug">
              {(params) => <ReaderPage params={params} isCommunityContent={false} />}
            </Route>
            
            {/* Error Pages */}
            <Route path="/errors/403" component={Error403Page} />
            <Route path="/errors/404" component={Error404Page} />
            <Route path="/errors/429" component={Error429Page} />
            <Route path="/errors/500" component={Error500Page} />
            <Route path="/errors/503" component={Error503Page} />
            <Route path="/errors/504" component={Error504Page} />
            
            {/* Catch All */}
            <Route path="*" component={Error404Page} />
          </Switch>
        </div>
        {/* Add Footer */}
        <Footer />
      </main>
    </div>
  );
};

// Main App component
function App() {
  // Performance monitoring removed
  const [location] = useLocation();
  
  // Set up global error handlers
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);
  
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
    // Check if current page is index, reader, community page, or community-story
    const shouldHideButton = 
      currentPath === "/" || 
      currentPath === "/index" || 
      currentPath === "/stories" || 
      currentPath.startsWith("/reader") || 
      currentPath.startsWith("/community-story") || 
      currentPath === "/community";
      
    return !shouldHideButton ? <FeedbackButton /> : null;
  };
  
  // Function to handle data refresh
  const handleDataRefresh = async () => {
    // Invalidate all queries to refresh data
    await queryClient.invalidateQueries();
  };
  
  return (
    <GlobalErrorBoundary level="critical">
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
                            <RefreshProvider>
                            {/* Wrap AppContent with PullToRefresh */}
                            <PullToRefresh onRefresh={handleDataRefresh}>
                              {/* Performance monitor overlay removed */}
                              <div className="app-content">
                                <React.Suspense fallback={null}>
                                  <AppContent />
                                </React.Suspense>
                              </div>
                            </PullToRefresh>
                            {/* Site-wide elements outside of the main layout */}
                            <CookieConsent />
                            {location !== '/' && (
                              <ScrollToTopButton position="bottom-right" />
                            )}
                            {/* Conditionally show FeedbackButton */}
                            <ConditionalFeedbackButton />
                            
                            {/* Toast notifications */}
                            <Toaster />
                            <Sonner position="bottom-left" className="fixed-sonner" />
                            </RefreshProvider>
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
    </GlobalErrorBoundary>
  );
}

export default App;