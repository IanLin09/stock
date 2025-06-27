import type {
  ChartSizeType,
  AnalysisLayoutType,
} from '@/hooks/use-analysis-responsive';

// Analysis 頁面布局類別生成器
export const getAnalysisLayoutClasses = (
  layout: AnalysisLayoutType
): string => {
  const baseClasses = 'h-full text-black dark:text-white p-4';

  switch (layout) {
    case 'mobile':
      return `${baseClasses} flex flex-col space-y-4`;
    case 'tablet':
      return `${baseClasses} flex flex-col space-y-4`;
    case 'desktop':
      return `${baseClasses} flex flex-row space-x-4`;
    default:
      return `${baseClasses} flex flex-col space-y-4`;
  }
};

// 圖表容器類別生成器
export const getChartContainerClasses = (
  screenSize: ChartSizeType,
  chartType: 'main' | 'indicator' | 'sidebar' = 'main'
): string => {
  const baseClasses = 'w-full';

  switch (chartType) {
    case 'main':
      return `${baseClasses} ${getMainChartClasses(screenSize)}`;
    case 'indicator':
      return `${baseClasses} ${getIndicatorChartClasses(screenSize)}`;
    case 'sidebar':
      return `${baseClasses} ${getSidebarClasses(screenSize)}`;
    default:
      return baseClasses;
  }
};

// 主圖表專用類別
const getMainChartClasses = (screenSize: ChartSizeType): string => {
  switch (screenSize) {
    case 'xs':
      return 'border border-black dark:border-white rounded-sm';
    case 'sm':
      return 'border border-black dark:border-white rounded';
    case 'md':
    case 'lg':
    case 'xl':
    case '2xl':
      return 'border border-black dark:border-white rounded-lg';
    default:
      return 'border border-black dark:border-white rounded';
  }
};

// 指標圖表專用類別
const getIndicatorChartClasses = (screenSize: ChartSizeType): string => {
  const base = 'pt-4';

  switch (screenSize) {
    case 'xs':
      return `${base} space-y-2`;
    case 'sm':
      return `${base} space-y-3`;
    default:
      return `${base} space-y-4`;
  }
};

// 側邊欄專用類別
const getSidebarClasses = (screenSize: ChartSizeType): string => {
  switch (screenSize) {
    case 'xs':
    case 'sm':
      return 'px-2 py-4';
    case 'md':
      return 'px-4 py-6 border border-black dark:border-white rounded';
    default:
      return 'px-4 py-8 border border-black dark:border-white rounded-lg';
  }
};

// Analysis 文字大小生成器
export const getAnalysisTextSize = (
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl',
  screenSize: ChartSizeType
): string => {
  // 基礎大小映射
  const sizeMap = {
    xs: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-sm',
      '2xl': 'text-sm',
    },
    sm: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-base',
      '2xl': 'text-base',
    },
    base: {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-lg',
      '2xl': 'text-lg',
    },
    lg: {
      xs: 'text-base',
      sm: 'text-lg',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-xl',
      '2xl': 'text-xl',
    },
    xl: {
      xs: 'text-lg',
      sm: 'text-xl',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-2xl',
      '2xl': 'text-2xl',
    },
    '2xl': {
      xs: 'text-xl',
      sm: 'text-2xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-3xl',
      '2xl': 'text-3xl',
    },
    '3xl': {
      xs: 'text-2xl',
      sm: 'text-3xl',
      md: 'text-3xl',
      lg: 'text-4xl',
      xl: 'text-4xl',
      '2xl': 'text-4xl',
    },
  };

  return sizeMap[size][screenSize] || sizeMap[size]['md'];
};

