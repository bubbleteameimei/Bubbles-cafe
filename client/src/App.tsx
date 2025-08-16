import React, { useEffect, useRef } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
// Removed GlobalLoadingProvider for instant navigation
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { Sonner } from './components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './hooks/use-auth';
import { CookieConsent } from './components/ui/cookie-consent';
import { CookieConsentProvider } from './hooks/use-cookie-consent';
import { GlobalErrorBoundary, setupGlobalErrorHandlers } from './components/error-boundary/global-error-boundary';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePerformanceMonitoring } from './hooks/use-performance-monitoring';
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
import PerformanceMonitor from './components/performance-monitor';
import { lazyWithRetry } from './utils/lazy-retry';

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

// Lazy-load all other pages to improve initial load time
const ReaderPage = lazyWithRetry(() => import('./pages/reader'));
const AboutPage = lazyWithRetry(() => import('./pages/about'));
const ContactPage = lazyWithRetry(() => import('./pages/contact'));
const PrivacyPage = lazyWithRetry(() => import('./pages/privacy'));
const ReportBugPage = lazyWithRetry(() => import('./pages/report-bug'));

const AuthPage = lazyWithRetry(() => import('./pages/auth'));
const AuthSuccessPage = lazyWithRetry(() => import('./pages/auth-success'));
const ProfilePage = lazyWithRetry(() => import('./pages/profile'));
const BookmarksPage = lazyWithRetry(() => import('./pages/bookmarks'));
const SearchResultsPage = lazyWithRetry(() => import('./pages/SearchResults'));
const NotificationsPage = lazyWithRetry(() => import('./pages/notifications'));
const RecommendationsPage = lazyWithRetry(() => import('./pages/recommendations'));

// Settings pages - lazy loaded
const ProfileSettingsPage = lazyWithRetry(() => import('./pages/settings/profile'));
const ConnectedAccountsPage = lazyWithRetry(() => import('./pages/settings/connected-accounts'));
const FontSettingsPage = lazyWithRetry(() => import('./pages/settings/fonts'));
const AccessibilitySettingsPage = lazyWithRetry(() => import('./pages/settings/accessibility'));
const NotificationSettingsPage = lazyWithRetry(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = lazyWithRetry(() => import('./pages/settings/privacy'));
const CookieManagementPage = lazyWithRetry(() => import('./pages/settings/cookie-management'));
const QuickSettingsPage = lazyWithRetry(() => import('./pages/settings/quick-settings'));
const PreviewSettingsPage = lazyWithRetry(() => import('./pages/settings/preview'));



// Demo pages - lazy loaded
// Admin pages - lazy loaded
const AdminPage = lazyWithRetry(() => import('./pages/admin'));
const AdminAnalyticsPage = lazyWithRetry(() => import('./pages/admin/analytics'));
const AdminAnalyticsDashboardPage = lazyWithRetry(() => import('./pages/admin/analytics-dashboard'));
const AdminUsersPage = lazyWithRetry(() => import('./pages/admin/users'));
const AdminSettingsPage = lazyWithRetry(() => import('./pages/admin/settings'));
const AdminPostsPage = lazyWithRetry(() => import('./pages/admin/posts'));
const AdminManagePostsPage = lazyWithRetry(() => import('./pages/admin/manage-posts'));
const AdminFeedbackPage = lazyWithRetry(() => import('./pages/admin/feedback'));
const AdminFeedbackManagementPage = lazyWithRetry(() => import('./pages/admin/FeedbackAdmin'));
const AdminFeedbackReviewPage = lazyWithRetry(() => import('./pages/admin/feedback-review'));
const AdminBugReportsPage = lazyWithRetry(() => import('./pages/admin/bug-reports'));
const AdminContentModerationPage = lazyWithRetry(() => import('./pages/admin/content-moderation'));
const AdminContentPage = lazyWithRetry(() => import('./pages/admin/content'));
const AdminDashboardPage = lazyWithRetry(() => import('./pages/admin/dashboard'));
const AdminSiteStatisticsPage = lazyWithRetry(() => import('./pages/admin/site-statistics'));
const AdminWordPressSyncPage = lazyWithRetry(() => import('./pages/admin/WordPressSyncPage'));
const AdminContentManagementPage = lazyWithRetry(() => import('./pages/admin/content-management'));
const AdminThemesPage = lazyWithRetry(() => import('./pages/admin/themes'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/reset-password'));

// Placeholder 404 page for discontinued features
const EdenHollow404 = lazyWithRetry(() => import('./pages/EdenHollow404'));

// Error pages - lazy loaded
const Error403Page = lazyWithRetry(() => import('./pages/errors/403'));
const Error404Page = lazyWithRetry(() => import('./pages/errors/404'));
const Error429Page = lazyWithRetry(() => import('./pages/errors/429'));
const Error500Page = lazyWithRetry(() => import('./pages/errors/500'));
const Error503Page = lazyWithRetry(() => import('./pages/errors/503'));
const Error504Page = lazyWithRetry(() => import('./pages/errors/504'));

// Legal Pages - lazy loaded
const CopyrightPage = lazyWithRetry(() => import('./pages/legal/copyright'));
const TermsPage = lazyWithRetry(() => import('./pages/legal/terms'));
const CookiePolicyPage = lazyWithRetry(() => import('./pages/legal/cookie-policy'));

// Community Pages - lazy loaded
const CommunityPage = lazyWithRetry(() => import('./pages/community'));
const SubmitStoryPage = lazyWithRetry(() => import('./pages/submit-story'));
const EditStoryPage = lazyWithRetry(() => import('./pages/edit-story'));
const FeedbackPage = lazyWithRetry(() => import('./pages/feedback'));
const UserFeedbackDashboardPage = lazyWithRetry(() => import('./pages/user/feedback-dashboard'));
const GuidelinesPage = lazyWithRetry(() => import('./pages/support/guidelines'));

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
      <main className={`min-h-screen flex-1 flex flex-col w-full min-w-full max-w-[100vw] ${location === '/' ? '' : 'bg-background'}`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <AutoHideNavbar />
        <div className={`w-full min-w-full max-w-full 
                        ${location.startsWith('/reader') ? 'pt-4' : 'pt-20'} 
                        lg:pt-6 
                        flex-1 
                        ${location === '/' ? '' : 'bg-background'} 
                        m-0 p-0 px-0 mx-0`}
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', margin: '0 auto' }}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/stories" component={StoriesPage} />
            <Route path="/reader" component={ReaderPage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/search" component={SearchResultsPage} />
            <Route path="/community-story/:slug">
              {(params) => <ReaderPage params={params} isCommunityContent={true} />}
            </Route>
            <Route path="/story/:slug">
              {(params) => <ReaderPage params={params} isCommunityContent={false} />}
            </Route>
            <Route path="/errors/403" component={Error403Page} />
            <Route path="/errors/404" component={Error404Page} />
            <Route path="/errors/429" component={Error429Page} />
            <Route path="/errors/500" component={Error500Page} />
            <Route path="/errors/503" component={Error503Page} />
            <Route path="/errors/504" component={Error504Page} />
            <Route path="*" component={Error404Page} />
          </Switch>
        </div>
      </main>
    </div>
  );
};

// Main App component
function App() {
  // Setup performance monitoring
  usePerformanceMonitoring();
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
                              {/* Add PerformanceMonitor for metrics collection */}
                              {import.meta.env.DEV ? <PerformanceMonitor /> : null}
                              <div className="app-content">
                                <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">
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