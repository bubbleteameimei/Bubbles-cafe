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
import { getBadgeTint } from '@/lib/theme-badges';

// Local memoized wrapper to avoid recomputing excerpts for identical content
const __excerptMemo = new Map<string, string>();
const getExcerptMemo = (html: string, maxLength: number = 250): string => {
  try {
    const key = `${maxLength}::${html}`;
    const cached = __excerptMemo.get(key);
    if (typeof cached === 'string') return cached;
    const result = getExcerpt(html, maxLength);
    __excerptMemo.set(key, result);
    if (__excerptMemo.size > 256) {
      const firstKey = __excerptMemo.keys().next().value as string | undefined;
      if (typeof firstKey === 'string') __excerptMemo.delete(firstKey);
    }
    return result;
  } catch {
    return getExcerpt(html, maxLength);
  }
};

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
      const content = getExcerptMemo(post.content.rendered).toLowerCase();
      
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

        const badgeTint = getBadgeTint(themeKey);

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
              {getExcerptMemo(post.content.rendered)}
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