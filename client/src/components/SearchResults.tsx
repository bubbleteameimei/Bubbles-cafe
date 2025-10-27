import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Ghost, Skull, Brain, Pill, Cpu, Dna, Footprints, CloudRain, Castle, Bug, Radiation, Umbrella, UserMinus2, Anchor, AlertTriangle, Building, Worm, Cloud, CloudFog, Flame, Eye, Hourglass, Cat, Moon, Dog, Radio, MoonStar, Box, Car, UserPlus, FlaskConical, Trees, ForkKnife, Bone } from 'lucide-react';
import { format } from 'date-fns';
import { getExcerpt } from '@/lib/content-analysis';
import { sanitizeHtml } from '@/lib/sanitize';
import { Badge } from '@/components/ui/badge';
import { determineThemeCategory as sharedDetermineThemeCategory, THEME_CATEGORIES as SHARED_THEME_CATEGORIES } from '@shared/theme-categories';
import { getStoryThemeOverride } from '@shared/story-theme-overrides';
import { getThemeDefinitionOverride } from '@/shared/theme-definitions';
import { Icon } from '@iconify/react';

interface SearchResultsProps {
  query: string;
  onSelect?: () => void;
}

type Post = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
};

const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect }) => {
  const [, navigate] = useLocation();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/posts?limit=100');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.posts as Post[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!query || !posts) {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const results = posts.filter(post => {
      const title = post.title.rendered.toLowerCase();
      const content = getExcerpt(post.content.rendered).toLowerCase();
      
      return title.includes(normalizedQuery) || content.includes(normalizedQuery);
    });

    setSearchResults(results);
  }, [query, posts]);

  const handlePostClick = (slug: string) => {
    navigate(`/reader/${slug}`);
    if (onSelect) onSelect();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (query.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Type to search stories...
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchResults.map(post => {
        const title = post.title.rendered || '';
        const content = getExcerpt(post.content.rendered || '');
        const primaryThemeRaw =
          sharedDetermineThemeCategory(String(title || ''), String(content || ''));

        const override = getStoryThemeOverride(post.slug as any, title as any);

        const derivedKey = (() => {
          const raw = String(primaryThemeRaw || '').trim();
          if (!raw) return 'HORROR';
          for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
            if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
          }
          return raw.toUpperCase().replace(/\s+/g, '_');
        })();

        const themeKey = override?.key || derivedKey;

        const defOverride = getThemeDefinitionOverride(themeKey);

        const baseLabel =
          override?.label ||
          defOverride?.label ||
          (SHARED_THEME_CATEGORIES as any)[derivedKey]?.label ||
          primaryThemeRaw ||
          'Horror';

        const prettyLabel = baseLabel;

        let iconSlug =
          override?.icon ||
          defOverride?.icon ||
          (SHARED_THEME_CATEGORIES as any)[derivedKey]?.icon ||
          'ghost';
        if (themeKey === 'BODY_HORROR') iconSlug = 'bone';
        const isIconify = String(iconSlug).includes(':');

        const ThemeIconCmp = (() => {
          const slug = String(iconSlug).toLowerCase();
          switch (slug) {
            case 'skull': return Skull; case 'brain': return Brain; case 'pill': return Pill; case 'cpu': return Cpu; case 'ghost': return Ghost;
            case 'eye': return Eye; case 'hourglass': return Hourglass; case 'car': return Car;
            case 'fork-knife': case 'forkknife': case 'utensils': return ForkKnife; case 'trees': case 'tree': return Trees; case 'castle': return Castle; case 'bug': return Bug;
            case 'moon': return Moon; case 'moon-star': case 'moonstar': return MoonStar; case 'radio': return Radio; case 'box': return Box; case 'flask': return FlaskConical;
            case 'radiation': return Radiation; case 'building': return Building; case 'cat': return Cat; case 'flame': return Flame; case 'dog': return Dog; case 'cloud': return Cloud;
            case 'alert-triangle': case 'alerttriangle': return AlertTriangle; case 'footprints': return Footprints; case 'bone': return Bone;
            default:
              switch (themeKey) {
                case 'TECHNOLOGICAL': return Cpu;
                case 'PSYCHOLOGICAL': return Brain;
                case 'SUPERNATURAL': return Ghost;
                case 'EXISTENTIAL': return Hourglass;
                case 'VEHICULAR': return Car;
                case 'FOLK_HORROR': return Trees;
                case 'GOTHIC': return Castle;
                case 'COSMIC': return Moon;
                default: return Ghost;
              }
          }
        })();

        const badgeTint = (() => {
          switch (themeKey) {
            case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
            case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
            case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
            case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
            case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
            case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
            case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
            case 'CANNIBALISM': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
            case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
            case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
            case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
            case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
            case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
            case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
            case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
            case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
            case 'CURSED_OBJECT': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
            case 'OCCULT': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
            case 'URBAN_HORROR': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
            case 'SUICIDE': return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-300 dark:border-zinc-700';
            case 'CONTAGION': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700';
            default: return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
          }
        })();

        return (
          <div 
            key={post.id}
            className="p-3 rounded-md hover:bg-muted transition-colors cursor-pointer"
            onClick={() => handlePostClick(post.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePostClick(post.slug);
              }
            }}
            role="button"
            tabIndex={0}
            data-testid={`search-result-${post.id}`}
          >
            <div className="font-medium" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }} />
            <div className="mt-1">
              <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                {isIconify ? <Icon icon={String(iconSlug)} className="h-3 w-3" /> : <ThemeIconCmp className="h-3 w-3" />}
                {prettyLabel}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {getExcerpt(post.content.rendered)}
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;