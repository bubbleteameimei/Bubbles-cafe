import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Pencil, Check, Loader2, AlertCircle, Skull, Brain, Ghost, Eye, Scissors, 
  Clock, Footprints, Utensils, Car, UserPlus, Bug, Cpu, Globe, AlertTriangle, 
  Scan, Castle, Copy, CloudRain, Hourglass, Axe, Cloud, Heart, Droplets, 
  Wind, ScanFace, Tally4, Sparkles, Syringe, Flame, Zap
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { THEME_CATEGORIES } from '@shared/theme-categories';
import { getThemeDefinitionOverrides, saveThemeDefinitionOverrides, syncThemeDefinitionOverridesFromServer } from '@/shared/theme-definitions';

/**
 * Iconify typeahead suggestions for common horror categories.
 * Admins can pick any slug; suggestions help discover popular Iconify icons.
 */
const ICONIFY_SUGGESTIONS: Array<{ value: string; label: string }> = [
  { value: 'mdi:ghost', label: 'Ghost (Supernatural/Haunting)' },
  { value: 'mdi:skull', label: 'Skull (Death/Demonic)' },
  { value: 'mdi:knife', label: 'Knife (Slasher)' },
  { value: 'mdi:car', label: 'Car (Vehicular)' },
  { value: 'mdi:foot-print', label: 'Footprints (Stalking/Zombie)' },
  { value: 'mdi:clock-outline', label: 'Clock (Time Horror)' },
  { value: 'mdi:radio', label: 'Radio (Paranormal/Contagion)' },
  { value: 'mdi:moon-waning-crescent', label: 'Moon (Cosmic/Vampiric)' },
  { value: 'mdi:castle', label: 'Castle (Gothic)' },
  { value: 'mdi:forest', label: 'Trees (Folk/Eco)' },
  { value: 'mdi:biohazard', label: 'Radiation (Apocalyptic)' },
  { value: 'mdi:bug', label: 'Bug (Parasite/Infestation)' },
  { value: 'mdi:flask-outline', label: 'Flask (Science Horror)' },
  { value: 'mdi:cpu-64-bit', label: 'CPU (Technological Horror)' },
  { value: 'mdi:building', label: 'Building (Urban Horror)' },
  { value: 'mdi:dog', label: 'Dog (Lycanthropic/Werewolf)' },
  { value: 'mdi:cat', label: 'Cat (Creature Horror)' },
  { value: 'mdi:torch', label: 'Flame (Demonic/Infernal)' },
  { value: 'mdi:alert-outline', label: 'Alert Triangle (Survival)' },
  { value: 'mdi:box', label: 'Box (Cursed Object)' },
  { value: 'mdi:moon-star', label: 'Moon Star (Dream/Nightmare/Occult)' },
  { value: 'mdi:drop', label: 'Droplet (Aquatic/Eco)' },
  { value: 'mdi:cloud-outline', label: 'Cloud (Isolation/Elemental)' },
  { value: 'mdi:knife-military', label: 'Knife (Alt)' },
  { value: 'mdi:human', label: 'Identity (Identity Horror)' }
];

// Icon mapping for theme categories
const THEME_ICONS: Record<string, React.ReactNode> = {
  'skull': <Skull className="h-4 w-4" />,
  'brain': <Brain className="h-4 w-4" />,
  'ghost': <Ghost className="h-4 w-4" />,
  'eye': <Eye className="h-4 w-4" />,
  'scissors': <Scissors className="h-4 w-4" />,
  'hourglass': <Hourglass className="h-4 w-4" />,
  'footprints': <Footprints className="h-4 w-4" />,
  'utensils': <Utensils className="h-4 w-4" />,
  'axe': <Axe className="h-4 w-4" />,
  'car': <Car className="h-4 w-4" />,
  'user-plus': <UserPlus className="h-4 w-4" />,
  'bug': <Bug className="h-4 w-4" />,
  'cpu': <Cpu className="h-4 w-4" />,
  'globe': <Globe className="h-4 w-4" />,
  'doll': <AlertTriangle className="h-4 w-4" />,
  'scan': <Scan className="h-4 w-4" />,
  'castle': <Castle className="h-4 w-4" />,
  'copy': <Copy className="h-4 w-4" />,
  'clock': <Clock className="h-4 w-4" />,
  'cloud-rain': <CloudRain className="h-4 w-4" />,
  'alien': <Zap className="h-4 w-4" />,
  'cloud': <Cloud className="h-4 w-4" />,
  'droplets': <Droplets className="h-4 w-4" />,
  'sparkles': <Sparkles className="h-4 w-4" />,
  'syringe': <Syringe className="h-4 w-4" />,
  'wind': <Wind className="h-4 w-4" />,
  'scanface': <ScanFace className="h-4 w-4" />,
  'tally4': <Tally4 className="h-4 w-4" />,
  'heart': <Heart className="h-4 w-4" />,
  'flame': <Flame className="h-4 w-4" />
};

