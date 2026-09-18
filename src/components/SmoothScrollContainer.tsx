import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement, offset?: number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisInstanceRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with cinematic movie-like momentum and easing curves
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
      prevent: (node: HTMLElement) => {
        return (
          node.hasAttribute?.('data-lenis-prevent') ||
          Boolean(node.closest?.('[data-lenis-prevent]')) ||
          Boolean(node.closest?.('.fixed')) ||
          Boolean(node.closest?.('[role="dialog"]'))
        );
      },
    });

    lenisInstanceRef.current = lenis;

    // Connect to global window for accessibility
    (window as any).__LENIS__ = lenis;

    // Animation frame loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global listener for click events targeting internal hash anchors (e.g., #events, #categories)
    const handleGlobalAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a[href^="#"], [data-lenis-scroll-to]') as HTMLElement | null;
      if (!link) return;

      const href = link.getAttribute('href') || link.getAttribute('data-lenis-scroll-to');
      if (href && href.startsWith('#') && href.length > 1) {
        const dest = document.querySelector(href);
        if (dest) {
          e.preventDefault();
          lenis.scrollTo(dest as HTMLElement, {
            offset: -85,
            duration: 1.35,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleGlobalAnchorClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalAnchorClick, { capture: true });
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstanceRef.current = null;
      delete (window as any).__LENIS__;
    };
  }, []);

  const scrollTo = (target: string | HTMLElement, offset: number = -85) => {
    if (!lenisInstanceRef.current) {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    lenisInstanceRef.current.scrollTo(target, {
      offset,
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstanceRef.current, scrollTo }}>
      <div
        ref={containerRef}
        id="app-smooth-scroll-wrapper"
        className={`lenis-wrapper relative w-full min-h-screen overflow-x-hidden ${className}`}
      >
        {children}
      </div>
    </SmoothScrollContext.Provider>
  );
};
