// Client hook to load theme categories from the API with local fallback to shared static file.
// Provides a map keyed by theme key and a list for iteration, both suitable for reader/index UI.
import { useEffect, useMemo, useState } from "react";
import { THEME_CATEGORIES as STATIC_THEME_CATEGORIES } from "@shared/theme-categories";
import { getApiPath } from "@/lib/asset-path";

export type ThemeCategoryItem = { key: string; label: string; icon?: string | null; sortOrder?: number };

type CategoriesResponse = {
  categories: Array<{ key: string; label: string; icon?: string | null; sortOrder?: number }>;
  total: number;
  source: string;
};

const STORAGE_KEY = "client_theme_categories_cache";

function readCached(): ThemeCategoryItem[] {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x) => x && typeof x === "object" && typeof x.key === "string");
    }
  } catch {}
  return [];
}

function buildStaticList(): ThemeCategoryItem[] {
  const entries = Object.entries(STATIC_THEME_CATEGORIES as Record<string, { label: string; icon?: string }>);
  return entries.map(([key, info], idx) => ({
    key,
    label: String((info as any)?.label || key),
    icon: (info as any)?.icon || null,
    sortOrder: idx
  }));
}

export function useThemeCategories(): {
  categoriesList: ThemeCategoryItem[];
  categoriesMap: Record<string, { label: string; icon?: string | null }>;
} {
  const [list, setList] = useState<ThemeCategoryItem[]>(() => {
    const cached = readCached();
    return cached.length ? cached : buildStaticList();
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(getApiPath("/api/themes/categories"), { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: CategoriesResponse = await res.json();
        const arr = Array.isArray(data?.categories) ? data.categories : [];
        const normalized = arr.map((c) => ({
          key: String(c.key),
          label: String(c.label || c.key),
          icon: c.icon ? String(c.icon) : null,
          sortOrder: Number(c.sortOrder ?? 0)
        }));
        if (!mounted) return;
        setList(normalized);
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          }
        } catch {}
      } catch {
        // leave static/fallback in place
      }
    })();
    return () => { mounted = false; };
  }, []);

  const map = useMemo(() => {
    const m: Record<string, { label: string; icon?: string | null }> = {};
    for (const item of list) {
      m[item.key] = { label: item.label, icon: item.icon };
    }
    return m;
  }, [list]);

  // Sorted output for UI iteration (sortOrder then label)
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      const so = (Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
      if (so !== 0) return so;
      return a.label.localeCompare(b.label);
    });
  }, [list]);

  return { categoriesList: sortedList, categoriesMap: map };
}