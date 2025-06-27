/**
 * Helper functions for responsive design calculations and utilities
 */

import { type ScreenSize } from '@/hooks/use-responsive';

/**
 * Calculate responsive font size in pixels based on screen size
 * @param baseSize - base font size for medium screens
 * @param screenSize - current screen size
 * @returns calculated font size in pixels
 */
export function calculateResponsiveFontSize(
  baseSize: number,
  screenSize: ScreenSize
): number {
  const scalingFactors = {
    xs: 0.75,
    sm: 0.875,
    md: 1,
    lg: 1.125,
    xl: 1.25,
    '2xl': 1.375,
  };

  return Math.round(baseSize * scalingFactors[screenSize]);
}

/**
 * Calculate responsive spacing in pixels
 * @param baseSpacing - base spacing for medium screens
 * @param screenSize - current screen size
 * @returns calculated spacing in pixels
 */
export function calculateResponsiveSpacing(
  baseSpacing: number,
  screenSize: ScreenSize
): number {
  const scalingFactors = {
    xs: 0.5,
    sm: 0.75,
    md: 1,
    lg: 1.25,
    xl: 1.5,
    '2xl': 2,
  };

  return Math.round(baseSpacing * scalingFactors[screenSize]);
}

/**
 * Determine optimal column count for grid layouts
 * @param screenSize - current screen size
 * @param maxCols - maximum columns for largest screen
 * @returns optimal column count
 */
export function getOptimalColumnCount(
  screenSize: ScreenSize,
  maxCols: number = 4
): number {
  const columnMapping: Record<ScreenSize, number> = {
    xs: 1,
    sm: Math.min(2, maxCols),
    md: Math.min(2, maxCols),
    lg: Math.min(3, maxCols),
    xl: Math.min(4, maxCols),
    '2xl': maxCols,
  };

  return columnMapping[screenSize];
}

/**
 * Generate Tailwind classes for responsive visibility
 * @param showOnSizes - screen sizes where element should be visible
 * @returns Tailwind class string
 */
export function getResponsiveVisibility(showOnSizes: ScreenSize[]): string {
  const allSizes: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const classes: string[] = [];

  // Start with hidden
  classes.push('hidden');

  // Add show classes for specified sizes
  showOnSizes.forEach((size) => {
    if (size === 'xs') {
      // xs doesn't have a prefix in Tailwind
      classes.push('block');
    } else {
      classes.push(`${size}:block`);
    }
  });

  return classes.join(' ');
}

/**
 * Generate responsive margin/padding classes
 * @param property - 'm' for margin, 'p' for padding
 * @param direction - 't', 'r', 'b', 'l', 'x', 'y', or '' for all sides
 * @param sizes - size for each breakpoint
 * @returns Tailwind class string
 */
export function getResponsiveSpacingClasses(
  property: 'm' | 'p',
  direction: 't' | 'r' | 'b' | 'l' | 'x' | 'y' | '' = '',
  sizes: Partial<Record<ScreenSize, number>>
): string {
  const classes: string[] = [];
  const breakpointPrefixes: Record<ScreenSize, string> = {
    xs: '',
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
    '2xl': '2xl:',
  };

  Object.entries(sizes).forEach(([size, value]) => {
    const screenSize = size as ScreenSize;
    const prefix = breakpointPrefixes[screenSize];
    const className = `${prefix}${property}${direction}-${value}`;
    classes.push(className);
  });

  return classes.join(' ');
}

/**
 * Merge responsive class objects into a single class string
 * @param classObjects - array of class objects with breakpoint keys
 * @returns merged class string
 */
export function mergeResponsiveClasses(
  ...classObjects: Array<Partial<Record<ScreenSize, string>>>
): string {
  const merged: Partial<Record<ScreenSize, string[]>> = {};

  // Merge all class objects
  classObjects.forEach((obj) => {
    Object.entries(obj).forEach(([size, className]) => {
      const screenSize = size as ScreenSize;
      if (!merged[screenSize]) {
        merged[screenSize] = [];
      }
      if (className) {
        merged[screenSize]!.push(className);
      }
    });
  });

  // Convert to responsive class string
  const classes: string[] = [];
  const breakpointPrefixes: Record<ScreenSize, string> = {
    xs: '',
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
    '2xl': '2xl:',
  };

  Object.entries(merged).forEach(([size, classArray]) => {
    const screenSize = size as ScreenSize;
    const prefix = breakpointPrefixes[screenSize];
    classArray?.forEach((className) => {
      if (prefix) {
        classes.push(`${prefix}${className}`);
      } else {
        classes.push(className);
      }
    });
  });

  return classes.join(' ');
}

/**
 * Check if current size meets minimum breakpoint requirement
 * @param currentSize - current screen size
 * @param minSize - minimum required size
 * @returns true if current size meets requirement
 */
export function meetsMinBreakpoint(
  currentSize: ScreenSize,
  minSize: ScreenSize
): boolean {
  const sizeOrder: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = sizeOrder.indexOf(currentSize);
  const minIndex = sizeOrder.indexOf(minSize);

  return currentIndex >= minIndex;
}

/**
 * Get appropriate image sizes based on screen size for Next.js Image component
 * @param screenSize - current screen size
 * @returns sizes attribute string for Next.js Image
 */
export function getImageSizes(screenSize: ScreenSize): string {
  const sizeMap: Record<ScreenSize, string> = {
    xs: '100vw',
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    '2xl': '20vw',
  };

  return Object.entries(sizeMap)
    .map(([size, value]) => {
      if (size === 'xs') return value;
      return `(min-width: ${
        size === 'sm'
          ? '640px'
          : size === 'md'
            ? '768px'
            : size === 'lg'
              ? '1024px'
              : size === 'xl'
                ? '1280px'
                : '1536px'
      }) ${value}`;
    })
    .reverse()
    .join(', ');
}

/**
 * Debounce function for resize events
 * @param func - function to debounce
 * @param delay - delay in milliseconds
 * @returns debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