// Available icon options for selection
const ICON_OPTIONS = [
  { value: 'skull', label: 'Skull' },
  { value: 'brain', label: 'Brain' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'eye', label: 'Eye' },
  { value: 'scissors', label: 'Scissors' },
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'footprints', label: 'Footprints' },
  { value: 'utensils', label: 'Utensils' },
  { value: 'axe', label: 'Axe' },
  { value: 'car', label: 'Car' },
  { value: 'user-plus', label: 'Doppelgänger' },
  { value: 'bug', label: 'Bug' },
  { value: 'cpu', label: 'CPU' },
  { value: 'globe', label: 'Globe' },
  { value: 'doll', label: 'Doll' },
  { value: 'scan', label: 'Scan' },
  { value: 'castle', label: 'Castle' },
  { value: 'copy', label: 'Copy' },
  { value: 'clock', label: 'Clock' },
  { value: 'cloud-rain', label: 'Rain' },
  { value: 'alien', label: 'Alien' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'droplets', label: 'Droplets' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'syringe', label: 'Syringe' },
  { value: 'wind', label: 'Wind' },
  { value: 'scanface', label: 'Scan Face' },
  { value: 'tally4', label: 'Ritual Marks' },
  { value: 'heart', label: 'Heart' },
  { value: 'flame', label: 'Flame' }
];

