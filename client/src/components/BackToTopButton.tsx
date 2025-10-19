import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

type ScrollContainer = 'window' | 'main';

const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [container, setContainer] = useState<ScrollContainer>('window');

  // Detect primary scroll container once after mount
  useEffect(() => {
    const main = document.getElementById('main-content');
    const usesMain =
      !!main && main.scrollHeight - main.clientHeight > 8; // significant overflow

    setContainer(usesMain ? 'main' : 'window');

    const onScroll = () => {
      const scrollTop =
        usesMain && main ? main.scrollTop : window.pageYOffset || document.documentElement.scrollTop || 0;
      setVisible(scrollTop > 300);
    };

    // Listen on both to be safe; the lightweight handler is fine
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    if (main) main.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);

    // Initialize state
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll as EventListener);
      if (main) main.removeEventListener('scroll', onScroll as EventListener);
    };
  }, []);

  const handleClick = () => {
    const main = document.getElementById('main-content');
    if (container === 'main' && main) {
      try {
        main.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        main.scrollTop = 0;
      }
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const baseClasses =
    'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex items-center justify-center rounded-full ' +
    'h-12 w-12 md:h-14 md:w-14 bg-primary text-primary-foreground shadow-xl ' +
    'ring-2 ring-primary/30 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
    'transition-transform transition-opacity duration-300 ease-out will-change-transform';

  const stateClasses = visible
    ? 'opacity-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 translate-y-2 pointer-events-none';

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Scroll to top"
      className={`${baseClasses} ${stateClasses}`}
      onClick={handleClick}
    >
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
      <span className="sr-only">Back to top</span>
    </button>
  );
};

export default BackToTopButton;