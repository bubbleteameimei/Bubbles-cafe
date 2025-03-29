import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { Sonner } from './components/ui/sonner';
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
import { EnhancedPageTransition } from './components/enhanced-page-transition';
// Add critical fullwidth fix stylesheet
import './styles/fullwidth-fix.css';
// Using EnhancedPageTransition for smooth page transitions
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
// Import SidebarNavigation directly from sidebar-menu
import { SidebarNavigation } from './components/ui/sidebar-menu';
// We're using our enhanced loading implementation directly in EnhancedPageTransition
// Import WordPress API preload function for enhanced reliability
import { preloadWordPressPosts } from './lib/wordpress-api';
// Import WordPress sync service
import { initWordPressSync } from './lib/wordpress-sync';
// Import FeedbackButton component for site-wide feedback
import { FeedbackButton } from './components/feedback/FeedbackButton';
// Import our scroll effects provider for multi-speed scroll and gentle return
import ScrollEffectsProvider from './components/ScrollEffectsProvider';

import AutoHideNavbar from './components/layout/AutoHideNavbar';
import FullscreenButton from './components/FullscreenButton';
import SearchBar from './components/SearchBar';
// Import our notification system components
import { NotificationProvider } from './contexts/notification-context';
import { NotificationIcon } from './components/ui/notification-icon';
// Import Silent Ping feature
import { SilentPingProvider } from './contexts/silent-ping-context';
import SidebarHeader from './components/SidebarHeader';
import { PrimaryNav } from './components/primary-nav';
import ErrorToastProvider from './components/providers/error-toast-provider';
import NotFoundRouteHandler from './components/NotFoundRouteHandler';

// Import all pages directly - no lazy loading
import ReaderPage from './pages/reader';
import ResponsiveDemoPage from './pages/responsive-demo';
import ScrollDemoPage from './pages/scroll-demo';
import HomePage from './pages/home';
import StoriesPage from './pages/index';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import PrivacyPage from './pages/privacy';
import ReportBugPage from './pages/report-bug';
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
import DataExportPage from './pages/settings/data-export';
import CookieManagementPage from './pages/settings/cookie-management';
import QuickSettingsPage from './pages/settings/quick-settings';
import PreviewSettingsPage from './pages/settings/preview';

// Game pages
import EdenGamePage from './pages/games/eden';
import EdenCanvasGamePage from './pages/games/eden-game';
import EdenGameNewPage from './pages/games/eden-game-new';
import GameTestPage from './pages/game-test';

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
import FeedbackPage from './pages/feedback';
import UserFeedbackDashboardPage from './pages/user/feedback-dashboard';
import GuidelinesPage from './pages/support/guidelines';

// Preload WordPress posts immediately on app load
preloadWordPressPosts();

const AppContent = () => {
  const { user } = useAuth();
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
      <main className="min-h-screen flex-1 flex flex-col bg-background w-full min-w-full max-w-[100vw]" 
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <AutoHideNavbar />
        <div className="w-full min-w-full max-w-full pt-20 lg:pt-6 flex-1 bg-background m-0 p-0 px-0 mx-0"
             style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', margin: '0 auto' }}>
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
              
              {/* Demo Pages */}
              <Route path="/responsive-demo" component={ResponsiveDemoPage} />
              <Route path="/scroll-demo" component={ScrollDemoPage} />
              <Route path="/bookmarks" component={BookmarksPage} />
              <ProtectedRoute path="/profile" component={ProfilePage} />

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
              <ProtectedRoute path="/settings/fonts" component={FontSettingsPage} />
              <ProtectedRoute path="/settings/accessibility" component={AccessibilitySettingsPage} />
              <ProtectedRoute path="/settings/notifications" component={NotificationSettingsPage} />
              <ProtectedRoute path="/settings/privacy" component={PrivacySettingsPage} />
              <ProtectedRoute path="/settings/data-export" component={DataExportPage} />
              <ProtectedRoute path="/settings/cookie-management" component={CookieManagementPage} />
              <ProtectedRoute path="/settings/quick-settings" component={QuickSettingsPage} />
              <ProtectedRoute path="/settings/preview" component={PreviewSettingsPage} />

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
  const [location] = useLocation();
  
  // Setup performance monitoring
  usePerformanceMonitoring();

  // Initialize WordPress sync service - managed internally with its own state
  useEffect(() => {
    initWordPressSync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CookieConsentProvider>
          <ThemeProvider>
            <SidebarProvider>
              <NotificationProvider>
                <SilentPingProvider>
                  <ScrollEffectsProvider>
                    <ErrorToastProvider>
                        <EnhancedPageTransition minLoadingTime={850}>
                          <AppContent />
                        </EnhancedPageTransition>
                        {/* Site-wide elements outside of the main layout */}
                        <CookieConsent />
                        <ScrollToTopButton />
                        <FeedbackButton />
                        
                        {/* Toast notifications */}
                        <Toaster />
                        <Sonner position="bottom-left" className="fixed-sonner" />
                    </ErrorToastProvider>
                  </ScrollEffectsProvider>
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