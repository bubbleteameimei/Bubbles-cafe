import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
const Toaster = React.lazy(() => import('./components/ui/toaster').then(m => ({ default: m.Toaster })));
const Sonner = React.lazy(() => import('./components/ui/sonner').then(m => ({ default: m.Sonner })));
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './hooks/use-auth';
const CookieConsent = React.lazy(() => import('./components/ui/cookie-consent').then(m => ({ default: m.CookieConsent })));
import { CookieConsentProvider } from './hooks/use-cookie-consent';
import {
  GlobalErrorBoundary,
  setupGlobalErrorHandlers,
} from './components/error-boundary/global-error-boundary';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/ui/loading-screen';
// Performance monitoring removed
import { SidebarProvider } from './components/ui/sidebar';
const ScrollToTopButton = React.lazy(() => import('./components/ScrollToTopButton'));
import PageTransition from './components/PageTransition';
// Add critical fullwidth fix stylesheet
import './styles/fullwidth-fix.css';
import './components/transition.css';
// Import WordPress API preload function for enhanced reliability (lazy-loaded below)
// Import WordPress sync service (lazy-loaded below)
// Import FeedbackButton component for site-wide feedback

// Import our scroll effects provider for multi-speed scroll and gentle return
import ScrollEffectsProvider from './components/ScrollEffectsProvider';
const SEO = React.lazy(() => import('@/components/SEO'));

const AutoHideNavbar = React.lazy(() => import('./components/layout/AutoHideNavbar'));
// Import our notification system components
import { NotificationProvider } from './contexts/notification-context';
import ErrorToastProvider from './components/providers/error-toast-provider';
// Import our new refresh components
import { PullToRefresh } from './components/ui/pull-to-refresh';
import { RefreshProvider } from './contexts/refresh-context';
// Add global loading provider so ApiLoader can display a proper loading overlay
import { GlobalLoadingProvider } from './components/GlobalLoadingProvider';
const PostsPrefetcher = React.lazy(() => import('./components/providers/PostsPrefetcher'));
import { initSmoothScroll } from './lib/smooth-scroll';
import { useA11y } from '@/hooks/useA11y';

// Import essential pages directly
const HomePage = React.lazy(() => import('./pages/home'));
const StoriesPage = React.lazy(() => import('./pages/index'));
// Import footer component lazily
const Footer = React.lazy(() => import('./components/layout/footer'));

// Eager-load all pages for faster route switching
const ReaderPage = React.lazy(() => import('./pages/reader'));
const AboutPage = React.lazy(() => import('./pages/about'));
const ContactPage = React.lazy(() => import('./pages/contact'));
const PrivacyPage = React.lazy(() => import('./pages/privacy'));
const ReportBugPage = React.lazy(() => import('./pages/report-bug'));
const InstallAppPage = React.lazy(() => import('./pages/install-app'));

const AuthPage = React.lazy(() => import('./pages/auth'));
const AuthSuccessPage = React.lazy(() => import('./pages/auth-success'));
const AuthCallbackPage = React.lazy(() => import('./pages/auth-callback'));
const ProfilePage = React.lazy(() => import('./pages/profile'));
const BookmarksPage = React.lazy(() => import('./pages/bookmarks'));
const SearchResultsPage = React.lazy(() => import('./pages/search-results'));
const NotificationsPage = React.lazy(() => import('./pages/notifications'));
const RecommendationsPage = React.lazy(() => import('./pages/recommendations'));

// Settings pages - lazy loaded to reduce initial bundle
const ProfileSettingsPage = React.lazy(() => import('./pages/settings/profile'));
const ConnectedAccountsPage = React.lazy(() => import('./pages/settings/connected-accounts'));
const FontSettingsPage = React.lazy(() => import('./pages/settings/fonts'));
const AccessibilitySettingsPage = React.lazy(() => import('./pages/settings/accessibility'));
const NotificationSettingsPage = React.lazy(() => import('./pages/settings/notifications'));
const PrivacySettingsPage = React.lazy(() => import('./pages/settings/privacy'));
const CookieManagementPage = React.lazy(() => import('./pages/settings/cookie-management'));
const QuickSettingsPage = React.lazy(() => import('./pages/settings/quick-settings'));
const PreviewSettingsPage = React.lazy(() => import('./pages/settings/preview'));

