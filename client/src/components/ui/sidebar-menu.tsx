import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, Monitor, Bell, Lock, Building,
  Mail, MessageSquare, Palette, Type,
  User, Link2 as Link, CircleUserRound as UserCircle, Bookmark as BookmarkIcon,
  LineChart, Eye, Star, Compass, Database, Globe, ShieldAlert
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth"
// Removed loading provider import for instant navigation
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar"

// Code Quality: Break up large components into smaller ones for maintainability.
export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  // Removed loading hook for instant navigation
  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const sidebar = useSidebar();

  // Reference to the menu container for better scroll management
  const menuContainerRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to top of menu when necessary
  const scrollToTop = React.useCallback(() => {
    if (menuContainerRef.current) {
      menuContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Function to ensure dropdown is visible when opened
  const ensureDropdownVisible = React.useCallback((element: HTMLElement) => {
    if (menuContainerRef.current) {
      const container = menuContainerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, []);

  // Add swipe to close functionality with improved reliability
  React.useEffect(() => {
    // Always compute a cleanup to satisfy noImplicitReturns
    let cleanup: (() => void) | undefined

    // Only add touch events if sidebar is open
    if (sidebar?.openMobile) {
      // Keep track of the starting position and movement
      let startX = 0
      let startY = 0
      let moveX = 0
      let moveY = 0
      let isScrolling = false
      let isSidebarTouch = false

      const handleTouchStart = (e: Event) => {
        const te = e as TouchEvent
        const target = te.target as HTMLElement
        // Only handle touches that start within the sidebar container
        const sidebarContainer = target.closest('[data-sidebar="sidebar"], .sidebar-menu-container')
        if (!sidebarContainer) {
          return // Don't interfere with touches outside sidebar
        }
        // Check if the touch started on a button or interactive element
        const isButton = target.closest('button, a, [role="button"], .interactive-element')
        const scrollContainer = target.closest('.sidebar-menu-container')
        // Don't interfere with button clicks or interactive elements
        if (isButton) {
          return
        }
        if (scrollContainer) {
          // Allow normal scrolling if touching a scrollable area
          isScrolling = true
          isSidebarTouch = true
          return
        }
        // Store both X and Y coordinates to detect diagonal swipes
        startX = te.touches[0].clientX
        startY = te.touches[0].clientY
        setTouchStartX(startX)
        isScrolling = false
        isSidebarTouch = true
      }

      const handleTouchMove = (e: Event) => {
        if (!touchStartX || isScrolling || !isSidebarTouch) return
        const te = e as TouchEvent
        // Check if we're touching an interactive element
        const target = te.target as HTMLElement
        const isButton = target.closest('button, a, [role="button"], .interactive-element')
        // Don't interfere with button interactions
        if (isButton) {
          return
        }
        // Get current position
        moveX = te.touches[0].clientX
        moveY = te.touches[0].clientY
        // Calculate horizontal and vertical difference
        const touchDiffX = startX - moveX
        const touchDiffY = Math.abs(startY - moveY)
        // Only trigger close if swipe is primarily horizontal (not diagonal)
        // This prevents accidental closes when scrolling the menu
        if (touchDiffX > 50 && touchDiffY < 40) {
          // Close the sidebar both ways to ensure it properly closes
          sidebar.setOpenMobile(false)
          // Force the sheet to close by finding and clicking its close button
          const closeButton = document.querySelector('[data-sidebar="sidebar"] button') as HTMLButtonElement
          if (closeButton) {
            closeButton.click()
          }
          setTouchStartX(null) // Reset touch start
          isSidebarTouch = false
        }
      }

      const handleTouchEnd = (_e: Event) => {
        // Reset all touch values
        startX = 0
        startY = 0
        moveX = 0
        moveY = 0
        isScrolling = false
        isSidebarTouch = false
        setTouchStartX(null)
      }

      // Add event listeners with passive: true for better performance
      // Only listen on the sidebar container to avoid interfering with other elements
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement | null
      if (sidebarElement) {
        const se = sidebarElement as HTMLElement
        se.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true })
        se.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true })
        se.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true })

        cleanup = () => {
          se.removeEventListener('touchstart', handleTouchStart as EventListener)
          se.removeEventListener('touchmove', handleTouchMove as EventListener)
          se.removeEventListener('touchend', handleTouchEnd as EventListener)
        }
      }
    }

    return cleanup
  }, [sidebar, touchStartX]) // Dependencies include sidebar and touchStartX

  // Simplified navigation - no state needed for instant switching

  // Prefetch data endpoints to speed up first navigation
  const prefetchDataForRouteEarly = React.useCallback(async (href: string) => {
    try {
      switch (href) {
        case '/stories':
        case '/index': {
          // Warm stories list
          await fetch('/api/posts?limit=100', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/community': {
          await fetch('/api/posts/community?limit=50', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/bookmarks': {
          // Try user bookmarks, fall back to anonymous
          const res = await fetch('/api/bookmarks', { credentials: 'include' }).catch(() => null);
          if (!res || !res.ok) {
            await fetch('/api/reader/bookmarks', { credentials: 'include' }).catch(() => {});
          }
          break;
        }
        case '/profile': {
          await fetch('/api/auth/status', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/search': {
          await fetch('/api/search/suggest?limit=8', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/reader': {
          // Prefetch first page of posts as a heuristic
          await fetch('/api/posts?page=1&limit=9', { credentials: 'include' }).catch(() => {});
          break;
        }
        default:
          break;
      }
    } catch {}
  }, []);

  // Async route prefetch map (returns a promise to await before navigating)
  const prefetchRouteAsync = React.useCallback((href: string): Promise<any> => {
    try {
      switch (href) {
        case '/':
          return import('../../pages/home');
        case '/stories':
          return import('../../pages/index');
        case '/index':
          return import('../../pages/index');
        case '/reader':
          return import('../../pages/reader');
        case '/community':
          return import('../../pages/community');
        case '/about':
          return import('../../pages/about');
        case '/bookmarks':
          return import('../../pages/bookmarks');
        case '/profile':
          return import('../../pages/profile');
        case '/search':
          return import('../../pages/search-results');
        case '/admin':
        case '/admin/dashboard':
          return import('../../pages/admin/dashboard');
        default:
          return Promise.resolve();
      }
    } catch {
      return Promise.resolve();
    }
  }, []);

  // Navigate directly to the reader page (not latest story)
  const navigateToReader = React.useCallback(async () => {
    try {
      if (sidebar) sidebar.setOpenMobile(false);
      React.startTransition(() => {
        setLocation('/reader');
      });
      requestAnimationFrame(() => {
        const idle = (window as any).requestIdleCallback as ((cb: () => void, opts?: any) => void) | undefined;
        const run = () => {
          prefetchRouteAsync('/reader').catch(() => {});
          void prefetchDataForRouteEarly('/reader');
        };
        if (typeof idle === "function") {
          idle(run);
        } else {
          setTimeout(run, 0);
        }
      });
    } catch {
      window.location.href = '/reader';
    }
  }, [setLocation, sidebar, prefetchRouteAsync, prefetchDataForRouteEarly]);

  const handleNavigation = React.useCallback((path: string) => {
    // Prevent duplicate navigation
    if (location === path) {
      // Just close sidebar if already on this page
      if (sidebar && sidebar.isMobile) {
        sidebar.setOpenMobile(false);
      }
      // Scroll to top if on same page
      scrollToTop();
      return;
    }

    try {
      // 1. Reset UI state (all menus closed) — keep minimal to avoid blocking input
      setDisplayOpen(false);
      setAccountOpen(false);
      setSupportOpen(false);
      setAdminOpen(false);

      // 2. If callback provided, call it
      if (onNavigate) {
        onNavigate();
      }

      // 3. Close the sidebar immediately for instant feedback
      if (sidebar) {
        sidebar.setOpenMobile(false);
      }

      // 4. Route change in a transition so the browser can paint promptly
      React.startTransition(() => {
        setLocation(path);
      });

      // 5. Defer heavy prefetch/warmup to post-paint to avoid blocking INP
      requestAnimationFrame(() => {
        const idle = (window as any).requestIdleCallback as ((cb: () => void, opts?: any) => void) | undefined;
        const run = () => {
          prefetchRouteAsync(path).catch(() => {});
          void prefetchDataForRouteEarly(path);
        };
        if (typeof idle === "function") {
          idle(run);
        } else {
          setTimeout(run, 0);
        }
      });

    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback: navigate directly if anything unexpected happens
      window.location.href = path;
    }
  }, [location, onNavigate, sidebar, setLocation, scrollToTop, prefetchRouteAsync, prefetchDataForRouteEarly]);

  // Function to render the active indicator for menu items
  const renderActiveIndicator = (_path: string) => {
    // Removed the line indicator to fix visual glitch
    return null;
  };

  // Prefetch data endpoints to speed up first navigation
  const prefetchDataForRoute = React.useCallback(async (href: string) => {
    try {
      switch (href) {
        case '/stories':
        case '/index': {
          // Warm stories list
          await fetch('/api/posts?limit=100', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/community': {
          await fetch('/api/posts/community?limit=50', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/bookmarks': {
          // Try user bookmarks, fall back to anonymous
          const res = await fetch('/api/bookmarks', { credentials: 'include' }).catch(() => null);
          if (!res || !res.ok) {
            await fetch('/api/reader/bookmarks', { credentials: 'include' }).catch(() => {});
          }
          break;
        }
        case '/profile': {
          await fetch('/api/auth/status', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/search': {
          await fetch('/api/search/suggest?limit=8', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/reader': {
          // Prefetch first page of posts as a heuristic
          await fetch('/api/posts?page=1&limit=9', { credentials: 'include' }).catch(() => {});
          break;
        }
        default:
          break;
      }
    } catch {}
  }, []);

  // Prefetch route chunks on hover/focus for faster navigations
  const prefetchRoute = React.useCallback((href: string) => {
    try {
      switch (href) {
        case '/':
          void import('../../pages/home');
          break;
        case '/stories':
          void import('../../pages/index');
          break;
        case '/index':
          void import('../../pages/index');
          break;
        case '/reader':
          void import('../../pages/reader');
          break;
        case '/community':
          void import('../../pages/community');
          break;
        case '/about':
          void import('../../pages/about');
          break;
        case '/bookmarks':
          void import('../../pages/bookmarks');
          break;
        case '/profile':
          void import('../../pages/profile');
          break;
        case '/search':
          void import('../../pages/search-results');
          break;
        // Admin routes (only import modules that exist)
        case '/admin':
        case '/admin/dashboard':
          void import('../../pages/admin/dashboard');
          break;
        case '/admin/content-management':
          void import('../../pages/admin/content-management');
          break;
        case '/admin/themes':
          void import('../../pages/admin/themes');
          break;
        case '/admin/wordpress-sync':
          void import('../../pages/admin/WordPressSyncPage');
          break;
        case '/admin/users':
          void import('../../pages/admin/users');
          break;
        case '/admin/moderation':
          void import('../../pages/admin/content-moderation');
          break;
        case '/admin/analytics':
          void import('../../pages/admin/analytics');
          break;
        case '/admin/feedback':
          void import('../../pages/admin/feedback');
          break;
        case '/admin/settings':
          void import('../../pages/admin/settings');
          break;
        case '/admin/email-test':
          void import('../../pages/admin/email-test');
          break;
        default:
          break;
      }
      // Also warm likely data endpoints for the route
      void prefetchDataForRoute(href);
    } catch {}
  }, [prefetchDataForRoute]);

  // Opportunistically prefetch the story index once per session for faster first navigation
  React.useEffect(() => {
    try {
      const DONE_KEY = 'bc_prefetch_stories_done';
      if (!sessionStorage.getItem(DONE_KEY)) {
        const id = setTimeout(() => {
          prefetchRoute('/index');
          void prefetchDataForRoute('/index');
          sessionStorage.setItem(DONE_KEY, '1');
        }, 600);
        return () => clearTimeout(id);
      }
    } catch {}
    return;
  }, [prefetchRoute, prefetchDataForRoute]);

  // Compact, minimal top-level menu styling
  const menuItemClass = cn(
    "sidebar-menu-button-enhanced",
    // much tighter spacing
    "group relative flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-medium",
    "text-sidebar-foreground/85 hover:text-sidebar-foreground",
    "transition-all duration-150 ease-out",
    // fully transparent hover
    "hover:bg-transparent hover:shadow-none",
    // simple active state: no box/backgrounds
    "data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground data-[active=true]:font-semibold",
    "whitespace-nowrap overflow-hidden",
    "font-sans"
  );

  // Submenu styling - transparent, subtle active (no boxes)
  const submenuItemClass = "px-2 py-1 pr-8 text-[12px] font-medium text-[hsl(var(--sidebar-foreground))] whitespace-nowrap overflow-hidden min-h-[28px] flex items-center -mb-0.5 rounded-sm transition-colors duration-150 ease-out hover:bg-transparent focus:bg-transparent border-l border-transparent data-[active=true]:border-l-primary/40";





  return (
    <motion.div 
      ref={menuContainerRef}
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="flex flex-col h-full sidebar-menu-container relative bg-transparent"
      role="navigation"
      aria-label="Main navigation"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
      }}
    >
      {/* Removed gradient overlay that was interfering with bottom buttons */}

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-0 pt-0 px-2 pb-24 md:pb-8 scroll-smooth sidebar-menu-container focus:outline-none focus-visible:outline-none bg-transparent"
           style={{
             scrollBehavior: 'smooth',
             scrollbarWidth: 'thin',
             msOverflowStyle: 'auto',
             WebkitOverflowScrolling: 'touch',
             overscrollBehavior: 'contain'
           }}>

        {/* Main Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <SidebarGroup className="space-y-0 -mt-8">
            <SidebarGroupLabel className="sidebar-group-label-enhanced px-1.5 text-[11px] font-bold text-sidebar-foreground/60 uppercase tracking-wider mb-4 font-sans">
              Navigation
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                <SidebarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SidebarMenuButton
                      isActive={location === '/'}
                      size="sm"
                      onClick={() => handleNavigation('/')}
                      onMouseEnter={() => prefetchRoute('/')}
                      onFocus={() => prefetchRoute('/')}
                      tooltip="Home"
                      className={menuItemClass}
                      aria-current={location === '/' ? 'page' : undefined}
                    >
                      <Home className="sidebar-icon-enhanced h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
                      <span className="sidebar-menu-text-enhanced">HOME</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.25,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SidebarMenuButton
                      isActive={location === '/index'}
                      size="sm"
                      onClick={() => handleNavigation('/index')}
                      onMouseEnter={() => prefetchRoute('/index')}
                      onFocus={() => prefetchRoute('/index')}
                      tooltip="Story Index"
                      className={menuItemClass}
                      aria-current={location === '/index' ? 'page' : undefined}
                    >
                      {renderActiveIndicator('/index')}
                      <Scroll className="sidebar-icon-enhanced h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
                      <span className="sidebar-menu-text-enhanced">STORY INDEX</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SidebarMenuButton
                      isActive={location === '/reader'}
                      size="sm"
                      onClick={() => navigateToReader()}
                      onMouseEnter={() => prefetchRoute('/reader')}
                      onFocus={() => prefetchRoute('/reader')}
                      tooltip="Interactive Reader"
                      className={menuItemClass}
                      aria-current={location === '/reader' ? 'page' : undefined}
                    >
                      {renderActiveIndicator('/reader')}
                      <Book className="h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
                      <span className="sidebar-menu-text-enhanced">READER</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.35,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SidebarMenuButton
                      isActive={location === '/community'}
                      size="sm"
                      onClick={() => handleNavigation('/community')}
                      onMouseEnter={() => prefetchRoute('/community')}
                      onFocus={() => prefetchRoute('/community')}
                      tooltip="Community Hub"
                      className={menuItemClass}
                      aria-current={location === '/community' ? 'page' : undefined}
                    >
                      {renderActiveIndicator('/community')}
                      <Users className="h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
                      <span className="sidebar-menu-text-enhanced">COMMUNITY</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SidebarMenuButton
                      isActive={location === '/bookmarks'}
                      size="sm"
                      onClick={() => handleNavigation('/bookmarks')}
                      onMouseEnter={() => prefetchRoute('/bookmarks')}
                      onFocus={() => prefetchRoute('/bookmarks')}
                      tooltip="Saved Stories"
                      className={menuItemClass}
                      aria-current={location === '/bookmarks' ? 'page' : undefined}
                    >
                      {renderActiveIndicator('/bookmarks')}
                      <BookmarkIcon className="h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
                      <span className="sidebar-menu-text-enhanced">BOOKMARKS</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </motion.div>

        <SidebarSeparator className="my-2" />

      {/* Games & Interactive Experiences - Placeholder */}
      <SidebarGroup className="-mt-10 p-0 pt-0">
        <SidebarGroupLabel className="h-5 px-1.5 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-2 uppercase tracking-wider">
          GAMES & INTERACTIVE
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-3">
          <SidebarMenu className="space-y-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/eden-hollow'}
                onClick={() => handleNavigation('/eden-hollow')}
                tooltip="Eden's Hollow - Coming Soon"
                className={menuItemClass}
                aria-current={location === '/eden-hollow' ? 'page' : undefined}
              >
                {renderActiveIndicator('/eden-hollow')}
                <Eye className="h-5 w-5" />
                <span>Eden's Hollow</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Accessibility */}
      <SidebarGroup className="-mt-10 p-0 pt-0">
        <SidebarGroupLabel className="h-5 px-1.5 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-2 uppercase tracking-wider">
          READING & ACCESSIBILITY
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-3">
          <SidebarMenu className="space-y-0">
            <SidebarMenuItem>
              <Collapsible 
                open={displayOpen} 
                onOpenChange={(open) => {
                  setDisplayOpen(open);
                  if (open) {
                    // Ensure dropdown is visible when opened
                    setTimeout(() => {
                      const trigger = document.querySelector('.sidebar-collapsible-trigger[data-state="open"]') as HTMLElement;
                      if (trigger) {
                        ensureDropdownVisible(trigger);
                      }
                    }, 150);
                  }
                }}
                className="sidebar-dropdown-container"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-transparent data-[state=open]:text-[hsl(var(--sidebar-foreground))] hover:bg-transparent whitespace-nowrap sidebar-collapsible-trigger"
                    aria-expanded={displayOpen}
                    aria-controls="accessibility-settings-content"
                  >
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Accessibility Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                      displayOpen && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent id="accessibility-settings-content" className="overflow-hidden sidebar-collapsible-content">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.08, ease: [0.4, 0, 0.2, 1] }}
                    className="px-0 py-0.5"
                  >
                    <SidebarMenuSub className="space-y-0 border-l border-sidebar-border/30 ml-2 pl-3">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/fonts'}
                        onClick={() => handleNavigation('/settings/fonts')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/fonts' ? 'page' : undefined}
                      >
                        <Type className="h-7 w-7 mr-2" />
                        <span>Font Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/accessibility'}
                        onClick={() => handleNavigation('/settings/accessibility')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/accessibility' ? 'page' : undefined}
                      >
                        <HelpCircle className="h-7 w-7 mr-2" />
                        <span>Reading Preferences</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>


                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/quick-settings'}
                        onClick={() => handleNavigation('/settings/quick-settings')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/quick-settings' ? 'page' : undefined}
                      >
                        <Settings className="h-7 w-7 mr-2" />
                        <span>Quick Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    
                    </SidebarMenuSub>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Account Settings */}
      <SidebarGroup className="-mt-10 p-0 pt-0">
        <SidebarGroupLabel data-tooltip-anchor="account-settings" className="h-5 px-1.5 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-2 uppercase tracking-wider">
          ACCOUNT SETTINGS
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-3">
          <SidebarMenu className="space-y-0">
            <SidebarMenuItem>
              <Collapsible open={accountOpen} onOpenChange={setAccountOpen} className="sidebar-dropdown-container">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-transparent data-[state=open]:text-[hsl(var(--sidebar-foreground))] hover:bg-transparent whitespace-nowrap"
                  aria-expanded={accountOpen}
                  aria-controls="account-settings-content"
                >
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Account Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                      accountOpen && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent id="account-settings-content" className="overflow-hidden sidebar-collapsible-content">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.08, ease: [0.4, 0, 0.2, 1] }}
                    className="px-0 py-0.5"
                  >
                    <SidebarMenuSub className="space-y-0 border-l border-sidebar-border/30 ml-2 pl-3">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/profile'}
                          onClick={() => handleNavigation('/profile')}
                          className={submenuItemClass}
                          aria-current={location === '/profile' ? 'page' : undefined}
                        >
                          <UserCircle className="h-7 w-7 mr-2" />
                          <span>My Profile</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/profile'}
                        onClick={() => handleNavigation('/settings/profile')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/profile' ? 'page' : undefined}
                      >
                        <User className="h-7 w-7 mr-2" />
                        <span>Profile Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/notifications'}
                        onClick={() => handleNavigation('/settings/notifications')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/notifications' ? 'page' : undefined}
                      >
                        <Bell className="h-7 w-7 mr-2" />
                        <span>Notifications</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/privacy'}
                        onClick={() => handleNavigation('/settings/privacy')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/privacy' ? 'page' : undefined}
                      >
                        <Lock className="h-7 w-7 mr-2" />
                        <span>Privacy & Security</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Data export menu item removed */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/connected-accounts'}
                        onClick={() => handleNavigation('/settings/connected-accounts')}
                        className={submenuItemClass}
                        aria-current={location === '/settings/connected-accounts' ? 'page' : undefined}
                      >
                        <Link className="h-7 w-7 mr-2" />
                        <span>Connected Accounts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    </SidebarMenuSub>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Support & Legal */}
      <SidebarGroup className="-mt-10 p-0 pt-0">
        <SidebarGroupLabel className="h-5 px-1.5 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-2 uppercase tracking-wider">
          SUPPORT & LEGAL
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-3">
          <SidebarMenu className="space-y-0">
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen} className="sidebar-dropdown-container">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="w-full justify-between text-[hsl(var(--sidebar-foreground))] hover:bg-background/8 supports-[backdrop-filter]:hover:bg-background/6 data-[state=open]:bg-background/10 data-[state=open]:text-[hsl(var(--sidebar-foreground))] whitespace-nowrap"
                    aria-expanded={supportOpen}
                    aria-controls="support-legal-content"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Support & Legal</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                        supportOpen && "rotate-180"
                      )}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent id="support-legal-content" className="overflow-hidden sidebar-collapsible-content">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.08, ease: [0.4, 0, 0.2, 1] }}
                    className="px-0 py-0.5"
                  >
                    <SidebarMenuSub className="space-y-0 border-l border-sidebar-border/30 ml-2 pl-3">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/about'}
                        onClick={() => handleNavigation('/about')}
                        className={submenuItemClass}
                        aria-current={location === '/about' ? 'page' : undefined}
                      >
                        <Building className="h-7 w-7 mr-2" />
                        <span>About Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/feedback'}
                        onClick={() => handleNavigation('/feedback')}
                        className={submenuItemClass}
                        aria-current={location === '/feedback' ? 'page' : undefined}
                      >
                        <MessageSquare className="h-7 w-7 mr-2" />
                        <span>Feedback & Suggestions</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                        className={submenuItemClass}
                        aria-current={location === '/contact' ? 'page' : undefined}
                      >
                        <Mail className="h-7 w-7 mr-2" />
                        <span>Contact Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/terms'}
                        onClick={() => handleNavigation('/legal/terms')}
                        className={submenuItemClass}
                        aria-current={location === '/legal/terms' ? 'page' : undefined}
                      >
                        <FileText className="h-7 w-7 mr-2" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                        className={submenuItemClass}
                        aria-current={location === '/privacy' ? 'page' : undefined}
                      >
                        <Lock className="h-7 w-7 mr-2" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/copyright'}
                        onClick={() => handleNavigation('/legal/copyright')}
                        className={submenuItemClass}
                        aria-current={location === '/legal/copyright' ? 'page' : undefined}
                      >
                        <Shield className="h-7 w-7 mr-2" />
                        <span>Copyright Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Admin Navigation - Only show if user is admin */}
      {user?.isAdmin && (
        <SidebarGroup className="-mt-2">
          <SidebarGroupLabel className="px-1 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-0 uppercase tracking-wider">
            ADMINISTRATION
          </SidebarGroupLabel>
          <SidebarGroupContent className="-mt-0">
            <SidebarMenu className="space-y-0">
              <SidebarMenuItem>
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="sidebar-dropdown-container">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-[hsl(var(--sidebar-foreground))] whitespace-nowrap"
                      aria-expanded={adminOpen}
                      aria-controls="admin-controls-content"
                    >
                      <div className="flex items-center">
                        <Shield className="h-7 w-7 mr-2" />
                        <span>Admin Controls</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                        adminOpen && "rotate-180"
                      )} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent id="admin-controls-content" className="overflow-hidden sidebar-collapsible-content">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.08, ease: [0.4, 0, 0.2, 1] }}
                      className="px-0 py-0.5"
                    >
                      <SidebarMenuSub className="space-y-0 border-l border-sidebar-border/30 ml-2 pl-3">
                      {/* Dashboard - Keep as main admin page */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/dashboard'}
                          onClick={() => handleNavigation('/admin/dashboard')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/dashboard' ? 'page' : undefined}
                        >
                          <Monitor className="h-7 w-7 mr-2" />
                          <span>Dashboard</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Content Management - Merges Stories + Content + WordPress Sync */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/stories' || 
                            location === '/admin/content' || 
                            location === '/admin/wordpress-sync' ||
                            location === '/admin/content-management'
                          }
                          onClick={() => handleNavigation('/admin/content-management')}
                          className={submenuItemClass}
                          aria-current={
                            location === '/admin/content-management' ||
                            location === '/admin/stories' ||
                            location === '/admin/content' ||
                            location === '/admin/wordpress-sync'
                          }
                        >
                          <FileText className="h-7 w-7 mr-2" />
                          <span>Content Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Theme Management */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/themes'}
                          onClick={() => handleNavigation('/admin/themes')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/themes' ? 'page' : undefined}
                        >
                          <Palette className="h-7 w-7 mr-2" />
                          <span>Theme Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* User Management - Merges Users + Moderation */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/users' || 
                            location === '/admin/content-moderation'
                          }
                          onClick={() => handleNavigation('/admin/users')}
                          className={submenuItemClass}
                          aria-current={
                            location === '/admin/users' ||
                            location === '/admin/content-moderation'
                          }
                        >
                          <Users className="h-7 w-7 mr-2" />
                          <span>User Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Insights & Reports - Merges Analytics + Statistics + Feedback + Bug Reports */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/analytics' || 
                            location === '/admin/site-statistics' || 
                            location === '/admin/feedback' || 
                            location === '/admin/bug-reports'
                          }
                          onClick={() => handleNavigation('/admin/analytics')}
                          className={submenuItemClass}
                          aria-current={
                            location === '/admin/analytics' ||
                            location === '/admin/site-statistics' ||
                            location === '/admin/feedback' ||
                            location === '/admin/bug-reports'
                          }
                        >
                          <LineChart className="h-7 w-7 mr-2" />
                          <span>Insights &amp; Reports</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* WordPress Sync */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/wordpress-sync'}
                          onClick={() => handleNavigation('/admin/wordpress-sync')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/wordpress-sync' ? 'page' : undefined}
                        >
                          <Globe className="h-7 w-7 mr-2" />
                          <span>WordPress Sync</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Moderation */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/moderation'}
                          onClick={() => handleNavigation('/admin/moderation')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/moderation' ? 'page' : undefined}
                        >
                          <ShieldAlert className="h-7 w-7 mr-2" />
                          <span>Moderation</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Email Services */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/email-test'}
                          onClick={() => handleNavigation('/admin/email-test')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/email-test' ? 'page' : undefined}
                        >
                          <Mail className="h-7 w-7 mr-2" />
                          <span>Email Services</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Database */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/database'}
                          onClick={() => handleNavigation('/admin/database')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/database' ? 'page' : undefined}
                        >
                          <Database className="h-7 w-7 mr-2" />
                          <span>Database</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Admin Settings */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/settings'}
                          onClick={() => handleNavigation('/admin/settings')}
                          className={submenuItemClass}
                          aria-current={location === '/admin/settings' ? 'page' : undefined}
                        >
                          <Settings className="h-7 w-7 mr-2" />
                          <span>Admin Settings</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Footer Buttons */}
      <div className="mt-auto mb-0 border-t border-[hsl(var(--sidebar-border))] pt-3">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider px-4 py-2"
            onClick={() => handleNavigation("/auth")}
            aria-label="Sign in to your account"
          >
            SIGN IN
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider px-4 py-2"
            onClick={() => {
              if (logout) {
                logout();
              }
            }}
            aria-label="Sign out of your account"
          >
            SIGN OUT
          </Button>
        )}

        <motion.button
          onClick={() => handleNavigation('/report-bug')}
          whileHover={{ scale: 1.02, translateX: 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-2 mb-0 text-sm flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1",
            location === '/report-bug'
              ? "text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-accent))]"
              : "text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent))]"
          )}
          aria-label="Report a bug or issue"
          role="link"
        >
          <Bug className="h-4 w-4" aria-hidden="true" />
          <span className="uppercase tracking-wider font-medium">Report Bug</span>
        </motion.button>
      </div>
      </div>
    </motion.div>
  );
}