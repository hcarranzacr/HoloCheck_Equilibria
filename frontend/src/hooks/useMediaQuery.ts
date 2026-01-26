import { useState, useEffect } from 'react';

/**
 * Custom hook for media query detection that works reliably across all browsers,
 * including Safari iOS which has specific viewport handling quirks.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches('matches' in e ? e.matches : (e as MediaQueryList).matches);
    };
    
    // Add listener (Safari iOS compatible)
    // Safari iOS older versions use addListener instead of addEventListener
    if (media.addEventListener) {
      media.addEventListener('change', listener as (e: MediaQueryListEvent) => void);
    } else if (media.addListener) {
      // Fallback for older Safari versions
      media.addListener(listener as (e: MediaQueryList) => void);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener as (e: MediaQueryListEvent) => void);
      } else if (media.removeListener) {
        media.removeListener(listener as (e: MediaQueryList) => void);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect if the current viewport is mobile size.
 * Uses 1023px as breakpoint to match Tailwind's lg breakpoint (1024px).
 * This ensures consistency with Tailwind classes while providing reliable detection in Safari iOS.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)');
}

/**
 * Hook to detect if the current viewport is tablet size.
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect if the current viewport is desktop size.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}