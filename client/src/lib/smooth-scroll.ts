// Lightweight, targeted smooth-scroll for in-page anchors with reduced-motion support
import { getPrefersReducedMotion } from './motion';

export function initSmoothScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Avoid double-initialization
  if ((window as any).__smoothScrollInitialized) return;
  (window as any).__smoothScrollInitialized = true;

  function getNavOffset(): number {
    try {
      const root = document.documentElement;
      const raw = getComputedStyle(root).getPropertyValue('--navbar-height').trim();
      if (!raw) return 56; // sensible default
      // Parse value like "64px"
      const parsed = parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : 56;
    } catch {
      return 56;
    }
  }

  function isSamePageAnchor(el: HTMLAnchorElement): boolean {
    const href = el.getAttribute('href') || '';
    // Allow explicit opt-in via data-smooth-scroll too
    if (el.dataset.smoothScroll === 'true') return true;
    // In-page hash links
    return href.startsWith('#') && href.length > 1;
  }

  function onClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Find nearest anchor
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    if (!isSamePageAnchor(anchor)) return;

    const id = (anchor.getAttribute('href') || '').slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();

    const offset = getNavOffset() + 8; // add small breathing room
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetTop = Math.max(absoluteTop - offset, 0);

    const prefersReducedMotion = getPrefersReducedMotion();
    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    // Focus target for accessibility if focusable
    if (typeof (el as any).focus === 'function') {
      (el as any).setAttribute('tabindex', '-1');
      (el as any).focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', onClick, { passive: false });
}