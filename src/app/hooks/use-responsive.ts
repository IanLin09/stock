import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
export type ScreenSize = 'xs' | BreakpointKey;

/**
 * Hook to get current screen size based on Tailwind CSS breakpoints
 * @returns current screen size identifier
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('md');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS['2xl']) {
        setScreenSize('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setScreenSize('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setScreenSize('lg');
      } else if (width >= BREAKPOINTS.md) {
        setScreenSize('md');
      } else if (width >= BREAKPOINTS.sm) {
        setScreenSize('sm');
      } else {
        setScreenSize('xs');
      }
    };

    // Initial size
    updateScreenSize();

    // Listen for window resize
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

/**
 * Hook to check if screen matches specific breakpoint
 * @param breakpoint - breakpoint to check against
 * @param direction - 'up' (>=) or 'down' (<)
 */
export function useBreakpoint(
  breakpoint: BreakpointKey,
  direction: 'up' | 'down' = 'up'
): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query =
      direction === 'up'
        ? `(min-width: ${BREAKPOINTS[breakpoint]}px)`
        : `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`;

    const mql = window.matchMedia(query);

    const updateMatch = () => setMatches(mql.matches);
    updateMatch();

    mql.addEventListener('change', updateMatch);
    return () => mql.removeEventListener('change', updateMatch);
  }, [breakpoint, direction]);

  return matches;
}

/**
 * Hook to get responsive values based on current screen size
 * @param values - object with breakpoint keys and corresponding values
 * @returns value for current screen size
 */
export function useResponsiveValue<T>(
  values: Partial<Record<ScreenSize, T>>
): T | undefined {
  const screenSize = useScreenSize();

  // Priority order: current size > fallback to smaller sizes > largest available
  const fallbackOrder: ScreenSize[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = fallbackOrder.indexOf(screenSize);

  // Check current size first
  if (values[screenSize] !== undefined) {
    return values[screenSize];
  }

  // Fall back to smaller sizes
  for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
    const size = fallbackOrder[i];
    if (values[size] !== undefined) {
      return values[size];
    }
  }

  // Fall back to larger sizes
  for (let i = currentIndex - 1; i >= 0; i--) {
    const size = fallbackOrder[i];
    if (values[size] !== undefined) {
      return values[size];
    }
  }

  return undefined;
}

/**
 * Enhanced mobile detection with more granular control
 */
export function useIsMobile(): boolean {
  return useBreakpoint('md', 'down');
}

/**
 * Check if screen is tablet size
 */
export function useIsTablet(): boolean {
  const isMd = useBreakpoint('md', 'up');
  const isLg = useBreakpoint('lg', 'down');
  return isMd && isLg;
}

/**
 * Check if screen is desktop size
 */
export function useIsDesktop(): boolean {
  return useBreakpoint('lg', 'up');
}

/**
 * Get window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return windowSize;
}