// Analysis 間距生成器
export const getAnalysisSpacing = (
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  screenSize: ChartSizeType,
  type: 'padding' | 'margin' | 'gap' = 'padding'
): string => {
  const prefix = type === 'padding' ? 'p' : type === 'margin' ? 'm' : 'gap';

  const spacingMap = {
    xs: {
      xs: `${prefix}-1`,
      sm: `${prefix}-1`,
      md: `${prefix}-2`,
      lg: `${prefix}-2`,
      xl: `${prefix}-2`,
      '2xl': `${prefix}-2`,
    },
    sm: {
      xs: `${prefix}-2`,
      sm: `${prefix}-2`,
      md: `${prefix}-3`,
      lg: `${prefix}-3`,
      xl: `${prefix}-3`,
      '2xl': `${prefix}-3`,
    },
    md: {
      xs: `${prefix}-3`,
      sm: `${prefix}-4`,
      md: `${prefix}-4`,
      lg: `${prefix}-6`,
      xl: `${prefix}-6`,
      '2xl': `${prefix}-6`,
    },
    lg: {
      xs: `${prefix}-4`,
      sm: `${prefix}-6`,
      md: `${prefix}-6`,
      lg: `${prefix}-8`,
      xl: `${prefix}-8`,
      '2xl': `${prefix}-8`,
    },
    xl: {
      xs: `${prefix}-6`,
      sm: `${prefix}-8`,
      md: `${prefix}-8`,
      lg: `${prefix}-10`,
      xl: `${prefix}-12`,
      '2xl': `${prefix}-12`,
    },
  };

  return spacingMap[size][screenSize] || spacingMap[size]['md'];
};

// 圖表高度計算器
export const calculateChartHeight = (
  chartType: 'candlestick' | 'volume' | 'indicator',
  screenSize: ChartSizeType,
  customMultiplier?: number
): number => {
  const baseHeights = {
    candlestick: { xs: 160, sm: 180, md: 200, lg: 220, xl: 240, '2xl': 260 },
    volume: { xs: 25, sm: 28, md: 30, lg: 35, xl: 40, '2xl': 45 },
    indicator: { xs: 120, sm: 140, md: 160, lg: 170, xl: 180, '2xl': 190 },
  };

  const baseHeight =
    baseHeights[chartType][screenSize] || baseHeights[chartType]['md'];

  return customMultiplier
    ? Math.round(baseHeight * customMultiplier)
    : baseHeight;
};

// ApexCharts 響應式配置生成器
export const getAnalysisChartOptions = (
  screenSize: ChartSizeType,
  chartType: 'candlestick' | 'volume' | 'indicator' | 'line'
) => {
  const height = calculateChartHeight(
    chartType === 'line' ? 'indicator' : chartType,
    screenSize
  );

  // 基礎響應式配置
  const baseConfig = {
    chart: {
      height,
      toolbar: {
        show: screenSize !== 'xs' && screenSize !== 'sm',
        autoSelected: 'pan' as const,
      },
      zoom: {
        enabled: screenSize !== 'xs',
      },
    },

    // 座標軸配置
    xaxis: {
      labels: {
        show: screenSize !== 'xs',
        style: {
          fontSize:
            screenSize === 'xs'
              ? '10px'
              : screenSize === 'sm'
                ? '11px'
                : '12px',
        },
      },
    },

    yaxis: {
      labels: {
        show: true,
        style: {
          fontSize:
            screenSize === 'xs'
              ? '10px'
              : screenSize === 'sm'
                ? '11px'
                : '12px',
        },
      },
    },

    // Tooltip 配置
    tooltip: {
      enabled: screenSize !== 'xs',
      style: {
        fontSize: screenSize === 'xs' ? '12px' : '14px',
      },
    },

    // 標題配置
    title: {
      style: {
        fontSize:
          screenSize === 'xs' ? '14px' : screenSize === 'sm' ? '16px' : '18px',
      },
    },

    // 線條寬度
    stroke: {
      width: screenSize === 'xs' ? 1 : screenSize === 'sm' ? 1.25 : 1.5,
    },

    // 響應式斷點配置
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: height * 0.8,
            toolbar: { show: false },
          },
          xaxis: {
            labels: { show: false },
          },
          tooltip: { enabled: false },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: height * 0.9,
            toolbar: { show: false },
          },
        },
      },
    ],
  };

  return baseConfig;
};

// 布局切換動畫類別
export const getLayoutTransitionClasses = (): string => {
  return 'transition-all duration-300 ease-in-out';
};

// Analysis 專用 Grid 系統
export const getAnalysisGridClasses = (
  screenSize: ChartSizeType,
  columns: number = 2
): string => {
  if (screenSize === 'xs') {
    return 'grid grid-cols-1 gap-2';
  }
  if (screenSize === 'sm') {
    return columns > 2
      ? 'grid grid-cols-2 gap-3'
      : `grid grid-cols-${columns} gap-3`;
  }
  return `grid grid-cols-${columns} gap-4`;
};

// 圖表載入骨架屏
export const getChartSkeletonClasses = (screenSize: ChartSizeType): string => {
  const height = calculateChartHeight('candlestick', screenSize);
  return `animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full h-[${height}px]`;
};
