import { useEffect, useState } from 'react';

interface ReaderDebugOptions {
  contentRef: React.RefObject<HTMLElement | null>;
  controlsRowRef: React.RefObject<HTMLElement | null>;
  metaRowRef: React.RefObject<HTMLElement | null>;
  navRowRef: React.RefObject<HTMLElement | null>;
  pagerRowRef: React.RefObject<HTMLElement | null>;
  shareRowRef: React.RefObject<HTMLElement | null>;
  isUIHidden: boolean;
  fontDialogOpen: boolean;
  contentsDialogOpen: boolean;
  themeEditorOpen: boolean;
  isAnyDialogOpen: boolean;
}

/**
 * Centralises the reader's debug instrumentation so that the main page
 * component doesn't have to embed all of the logging and global listeners.
 *
 * Behaviour is unchanged: debug is enabled in dev builds or when
 * localStorage('reader_debug') === '1'.
 */
export function useReaderDebugInstrumentation(options: ReaderDebugOptions) {
  const {
    contentRef,
    controlsRowRef,
    metaRowRef,
    navRowRef,
    pagerRowRef,
    shareRowRef,
    isUIHidden,
    fontDialogOpen,
    contentsDialogOpen,
    themeEditorOpen,
    isAnyDialogOpen,
  } = options;

  const [debugEnabled, setDebugEnabled] = useState<boolean>(() => {
    try {
      const flag = typeof window !== 'undefined' ? window.localStorage.getItem('reader_debug') : null;
      return flag === '1' || import.meta.env?.DEV === true;
    } catch {
      return import.meta.env?.DEV === true;
    }
  });

  // React to storage changes for the reader_debug flag.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'reader_debug') {
        try {
          setDebugEnabled(e.newValue === '1' || import.meta.env?.DEV === true);
        } catch {
          // ignore
        }
      }
    };

    try {
      window.addEventListener('storage', onStorage);
    } catch {
      // ignore
    }

    return () => {
      try {
        window.removeEventListener('storage', onStorage);
      } catch {
        // ignore
      }
    };
  }, []);

  // Global click tracer (capture phase) when debug is enabled.
  useEffect(() => {
    if (!debugEnabled) return;

    const handler = (e: Event) => {
      try {
        const t = e.target as HTMLElement | null;
        const withinContent = !!(t && contentRef.current && contentRef.current.contains(t));
        const path = (e as any).composedPath
          ? (e as any)
              .composedPath()
              .map((n: any) => n?.nodeName || n?.tagName || n?.className || 'node')
              .slice(0, 6)
          : undefined;

        console.log('[Reader.debug] click', {
          target: t?.tagName,
          class: t?.className,
          id: t?.id,
          withinContent,
          isUIHidden,
          fontDialogOpen,
          contentsDialogOpen,
          themeEditorOpen,
          path,
        });
      } catch {
        // ignore
      }
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [debugEnabled, isUIHidden, fontDialogOpen, contentsDialogOpen, themeEditorOpen, contentRef]);

  // Bounds/styles logger for key layout elements and dialog overlays.
  useEffect(() => {
    if (!debugEnabled) return;

    const logEl = (name: string, el: HTMLElement | null | undefined) => {
      if (!el) return;
      try {
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        console.log('[Reader.debug] bounds', name, {
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          opacity: cs.opacity,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          bg: cs.backgroundColor,
          filter: cs.filter,
          backdropFilter: (cs as any).backdropFilter,
        });
      } catch {
        // ignore
      }
    };

    logEl('controlsRow', controlsRowRef.current || undefined);
    logEl('metaRow', metaRowRef.current || undefined);
    logEl('navRow', navRowRef.current || undefined);
    logEl('pagerRow', pagerRowRef.current || undefined);
    logEl('shareRow', shareRowRef.current || undefined);
    logEl('storyContent', contentRef.current || undefined);

    try {
      const body = document.body;
      if (body) {
        const cs = window.getComputedStyle(body);
        console.log('[Reader.debug] body styles', {
          pointerEvents: cs.pointerEvents,
          paddingRightInline: body.style.paddingRight,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY,
        });
      }

      const dlg = document.querySelector('[role="dialog"]') as HTMLElement | null;
      if (dlg) {
        const r = dlg.getBoundingClientRect();
        const cs = window.getComputedStyle(dlg);
        console.log('[Reader.debug] dialog content styles', {
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          opacity: cs.opacity,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          bg: cs.backgroundColor,
          filter: cs.filter,
          backdropFilter: (cs as any).backdropFilter,
        });
      }

      const overlay = document.querySelector(
        '[data-radix-dialog-overlay]',
      ) as HTMLElement | null;
      if (overlay) {
        const r = overlay.getBoundingClientRect();
        const cs = window.getComputedStyle(overlay);
        console.log('[Reader.debug] dialog overlay styles', {
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          opacity: cs.opacity,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          bg: cs.backgroundColor,
          filter: cs.filter,
          backdropFilter: (cs as any).backdropFilter,
        });
      }

      console.log('[Reader.debug] content-visibility', {
        isAnyDialogOpen,
        applied: isAnyDialogOpen ? 'visible (no CV)' : 'auto (CV enabled)',
      });
    } catch {
      // ignore
    }
  }, [
    debugEnabled,
    fontDialogOpen,
    contentsDialogOpen,
    themeEditorOpen,
    isUIHidden,
    isAnyDialogOpen,
    contentRef,
    controlsRowRef,
    metaRowRef,
    navRowRef,
    pagerRowRef,
    shareRowRef,
  ]);

  return debugEnabled;
}

export default useReaderDebugInstrumentation;