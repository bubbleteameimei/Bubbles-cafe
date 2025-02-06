import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, Menu, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useCallback, useState, memo } from "react";

const NavLink = memo(({ href, isActive, children, onClick }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const [, setLocation] = useLocation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      setLocation(href);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [href, onClick, setLocation]);

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        nav-link relative px-3 py-2 text-base transition-colors duration-300
        ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}
      `}
    >
      {children}
    </a>
  );
});

NavLink.displayName = "NavLink";

const Navigation = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
  }, [setVolume]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleNavClick = useCallback((href: string) => {
    setLocation(href);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setLocation]);

  const navigationItems = (
    <>
      <NavLink href="/" isActive={location === "/"}>Home</NavLink>
      <div className="relative group">
        <NavLink href="/stories" isActive={location === "/stories"}>Stories</NavLink>
        <Button 
          variant="ghost" 
          className="ml-2"
          onClick={() => setIsIndexOpen(true)}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <NavLink href="/secret" isActive={location === "/secret"}>Secret Stories</NavLink>
      <NavLink href="/about" isActive={location === "/about"}>About</NavLink>
      <NavLink href="/admin" isActive={location.startsWith("/admin")}>Admin</NavLink>
    </>
  );

  return (
    <header className="bg-background">
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Bubble's Cafe</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] pt-16">
                <nav className="flex flex-col space-y-4">
                  {navigationItems}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navigationItems}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              disabled={!audioReady}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
              title={audioReady ? (isPlaying ? "Mute" : "Unmute") : "Audio loading..."}
            >
              {isPlaying ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            <div className="w-24 hidden md:block">
              <Slider
                defaultValue={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                disabled={!audioReady}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      <Drawer open={isIndexOpen} onOpenChange={setIsIndexOpen}>
        <DrawerContent>
          <div className="max-w-3xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold mb-6">Story Index</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {posts?.map((post, index) => (
                <div 
                  key={post.id} 
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setLocation(`/stories?index=${index}`);
                    setIsIndexOpen(false);
                  }}
                >
                  <h4 className="font-semibold mb-2">{post.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
};

export default memo(Navigation);