export default function ThemesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [customIconInput, setCustomIconInput] = useState('');
  const [showCustomIconInput, setShowCustomIconInput] = useState(false);

  // Global theme definitions overrides
  const [defs, setDefs] = useState<Record<string, { label: string; icon: string }>>(() => {
    try {
      const raw = getThemeDefinitionOverrides();
      const init: Record<string, { label: string; icon: string }> = {};
      Object.entries(THEME_CATEGORIES).forEach(([key, info]) => {
        const baseLabel = (info as any).label || key;
        const baseIcon = (info as any).icon || 'eye';
        const ov = (raw && (raw as any)[key]) || {};
        init[key] = { label: ov.label || baseLabel, icon: ov.icon || baseIcon };
      });
      return init;
    } catch {
      const init: Record<string, { label: string; icon: string }> = {};
      Object.entries(THEME_CATEGORIES).forEach(([key, info]) => {
        init[key] = { label: (info as any).label || key, icon: (info as any).icon || 'eye' };
      });
      return init;
    }
  });

  // Sync overrides from server on mount (merge into local and rebuild UI state)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const merged = await syncThemeDefinitionOverridesFromServer();
        if (!mounted) return;
        const next: Record<string, { label: string; icon: string }> = {};
        Object.entries(THEME_CATEGORIES).forEach(([key, info]) => {
          const baseLabel = (info as any).label || key;
          const baseIcon = (info as any).icon || 'eye';
          const ov = (merged && (merged as any)[key]) || {};
          next[key] = { label: ov.label || baseLabel, icon: ov.icon || baseIcon };
        });
        setDefs(next);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  interface Post {
    id: number;
    title: string;
    theme_category?: string;
    themeCategory?: string;
    themeIcon?: string;
    theme_icon?: string;
    metadata?: any;
    slug: string;
    createdAt: string;
  }

  // Fetch all posts with their theme data
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/posts/admin/themes'],
    queryFn: async () => {
      const response = await fetch('/api/posts/admin/themes', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
  });

  // Mutation for updating a post's theme
  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, themeCategory, themeIcon }: { id: number; themeCategory: string; themeIcon?: string }) => {
      // If icon is provided, use it; otherwise, use the selectedIcon state
      const iconToSend = themeIcon || selectedIcon;
      return apiRequest(`/api/posts/${id}/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Support both camelCase and snake_case for backward compatibility
          themeCategory: themeCategory,
          themeIcon: iconToSend,
          // Include snake_case versions for older API compatibility
          theme_category: themeCategory,
          icon: iconToSend,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate multiple queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['/api/posts/admin/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ["wordpress", "posts"] });
      
      toast({
        title: 'Theme updated',
        description: 'The post theme has been successfully updated.',
      });
      setEditingId(null);
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update the post theme. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handler for starting the edit process
  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    const currentTheme = post.themeCategory || post.theme_category || 'HORROR';
    setSelectedTheme(currentTheme);
    
    // Get current icon from direct properties or metadata
    const metadataIcon = post.metadata?.themeIcon;
    const currentIcon = post.themeIcon || post.theme_icon || metadataIcon;
    
    // If the post already has an icon, use it; otherwise use theme default
    if (currentIcon) {
      setSelectedIcon(currentIcon);
      // If it's a custom icon that's not in our predefined list
      if (!Object.keys(THEME_ICONS).includes(currentIcon.toLowerCase())) {
        setSelectedIcon('custom');
        setCustomIconInput(currentIcon);
        setShowCustomIconInput(true);
      }
    } else {
      // Set the default icon based on the theme
      const themeInfo = THEME_CATEGORIES[currentTheme as keyof typeof THEME_CATEGORIES];
      setSelectedIcon(themeInfo?.icon || 'eye');
      setShowCustomIconInput(false);
      setCustomIconInput('');
    }
  };

  // Handler for saving the theme change
  const handleSave = (id: number) => {
    if (selectedTheme) {
      console.log('[Admin Themes] Saving theme:', { selectedTheme, selectedIcon });
      
      // Determine which icon to save based on whether custom option is selected
      const iconToUse = selectedIcon === "custom" ? 
        (customIconInput ? customIconInput : "ghost") : // Use ghost as default if custom is selected but empty
        selectedIcon;
      
      console.log('[Admin Themes] Final icon to save:', iconToUse);
      
      updateThemeMutation.mutate({ 
        id, 
        themeCategory: selectedTheme, 
        themeIcon: iconToUse 
      });
    }
  };
  
  // Handle custom icon input toggle
  const toggleCustomIconInput = () => {
    setShowCustomIconInput(!showCustomIconInput);
    if (!showCustomIconInput) {
      // When enabling custom input, keep the current icon as default
      setCustomIconInput(selectedIcon);
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts ? 
    (posts as Post[]).filter((post: Post) => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  return (
    <AdminLayout title="Theme Management">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Theme Management</CardTitle>
          <CardDescription>
            Manage theme categories for all posts. Each post can be assigned to one of the predefined horror theme categories with a corresponding icon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="flex items-center p-4 text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>Failed to load posts. Please try again.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Current Theme</TableHead>
                    <TableHead className="hidden md:table-cell">Icon</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post: Post) => {
                      // Use either camelCase or snake_case property based on what's available
                      const themeCategory = post.themeCategory || post.theme_category;
                      const themeKey = themeCategory as keyof typeof THEME_CATEGORIES;
                      const themeInfo = themeKey ? THEME_CATEGORIES[themeKey] : null;
                      
                      // Get icon from properties or metadata
                      const metadataIcon = post.metadata?.themeIcon;
                      const postIcon = post.themeIcon || post.theme_icon || metadataIcon;
                      const themeIcon = postIcon || (themeInfo?.icon || 'eye');
                      
                      console.log(`[Admin Themes] Post ${post.id} theme:`, { 
                        themeCategory, 
                        themeIcon,
                        post_theme: post.theme_category,
                        post_icon: post.theme_icon
                      });
                      
                      return (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{post.title}</span>
                              {/* Mobile-only theme display */}
                              <span className="md:hidden text-xs text-muted-foreground mt-1 flex items-center">
                                {String(themeIcon || '').includes(':')
                                  ? <Icon icon={String(themeIcon)} className="h-3 w-3" />
                                  : (THEME_ICONS[String(themeIcon || '').toLowerCase()] || <Eye className="h-3 w-3" />)
                                }
                                <span className="ml-1">
                                  {themeInfo?.label || 'Horror'}
                                </span>
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            {editingId === post.id ? (
                              <Select
                                value={selectedTheme}
                                onValueChange={(value) => {
                                  setSelectedTheme(value);
                                  // Update icon when theme changes
                                  const newThemeInfo = THEME_CATEGORIES[value as keyof typeof THEME_CATEGORIES];
                                  setSelectedIcon(newThemeInfo?.icon || 'eye');
                                }}
                                disabled={updateThemeMutation.isPending}
                              >
                                <SelectTrigger className="w-full md:w-[180px]">
                                  <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(THEME_CATEGORIES).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span>
                                {themeInfo?.label || 'None'}
                              </span>
                            )}
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            {editingId === post.id ? (
                              <div className="space-y-2">
                                {/* Combined icon dropdown with presets and custom input field */}
                                <div className="space-y-3">
                                  <Select
                                    value={selectedIcon}
                                    onValueChange={(value) => {
                                      setSelectedIcon(value);
                                      // If user selects "custom", show input field
                                      if (value === "custom") {
                                        setShowCustomIconInput(true);
                                      } else {
                                        setShowCustomIconInput(false);
                                        setCustomIconInput("");
                                      }
                                    }}
                                    disabled={updateThemeMutation.isPending}
                                  >
                                    <SelectTrigger className="w-full md:w-[180px]">
                                      <SelectValue placeholder="Select an icon">
                                        <div className="flex items-center">
                                          {selectedIcon !== "custom" ? 
                                            (
                                              String(selectedIcon).includes(':')
                                                ? <Icon icon={String(selectedIcon)} className="h-4 w-4" />
                                                : (THEME_ICONS[String(selectedIcon).toLowerCase()] || <Eye className="h-4 w-4" />)
                                            ) : 
                                            <span className="flex items-center">
                                              {String(customIconInput).includes(':')
                                                ? <Icon icon={String(customIconInput)} className="h-4 w-4" />
                                                : (THEME_ICONS[String(customIconInput).toLowerCase()] || <Eye className="h-4 w-4" />)
                                              }
                                              <span className="ml-2 truncate max-w-[100px]">Custom: {customIconInput || 'none'}</span>
                                            </span>
                                          }
                                          {selectedIcon !== "custom" && (
                                            <span className="ml-2 truncate">
                                              {ICON_OPTIONS.find(icon => icon.value === String(selectedIcon).toLowerCase())?.label || 'Icon'}
                                            </span>
                                          )}
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="custom">
                                        <div className="flex items-center">
                                          <Pencil className="h-4 w-4" />
                                          <span className="ml-2">Custom Icon...</span>
                                        </div>
                                      </SelectItem>
                                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">Preset Icons</div>
                                      {ICON_OPTIONS.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                          <div className="flex items-center">
                                            {THEME_ICONS[icon.value]}
                                            <span className="ml-2">{icon.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Show custom input only when user selects "custom" option */}
                                  {selectedIcon === "custom" && showCustomIconInput && (
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="Type a custom icon name"
                                        value={customIconInput}
                                        onChange={(e) => setCustomIconInput(e.target.value.toLowerCase())}
                                        className="w-full md:w-[180px]"
                                      />
                                      <div className="flex items-center">
                                        <span className="text-xs text-muted-foreground">Preview: </span>
                                        <span className="ml-2 flex items-center">
                                          {String(customIconInput).includes(':')
                                            ? <Icon icon={String(customIconInput)} className="h-4 w-4" />
                                            : (THEME_ICONS[String(customIconInput).toLowerCase()] || <Eye className="h-4 w-4" />)
                                          }
                                          <span className="ml-1">{customIconInput || 'eye'}</span>
                                        </span>
                                      </div>
                                      {(() => {
                                        const term = String(customIconInput || '').toLowerCase();
                                        const matches = ICONIFY_SUGGESTIONS
                                          .filter(s => term && (s.value.toLowerCase().includes(term) || s.label.toLowerCase().includes(term)))
                                          .slice(0, 6);
                                        return matches.length > 0 ? (
                                          <div className="mt-2 grid grid-cols-1 gap-1">
                                            {matches.map(s => (
                                              <button
                                                type="button"
                                                key={s.value}
                                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                                                onClick={() => { setCustomIconInput(s.value); setSelectedIcon('custom'); }}
                                              >
                                                <Icon icon={s.value} className="h-4 w-4" />
                                                <span>{s.label}</span>
                                              </button>
                                            ))}
                                          </div>
                                        ) : null;
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                {String(themeIcon || '').includes(':')
                                  ? <Icon icon={String(themeIcon)} className="h-4 w-4" />
                                  : (THEME_ICONS[String(themeIcon || '').toLowerCase()] || <Eye className="h-4 w-4" />)
                                }
                                <span className="ml-2">
                                  {ICON_OPTIONS.find(icon => icon.value === String(themeIcon || '').toLowerCase())?.label || themeIcon}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {editingId === post.id ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Mobile-only theme and icon selection */}
                                <div className="md:hidden space-y-2 mb-2">
                                  <Select
                                    value={selectedTheme}
                                    onValueChange={(value) => {
                                      setSelectedTheme(value);
                                      const newThemeInfo = THEME_CATEGORIES[value as keyof typeof THEME_CATEGORIES];
                                      setSelectedIcon(newThemeInfo?.icon || 'eye');
                                    }}
                                    disabled={updateThemeMutation.isPending}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select a theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(THEME_CATEGORIES).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Mobile version of the combined icon dropdown with presets and custom input field */}
                                  <div className="space-y-3">
                                    <Select
                                      value={selectedIcon}
                                      onValueChange={(value) => {
                                        setSelectedIcon(value);
                                        // If user selects "custom", show input field
                                        if (value === "custom") {
                                          setShowCustomIconInput(true);
                                        } else {
                                          setShowCustomIconInput(false);
                                          setCustomIconInput("");
                                        }
                                      }}
                                      disabled={updateThemeMutation.isPending}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an icon">
                                          <div className="flex items-center">
                                            {selectedIcon !== "custom" ? 
                                              (THEME_ICONS[selectedIcon.toLowerCase()] || <Eye className="h-4 w-4" />) : 
                                              <span className="flex items-center">
                                                {THEME_ICONS[customIconInput.toLowerCase()] || <Eye className="h-4 w-4" />}
                                                <span className="ml-2 truncate max-w-[100px]">Custom: {customIconInput || 'none'}</span>
                                              </span>
                                            }
                                            {selectedIcon !== "custom" && (
                                              <span className="ml-2 truncate">
                                                {ICON_OPTIONS.find(icon => icon.value === selectedIcon.toLowerCase())?.label || 'Icon'}
                                              </span>
                                            )}
                                          </div>
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="custom">
                                          <div className="flex items-center">
                                            <Pencil className="h-4 w-4" />
                                            <span className="ml-2">Custom Icon...</span>
                                          </div>
                                        </SelectItem>
                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">Preset Icons</div>
                                        {ICON_OPTIONS.map((icon) => (
                                          <SelectItem key={icon.value} value={icon.value}>
                                            <div className="flex items-center">
                                              {THEME_ICONS[icon.value]}
                                              <span className="ml-2">{icon.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    {/* Show custom input only when user selects "custom" option */}
                                    {selectedIcon === "custom" && showCustomIconInput && (
                                      <div className="space-y-2">
                                        <Input
                                          placeholder="Type a custom icon name"
                                          value={customIconInput}
                                          onChange={(e) => setCustomIconInput(e.target.value.toLowerCase())}
                                          className="w-full"
                                        />
                                        <div className="flex items-center">
                                          <span className="text-xs text-muted-foreground">Preview: </span>
                                          <span className="ml-2 flex items-center">
                                            {String(customIconInput).includes(':')
                                              ? <Icon icon={String(customIconInput)} className="h-4 w-4" />
                                              : (THEME_ICONS[String(customIconInput).toLowerCase()] || <Eye className="h-4 w-4" />)
                                            }
                                            <span className="ml-1">{customIconInput || 'eye'}</span>
                                          </span>
                                        </div>
                                        {(() => {
                                          const term = String(customIconInput || '').toLowerCase();
                                          const matches = ICONIFY_SUGGESTIONS
                                            .filter(s => term && (s.value.toLowerCase().includes(term) || s.label.toLowerCase().includes(term)))
                                            .slice(0, 6);
                                          return matches.length > 0 ? (
                                            <div className="mt-2 grid grid-cols-1 gap-1">
                                              {matches.map(s => (
                                                <button
                                                  type="button"
                                                  key={s.value}
                                                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                                                  onClick={() => { setCustomIconInput(s.value); setSelectedIcon('custom'); }}
                                                >
                                                  <Icon icon={s.value} className="h-4 w-4" />
                                                  <span>{s.label}</span>
                                                </button>
                                              ))}
                                            </div>
                                          ) : null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSave(post.id)}
                                  disabled={updateThemeMutation.isPending}
                                  className="w-full sm:w-auto"
                                >
                                  {updateThemeMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                  <span className="ml-1">Save</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                  disabled={updateThemeMutation.isPending}
                                  className="w-full sm:w-auto"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(post)}
                                className="flex items-center"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Global Theme Definitions</CardTitle>
          <CardDescription>
            Edit labels and default icons for theme keys. Changes persist locally and apply across Index and Reader.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(THEME_CATEGORIES).map(([key, info]) => {
                  const base = info as any;
                  const value = defs[key] || { label: base.label || key, icon: base.icon || 'eye' };
                  return (
                    <TableRow key={key}>
                      <TableCell className="text-xs">{key}</TableCell>
                      <TableCell>
                        <Input
                          value={value.label}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDefs(prev => ({ ...prev, [key]: { ...prev[key], label: v } }));
                          }}
                          className="w-full md:w-[220px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={value.icon}
                            onValueChange={(v) => setDefs(prev => ({ ...prev, [key]: { ...prev[key], icon: v } }))}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Icon slug" />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center">
                                    {THEME_ICONS[opt.value]}
                                    <span className="ml-2">{opt.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={value.icon}
                            onChange={(e) => {
                              const v = e.target.value.toLowerCase();
                              setDefs(prev => ({ ...prev, [key]: { ...prev[key], icon: v } }));
                            }}
                            placeholder="custom icon slug"
                            className="w-[160px]"
                          />
                          <span className="flex items-center text-xs text-muted-foreground">
                            <span className="mr-1">Preview:</span>
                            {String(value.icon || '').includes(':')
                              ? <Icon icon={String(value.icon)} className="h-4 w-4" />
                              : (THEME_ICONS[String(value.icon || '').toLowerCase()] || <Eye className="h-4 w-4" />)
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const baseLabel = base.label || key;
                            const baseIcon = base.icon || 'eye';
                            setDefs(prev => ({ ...prev, [key]: { label: baseLabel, icon: baseIcon } }));
                          }}
                        >
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  // Only save differences vs base THEME_CATEGORIES
                  const out: Record<string, { label?: string; icon?: string }> = {};
                  Object.entries(THEME_CATEGORIES).forEach(([key, info]) => {
                    const baseLabel = (info as any).label || key;
                    const baseIcon = (info as any).icon || 'eye';
                    const v = defs[key] || { label: baseLabel, icon: baseIcon };
                    const diff: { label?: string; icon?: string } = {};
                    if (v.label && v.label !== baseLabel) diff.label = v.label;
                    if (v.icon && v.icon !== baseIcon) diff.icon = v.icon;
                    if (diff.label || diff.icon) out[key] = diff;
                  });
                  await saveThemeDefinitionOverrides(out);
                  toast({ title: 'Theme definitions saved', description: 'Global labels and default icons updated.' });
                } catch (err) {
                  console.error('Save theme definitions failed', err);
                  toast({ title: 'Save failed', description: 'Unable to save theme definitions.', variant: 'destructive' });
                }
              }}
            >
              Save all
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  saveThemeDefinitionOverrides({});
                  const init: Record<string, { label: string; icon: string }> = {};
                  Object.entries(THEME_CATEGORIES).forEach(([key, info]) => {
                    init[key] = { label: (info as any).label || key, icon: (info as any).icon || 'eye' };
                  });
                  setDefs(init);
                  toast({ title: 'Theme definitions reset', description: 'Overrides cleared.' });
                } catch {}
              }}
            >
              Reset all
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}