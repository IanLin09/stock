import { type ScreenSize } from '@/hooks/use-responsive';

/**
 * Responsive utilities for consistent styling across components
 */

// Font size mappings for different screen sizes
export const RESPONSIVE_TEXT_SIZES = {
  xs: {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
    '3xl': 'text-2xl',
    '4xl': 'text-3xl',
  },
  sm: {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  },
  md: {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  },
  lg: {
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
  },
  xl: {
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
  },
  '2xl': {
    sm: 'text-lg',
    base: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-5xl',
    '4xl': 'text-6xl',
  },
} as const;

// Spacing mappings for different screen sizes
export const RESPONSIVE_SPACING = {
  xs: { sm: 'p-1', md: 'p-2', lg: 'p-3', xl: 'p-4' },
  sm: { sm: 'p-2', md: 'p-3', lg: 'p-4', xl: 'p-6' },
  md: { sm: 'p-2', md: 'p-4', lg: 'p-6', xl: 'p-8' },
  lg: { sm: 'p-3', md: 'p-6', lg: 'p-8', xl: 'p-10' },
  xl: { sm: 'p-4', md: 'p-6', lg: 'p-8', xl: 'p-12' },
  '2xl': { sm: 'p-6', md: 'p-8', lg: 'p-10', xl: 'p-16' },
} as const;

// Gap mappings for grid/flex layouts
export const RESPONSIVE_GAPS = {
  xs: { sm: 'gap-1', md: 'gap-2', lg: 'gap-3' },
  sm: { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' },
  md: { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' },
  lg: { sm: 'gap-3', md: 'gap-4', lg: 'gap-6' },
  xl: { sm: 'gap-4', md: 'gap-6', lg: 'gap-8' },
  '2xl': { sm: 'gap-4', md: 'gap-6', lg: 'gap-8' },
} as const;

/**
 * Generate responsive text size classes
 * @param size - base text size
 * @returns string of responsive classes
 */
export function getResponsiveTextSize(
  size: keyof typeof RESPONSIVE_TEXT_SIZES.md
): string {
  return [
    RESPONSIVE_TEXT_SIZES.xs[size],
    `sm:${RESPONSIVE_TEXT_SIZES.sm[size]}`,
    `md:${RESPONSIVE_TEXT_SIZES.md[size]}`,
    `lg:${RESPONSIVE_TEXT_SIZES.lg[size]}`,
    `xl:${RESPONSIVE_TEXT_SIZES.xl[size]}`,
    `2xl:${RESPONSIVE_TEXT_SIZES['2xl'][size]}`,
  ].join(' ');
}

/**
 * Generate responsive spacing classes
 * @param size - spacing size
 * @returns string of responsive classes
 */
export function getResponsiveSpacing(
  size: keyof typeof RESPONSIVE_SPACING.md
): string {
  return [
    RESPONSIVE_SPACING.xs[size],
    `sm:${RESPONSIVE_SPACING.sm[size]}`,
    `md:${RESPONSIVE_SPACING.md[size]}`,
    `lg:${RESPONSIVE_SPACING.lg[size]}`,
    `xl:${RESPONSIVE_SPACING.xl[size]}`,
    `2xl:${RESPONSIVE_SPACING['2xl'][size]}`,
  ].join(' ');
}

/**
 * Generate responsive gap classes
 * @param size - gap size
 * @returns string of responsive classes
 */
export function getResponsiveGap(
  size: keyof typeof RESPONSIVE_GAPS.md
): string {
  return [
    RESPONSIVE_GAPS.xs[size],
    `sm:${RESPONSIVE_GAPS.sm[size]}`,
    `md:${RESPONSIVE_GAPS.md[size]}`,
    `lg:${RESPONSIVE_GAPS.lg[size]}`,
    `xl:${RESPONSIVE_GAPS.xl[size]}`,
    `2xl:${RESPONSIVE_GAPS['2xl'][size]}`,
  ].join(' ');
}

/**
 * Chart responsive configurations
 */
export const CHART_RESPONSIVE_CONFIG = {
  height: {
    xs: 200,
    sm: 250,
    md: 300,
    lg: 350,
    xl: 400,
    '2xl': 450,
  },
  toolbar: {
    xs: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
    '2xl': true,
  },
} as const;

/**
 * Get chart height based on screen size
 * @param screenSize - current screen size
 * @returns height number
 */
export function getChartHeight(screenSize: ScreenSize): number {
  return (
    CHART_RESPONSIVE_CONFIG.height[screenSize] ||
    CHART_RESPONSIVE_CONFIG.height.md
  );
}

/**
 * Check if chart toolbar should be shown
 * @param screenSize - current screen size
 * @returns boolean
 */
export function shouldShowChartToolbar(screenSize: ScreenSize): boolean {
  return (
    CHART_RESPONSIVE_CONFIG.toolbar[screenSize] ??
    CHART_RESPONSIVE_CONFIG.toolbar.md
  );
}

/**
 * Grid column configurations for different screen sizes
 */
export const GRID_RESPONSIVE_COLS = {
  list: {
    xs: 'grid-cols-1',
    sm: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-3',
    xl: 'grid-cols-3',
    '2xl': 'grid-cols-4',
  },
  dashboard: {
    xs: 'grid-cols-1',
    sm: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-3',
    xl: 'grid-cols-4',
    '2xl': 'grid-cols-4',
  },
} as const;

/**
 * Generate responsive grid classes
 * @param type - grid type
 * @returns string of responsive classes
 */
export function getResponsiveGridCols(
  type: keyof typeof GRID_RESPONSIVE_COLS
): string {
  const config = GRID_RESPONSIVE_COLS[type];
  return [
    config.xs,
    `sm:${config.sm}`,
    `md:${config.md}`,
    `lg:${config.lg}`,
    `xl:${config.xl}`,
    `2xl:${config['2xl']}`,
  ].join(' ');
}

/**
 * Responsive container classes for common layouts
 */
export const RESPONSIVE_CONTAINERS = {
  // For stock list items - stack on mobile, side-by-side on larger screens
  stockListItem: 'flex flex-col sm:flex-row sm:items-center',

  // For dashboard main layout
  dashboardMain:
    'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4',

  // For chart containers
  chartContainer: 'w-full h-full max-w-full',

  // For text content areas
  textContainer: 'space-y-1 sm:space-y-2 md:space-y-3',
} as const;

/**
 * Responsive width utilities for common use cases
 */
export const RESPONSIVE_WIDTHS = {
  // For list item sections
  listSection: {
    symbol: 'w-full sm:w-24 md:w-32',
    chart: 'w-full sm:w-32 md:w-40',
    price: 'w-full sm:w-20 md:w-24',
  },
  // For form inputs
  input: {
    narrow: 'w-full sm:w-48 md:w-56',
    medium: 'w-full sm:w-64 md:w-80',
    wide: 'w-full sm:w-80 md:w-96',
  },
} as const;
