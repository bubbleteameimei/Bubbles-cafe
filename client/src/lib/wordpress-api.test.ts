import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as wpApi from './wordpress-api';

// Minimal localStorage polyfill for node environment
const store: Record<string, string> = {};
function setupLocalStorage() {
  (globalThis as any).localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; }
  };
}

describe('wordpress-api cache isolation by includeContent', () => {
  beforeEach(() => {
    // Reset mocks and local storage
    vi.restoreAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
    setupLocalStorage();
  });

  it('does not reuse trimmed cache when includeContent=true', async () => {
    // Mock fetch: if _fields is present (includeContent=false), omit content in response.
    // Otherwise, include full content.
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(async (url: any) => {
      const u = String(url);
      const hasFields = u.includes('_fields=');
      const jsonPayload = [
        {
          id: 1,
          date: new Date().toISOString(),
          slug: 'post-a',
          title: { rendered: 'Post A' },
          ...(hasFields
            ? { excerpt: { rendered: 'Excerpt A' } } // no content when trimmed
            : { content: { rendered: 'Full content here' }, excerpt: { rendered: 'Excerpt A' } }
          )
        }
      ];
      return {
        ok: true,
        status: 200,
        headers: {
          get: (k: string) => {
            const key = k.toLowerCase();
            if (key === 'content-type') return 'application/json';
            if (key === 'x-wp-totalpages') return '1';
            if (key === 'x-wp-total') return '1';
            return null;
          }
        },
        json: async () => jsonPayload
      } as any;
    });

    // First call: includeContent=false -> cache trimmed posts (no content.rendered)
    const first = await wpApi.fetchWordPressPosts({ perPage: 1, includeContent: false, skipCache: false });
    expect(Array.isArray(first.posts)).toBe(true);
    // The fallback validator sets 'Content unavailable' when content is missing
    expect(first.posts[0].content?.rendered).toBe('Content unavailable');

    // Second call: includeContent=true -> should ignore trimmed cache and fetch full content
    const second = await wpApi.fetchWordPressPosts({ perPage: 1, includeContent: true, skipCache: false });
    expect(Array.isArray(second.posts)).toBe(true);
    expect(second.posts[0].content?.rendered).toBe('Full content here');
  });
});