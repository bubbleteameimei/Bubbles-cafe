import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Bell, Lock, Building, Shield,
  Mail, MessageSquare, Palette, Type,
  User, Link2 as Link, CircleUserRound as UserCircle, Bookmark as BookmarkIcon,
  Gamepad2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth"
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
  useSidebar
} from "@/components/ui/sidebar"

export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);

  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const sidebar = useSidebar();

  const menuContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = React.useCallback(() => {
    if (menuContainerRef.current) {
      menuContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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

  React.useEffect(() => {
    let cleanup: (() => void) | undefined

    if (sidebar?.openMobile) {
      let startX = 0
      let startY = 0
      let moveX = 0
      let moveY = 0
      let isScrolling = false
      let isSidebarTouch = false

      const handleTouchStart = (e: Event) => {
        const te = e as TouchEvent
        const target = te.target as HTMLElement
        const sidebarContainer = target.closest('[data-sidebar="sidebar"], .sidebar-menu-container')
        if (!sidebarContainer) {
          return
        }
        const isButton = target.closest('button, a, [role="button"], .interactive-element')
        const scrollContainer = target.closest('.sidebar-menu-container')
        if (isButton) {
          return
        }
        if (scrollContainer) {
          isScrolling = true
          isSidebarTouch = true
          return
        }
        startX = te.touches[0].clientX
        startY = te.touches[0].clientY
        setTouchStartX(startX)
        isScrolling = false
        isSidebarTouch = true
      }

      const handleTouchMove = (e: Event) => {
        if (!touchStartX || isScrolling || !isSidebarTouch) return
        const te = e as TouchEvent
        const target = te.target as HTMLElement
        const isButton = target.closest('button, a, [role="button"], .interactive-element')
        if (isButton) {
          return
        }
        moveX = te.touches[0].clientX
        moveY = te.touches[0].clientY
        const touchDiffX = startX - moveX
        const touchDiffY = Math.abs(startY - moveY)
        if (touchDiffX > 50 && touchDiffY < 40) {
          sidebar.setOpenMobile(false)
          const closeButton = document.querySelector('[data-sidebar="sidebar"] button') as HTMLButtonElement
          if (closeButton) {
            closeButton.click()
          }
          setTouchStartX(null)
          isSidebarTouch = false
        }
      }

      const handleTouchEnd = (_e: Event) => {
        startX = 0
        startY = 0
        moveX = 0
        moveY = 0
        isScrolling = false
        isSidebarTouch = false
        setTouchStartX(null)
      }

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
  }, [sidebar, touchStartX])

  const prefetchDataForRouteEarly = React.useCallback(async (href: string) => {
    try {
      switch (href) {
        case '/stories':
        case '/index': {
          await fetch('/api/posts?limit=100', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/community': {
          await fetch('/api/posts/community?limit=50', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/bookmarks': {
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
          await fetch('/api/posts?page=1&limit=9', { credentials: 'include' }).catch(() => {});
          break;
        }
        default:
          break;
      }
    } catch {}
  }, []);

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
    if (location === path) {
      if (sidebar && sidebar.isMobile) {
        sidebar.setOpenMobile(false);
      }
      scrollToTop();
      return;
    }

    try {
      setDisplayOpen(false);
      setAccountOpen(false);
      setSupportOpen(false);

      if (onNavigate) {
        onNavigate();
      }

      if (sidebar) {
        sidebar.setOpenMobile(false);
      }

      React.startTransition(() => {
        setLocation(path);
      });

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
      window.location.href = path;
    }
  }, [location, onNavigate, sidebar, setLocation, scrollToTop, prefetchRouteAsync, prefetchDataForRouteEarly]);

  const renderActiveIndicator = (_path: string) => {
    return null;
  };

  const prefetchDataForRoute = React.useCallback(async (href: string) => {
    try {
      switch (href) {
        case '/stories':
        case '/index': {
          await fetch('/api/posts?limit=100', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/community': {
          await fetch('/api/posts/community?limit=50', { credentials: 'include' }).catch(() => {});
          break;
        }
        case '/bookmarks': {
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
          await fetch('/api/posts?page=1&limit=9', { credentials: 'include' }).catch(() => {});
          break;
        }
        default:
          break;
      }
    } catch {}
  }, []);

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
        case '/admin':
        case '/admin/dashboard':
          void import('../../pages/admin/dashboard');
          break;
        default:
          break;
      }
      void prefetchDataForRoute(href);
    } catch {}
  }, [prefetchDataForRoute]);

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

  const menuItemClass = cn(
    "sidebar-menu-button-enhanced",
    "group relative flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-medium",
    "text-sidebar-foreground hover:text-sidebar-foreground",
    "transition-all duration-200 ease-out",
    "hover:bg-transparent hover:shadow-none",
    "data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground data-[active=true]:font-semibold",
    "whitespace-nowrap overflow-hidden",
    "font-sans"
  );

  const submenuItemClass = "px-3 py-2 pr-8 text-[13px] font-medium text-[hsl(var(--sidebar-foreground))] whitespace-nowrap overflow-hidden min-h-[34px] flex items-center mb-1.5 rounded-md transition-colors duration-200 ease-out hover:bg-background/6 focus:bg-background/6 border-l border-transparent data-[active=true]:border-l-primary/50";

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
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-0 pt-0 px-2 pb-2 md:pb-2 scroll-smooth sidebar-menu-container focus:outline-none focus-visible:outline-none bg-transparent"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Main Navigation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <SidebarGroup className="space-y-1 -mt-2 p-0 pt-0">
            <SidebarGroupLabel className="sidebar-group-label-enhanced h-6 px-4 text-[12px] font-bold text-sidebar-foreground/60 uppercase tracking-wider mb-2 font-sans">
              Navigation
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                <SidebarMenuItem>
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
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
                      <Home className="h-4 w-4 transition-transform duration-150" />
                      <span>HOME</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
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
                      <Scroll className="h-4 w-4 transition-transform duration-150" />
                      <span>STORY INDEX</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
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
                      <Book className="h-4 w-4 transition-transform duration-150" />
                      <span>READER</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
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
                      <Users className="h-4 w-4 transition-transform duration-150" />
                      <span>COMMUNITY</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
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
                      <BookmarkIcon className="h-4 w-4 transition-transform duration-150" />
                      <span>BOOKMARKS</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </motion.div>

        {/* Interactive Experiences */}
        <SidebarGroup className="mt-2 p-2 pt-1">
          <SidebarGroupLabel className="h-6 px-4 text-sm font-medium text-[hsl(var(--sidebar-foreground))] mb-2 uppercase tracking-wider">
            INTERACTIVE EXPERIENCES
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-0">
            <SidebarMenu className="space-y-2.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/eden-hollow'}
                  onClick={() => handleNavigation('/eden-hollow')}
                  tooltip="Eden - Experimental Game"
                  className={menuItemClass}
                  aria-current={location === '/eden-hollow' ? 'page' : undefined}
                >
                  {renderActiveIndicator('/eden-hollow')}
                  <Gamepad2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="text-[14px] sm:text-[15px] font-semibold">Eden - Experimental Game</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Accessibility */}
        <SidebarGroup className="mt-2 p-2 pt-1">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu className="space-y-4">
              <SidebarMenuItem>
                <Collapsible 
                  open={displayOpen} 
                  onOpenChange={(open) => {
                    setDisplayOpen(open);
                    if (open) {
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
                      className="w-full justify-between px-4 text-[13px] text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-transparent data-[state=open]:text-[hsl(var(--sidebar-foreground))] hover:bg-transparent whitespace-nowrap sidebar-collapsible-trigger"
                      aria-expanded={displayOpen}
                      aria-controls="accessibility-settings-content"
                    >
                      <span className="flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        <span>Accessibility Settings</span>
                      </span>
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
                      <SidebarMenuSub className="space-y-2.5 border-l border-sidebar-border/30 ml-2 pl-3">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/fonts'}
                            onClick={() => handleNavigation('/settings/fonts')}
                            className={submenuItemClass}
                            aria-current={location === '/settings/fonts' ? 'page' : undefined}
                          >
                            <Type className="h-4 w-4 mr-2" />
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
                            <HelpCircle className="h-4 w-4 mr-2" />
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
                            <Settings className="h-4 w-4 mr-2" />
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
        <SidebarGroup className="mt-2 p-2 pt-1">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu className="space-y-4">
              <SidebarMenuItem>
                <Collapsible open={accountOpen} onOpenChange={setAccountOpen} className="sidebar-dropdown-container">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between px-4 text-[13px] text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-transparent data-[state=open]:text-[hsl(var(--sidebar-foreground))] hover:bg-transparent whitespace-nowrap"
                      aria-expanded={accountOpen}
                      aria-controls="account-settings-content"
                    >
                      <span className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-2" />
                        <span>Account Settings</span>
                      </span>
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
                      <SidebarMenuSub className="space-y-2.5 border-l border-sidebar-border/30 ml-2 pl-3">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/profile'}
                            onClick={() => handleNavigation('/profile')}
                            className={submenuItemClass}
                            aria-current={location === '/profile' ? 'page' : undefined}
                          >
                            <UserCircle className="h-4 w-4 mr-2" />
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
                            <User className="h-4 w-4 mr-2" />
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
                            <Bell className="h-4 w-4 mr-2" />
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
                            <Lock className="h-4 w-4 mr-2" />
                            <span>Privacy &amp; Security</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/connected-accounts'}
                            onClick={() => handleNavigation('/settings/connected-accounts')}
                            className={submenuItemClass}
                            aria-current={location === '/settings/connected-accounts' ? 'page' : undefined}
                          >
                            <Link className="h-4 w-4 mr-2" />
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
        <SidebarGroup className="mt-2 p-2 pt-1">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu className="space-y-4">
              <SidebarMenuItem>
                <Collapsible open={supportOpen} onOpenChange={setSupportOpen} className="sidebar-dropdown-container">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between px-4 text-[13px] text-[hsl(var(--sidebar-foreground))] hover:bg-transparent data-[state=open]:bg-background/10 data-[state=open]:text-[hsl(var(--sidebar-foreground))] whitespace-nowrap"
                      aria-expanded={supportOpen}
                      aria-controls="support-legal-content"
                    >
                      <span className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Support &amp; Legal</span>
                      </span>
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
                      <SidebarMenuSub className="space-y-2.5 border-l border-sidebar-border/30 ml-2 pl-3">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/about'}
                            onClick={() => handleNavigation('/about')}
                            className={submenuItemClass}
                            aria-current={location === '/about' ? 'page' : undefined}
                          >
                            <Building className="h-4 w-4 mr-2" />
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
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Feedback &amp; Suggestions</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/report-bug'}
                            onClick={() => handleNavigation('/report-bug')}
                            className={submenuItemClass}
                            aria-current={location === '/report-bug' ? 'page' : undefined}
                          >
                            <Bug className="h-4 w-4 mr-2" />
                            <span>Report Bug</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/contact'}
                            onClick={() => handleNavigation('/contact')}
                            className={submenuItemClass}
                            aria-current={location === '/contact' ? 'page' : undefined}
                          >
                            <Mail className="h-4 w-4 mr-2" />
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
                            <FileText className="h-4 w-4 mr-2" />
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
                            <Lock className="h-4 w-4 mr-2" />
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
                            <Shield className="h-4 w-4 mr-2" />
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

        {/* Footer Buttons */}
        <div className="mb-0 pt-2">
          {!user ? (
            <Button
              variant="default"
              size="sm"
              className="w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider px-4 py-2"
              onClick={() => handleNavigation("/auth")}
              aria-label="Sign in to your account"
            >
              SIGN IN
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider px-4 py-2"
              onClick={() => { try { logout?.(); } catch {} }}
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
              "mt-3 mb-0 text-sm flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1",
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