// Admin pages - lazy loaded
const AdminPage = React.lazy(() => import('./pages/admin'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/analytics'));
const AdminAnalyticsDashboardPage = React.lazy(() => import('./pages/admin/analytics-dashboard'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/users'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/settings'));
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

import { trackPageView } from '@/lib/metrics';
import { usePrefersReducedMotion } from './hooks/use-prefers-reduced-motion';

// Defer WordPress posts preloading until after initial page render
// This improves initial load time significantly
const preloadWordPressPostsDeferred = () => {
  // Use requestIdleCallback for browsers that support it, or setTimeout as fallback
  const run = async () => {
    try {
      const { preloadWordPressPosts } = await import('./lib/wordpress-api');
      preloadWordPressPosts();
    } catch {}
  };
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(() => { void run(); }, { timeout: 2000 });
  } else {
    setTimeout(() => { void run(); }, 1000); // 1-second delay
  }
};

const AppContent = () => {
  const [location] = useLocation();
  const locationStr = location.toString();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPageTransition, setIsPageTransition] = useState(false);
  const [previousLocation, setPreviousLocation] = useState('');

  // Basic SEO: set canonical and defaults site-wide
  const canonical = locationStr || '/';
  const isReaderLike = locationStr.includes('/reader');
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
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

  // Record page views on route changes
  useEffect(() => {
    if (!isErrorPage) {
      trackPageView(location);
    }
  }, [location, isErrorPage]);

  

  // If we're on an error page, render only the error page with proper landmark structure
  if (isErrorPage) {
    return (
      <ErrorBoundary>
        <main id="main-content" tabIndex={-1} className="min-h-screen">
          <Switch>
            <Route path="/errors/403" component={Error403Page} />
            <Route path="/errors/404" component={Error404Page} />
            <Route path="/errors/429" component={Error429Page} />
            <Route path="/errors/500" component={Error500Page} />
            <Route path="/errors/503" component={Error503Page} />
            <Route path="/errors/504" component={Error504Page} />
          </Switch>
        </main>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {/* Global SEO defaults; pages can override with their own SEO if desired */}
      <React.Suspense fallback={null}>
        <SEO title={undefined} canonical={canonical} />
      </React.Suspense>
      {/* Skip to content: hidden until focused, not intrusive */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div
        className={`page-transition-container min-h-screen w-full min-w-full max-w-full overflow-x-hidden bg-background text-foreground 
          m-0 p-0 px-0 mx-0`}
         style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', margin: '0 auto', paddingTop: isReaderLike ? 'calc(var(--navbar-height, 56px) + 15px)' : 'calc(var(--navbar-height, 56px) + 12px)' }}>
        {/* Main navigation bar */}
        <React.Suspense fallback={null}>
          <AutoHideNavbar />
        </React.Suspense>
        {/* Main content landmark for accessibility */}
        <main id="main-content" tabIndex={-1} className="flex-1 min-h-screen">
          {isReaderLike ? (
            <div key={locationStr} className="page-content">
              <Switch>
                {/* Main Pages */}
                <Route path="/" component={HomePage} />
                <Route path="/stories" component={StoriesPage} />
                <Route path="/reader" component={ReaderPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/report-bug" component={ReportBugPage} />
                <Route path="/install" component={InstallAppPage} />
                <Route path="/install" component={InstallAppPage} />

                {/* Authentication */}
                <Route path="/auth" component={AuthPage} />
                <Route path="/auth-success" component={AuthSuccessPage} />
                <Route path="/auth/success" component={AuthSuccessPage} />
                <Route path="/auth/callback" component={AuthCallbackPage} />
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
                <Route path="/admin/posts" component={AdminManagePostsPage} />
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
          ) : (
            <PageTransition>
                <div className="page-content">
                  <Switch>
                    {/* Main Pages */}
                    <Route path="/" component={HomePage} />
                    <Route path="/stories" component={StoriesPage} />
                    <Route path="/reader" component={ReaderPage} />
                    <Route path="/about" component={AboutPage} />
                    <Route path="/contact" component={ContactPage} />
                    <Route path="/privacy" component={PrivacyPage} />
                    <Route path="/report-bug" component={ReportBugPage} />
                    <Route path="/install" component={InstallAppPage} />

                    {/* Authentication */}
                    <Route path="/auth" component={AuthPage} />
                    <Route path="/auth-success" component={AuthSuccessPage} />
                    <Route path="/auth/success" component={AuthSuccessPage} />
                    <Route path="/auth/callback" component={AuthCallbackPage} />
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
                    <Route
                      path="/admin/analytics-dashboard"
                      component={AdminAnalyticsDashboardPage}
                    />
                    <Route path="/admin/users" component={AdminUsersPage} />
                    <Route path="/admin/settings" component={AdminSettingsPage} />
                    <Route path="/admin/posts" component={AdminManagePostsPage} />
                    <Route path="/admin/manage-posts" component={AdminManagePostsPage} />
                    <Route path="/admin/content" component={AdminContentPage} />
                    <Route
                      path="/admin/content-management"
                      component={AdminContentManagementPage}
                    />
                    <Route
                      path="/admin/content-moderation"
                      component={AdminContentModerationPage}
                    />
                    <Route path="/admin/feedback" component={AdminFeedbackPage} />
                    <Route
                      path="/admin/feedback-management"
                      component={AdminFeedbackManagementPage}
                    />
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
            </PageTransition>
          )}
        </main>
        {/* Footer at page bottom */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

// Main App component
function App() {
  // Performance monitoring removed
  const [location] = useLocation();
  useA11y();

  // Initialize targeted smooth-scroll for in-page anchors
  useEffect(() => {
    initSmoothScroll();
  }, []);

  // Set up global error handlers
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  // CSRF protection is initialized in main.tsx via dynamic import

  // The page transition loading will be handled by AppContent component
  // where useLoading will be called after LoadingProvider is mounted

  // Initialize WordPress sync service and defer content preloading
  useEffect(() => {
    (async () => {
      try {
        const { initWordPressSync } = await import('./lib/wordpress-sync');
        initWordPressSync();
      } catch {}
      preloadWordPressPostsDeferred();
    })();
  }, []);

  

  // Function to handle data refresh
  const handleDataRefresh = async () => {
    // Invalidate all queries to refresh data
    await queryClient.invalidateQueries();
  };

  return (
    <GlobalErrorBoundary level="critical">
      <QueryClientProvider client={queryClient}>
        <GlobalLoadingProvider>
          <AuthProvider>
            <CookieConsentProvider>
              <ThemeProvider>
                <SidebarProvider>
                  <NotificationProvider>
                    <ScrollEffectsProvider>
                      <ErrorToastProvider>
                        <RefreshProvider>
                          {/* Warm the cache for posts to make navigation instant */}
                          <React.Suspense fallback={null}>
                            <PostsPrefetcher />
                          </React.Suspense>
                          {/* Wrap AppContent with PullToRefresh */}
                          <PullToRefresh onRefresh={handleDataRefresh}>
                            {/* Performance monitor overlay removed */}
                            <div className="app-content">
                              <React.Suspense fallback={<LoadingScreen />}>
                                <AppContent />
                              </React.Suspense>
                            </div>
                          </PullToRefresh>
                          {/* Site-wide elements outside of the main layout */}
                          <React.Suspense fallback={null}>
                            <CookieConsent />
                          </React.Suspense>
                          {location !== '/' && (
                            <React.Suspense fallback={null}>
                              <ScrollToTopButton position="bottom-right" />
                            </React.Suspense>
                          )}
                          
                          {/* Toast notifications */}
                          <React.Suspense fallback={null}>
                            <Toaster />
                          </React.Suspense>
                          <React.Suspense fallback={null}>
                            <Sonner position="bottom-left" className="fixed-sonner" />
                          </React.Suspense>
                        </RefreshProvider>
                      </ErrorToastProvider>
                    </ScrollEffectsProvider>
                  </NotificationProvider>
                </SidebarProvider>
              </ThemeProvider>
            </CookieConsentProvider>
          </AuthProvider>
        </GlobalLoadingProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
