export function lazyLoadImages() {
  try {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img:not([loading])'));
    for (const img of images) {
      img.loading = 'lazy';
      if (!img.getAttribute('decoding')) img.decoding = 'async';
      if (!img.getAttribute('width') || !img.getAttribute('height')) {
        // Best-effort: if natural sizes exist, set attributes to stabilize layout
        img.addEventListener('load', () => {
          if (!img.getAttribute('width') && img.naturalWidth) img.setAttribute('width', String(img.naturalWidth));
          if (!img.getAttribute('height') && img.naturalHeight) img.setAttribute('height', String(img.naturalHeight));
        }, { once: true });
      }
    }
  } catch {}
}

