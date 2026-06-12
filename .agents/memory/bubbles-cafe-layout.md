---
name: Bubbles Cafe layout shifts
description: Root causes of layout shifts and the CSS/JS fixes applied
---

# Bubbles Cafe Layout Shifts

**Why:** Several CSS rules were too aggressive and caused layout shifts (content moving after initial paint) and internal component style overrides.

## Root causes fixed

### 1. `fullwidth-fix.css` broad wildcard selectors
The file had these selectors that matched EVERY element with certain strings in class names:
```css
[class*="container"], [class*="layout"], [class*="wrapper"], [class*="page"]
```
These overrode Tailwind container max-widths, shadcn dialog widths, card dimensions, etc. with `max-width: 100% !important` — breaking internal component layouts and causing shifts when those components rendered.

**Fix:** Replaced with specific top-level selectors only:
```css
body > div#root, #root > div, #root > div > div, main,
.page-transition-container, .page-content
```

### 2. Redundant/conflicting padding classes in App.tsx
The main `page-transition-container` div had `site-gutters` class AND `min-w-full` plus explicit margin utility classes that conflicted with the CSS rule. Simplified to just what's needed.

### 3. Sitemap URL without protocol
`BACKEND_BASE_URL` env var on Render may be set as `api.bubblescafe.space` (no `https://`). The `computeBackendBaseUrl()` function in `scripts/generate-sitemaps.mjs` now prepends `https://` if no protocol is present.

## What does NOT cause layout shifts (confirmed)
- **Nav auth state toggle** — both the sign-in button and user avatar dropdown are the same `h-12 w-12` size. No layout shift.
- **Theme FOUC** — already prevented by inline `<script>` in `index.html` that reads localStorage and sets class on `<html>` before CSS loads.
- **Images on home page** — uses CSS `backgroundImage` style on `body`, not `<img>` elements. No layout shift.

**How to apply:** Keep `fullwidth-fix.css` targeting specific layout shell classes only, never broad wildcards like `[class*="container"]`.
