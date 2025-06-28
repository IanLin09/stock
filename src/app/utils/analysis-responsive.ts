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

// ApexCharts 響應式配置生成器 - 包含完整的圖表特定配置
export const getAnalysisChartOptions = (
  screenSize: ChartSizeType,
  chartType: 'candlestick' | 'volume' | 'indicator' | 'line' | 'mixed',
  customOptions?: {
    upColor?: string;
    downColor?: string;
    translation?: {
      open: string;
      high: string;
      low: string;
      close_price: string;
      price: string;
    };
  }
) => {
  const height = calculateChartHeight(
    chartType === 'line' || chartType === 'mixed' ? 'indicator' : chartType,
    screenSize
  );

  const shouldShowToolbar = screenSize !== 'xs' && screenSize !== 'sm';
  const shouldShowTooltip = screenSize !== 'xs';
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  // 基礎響應式配置
  const baseConfig: any = {
    chart: {
      height,
      toolbar: {
        show: shouldShowToolbar,
        autoSelected: 'pan' as const,
      },
      zoom: {
        enabled: screenSize !== 'xs',
      },
    },
    xaxis: {
      labels: {
        show: screenSize !== 'xs',
        style: {
          fontSize: screenSize === 'xs' ? '10px' : screenSize === 'sm' ? '11px' : '12px',
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontSize: screenSize === 'xs' ? '10px' : screenSize === 'sm' ? '11px' : '12px',
        },
      },
    },
    tooltip: {
      enabled: shouldShowTooltip,
      style: {
        fontSize: screenSize === 'xs' ? '12px' : '14px',
      },
    },
    title: {
      style: {
        fontSize: screenSize === 'xs' ? '14px' : screenSize === 'sm' ? '16px' : '18px',
      },
    },
    stroke: {
      width: screenSize === 'xs' ? 1 : screenSize === 'sm' ? 1.25 : 1.5,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: height * 0.8,
            toolbar: { show: false },
          },
          xaxis: { labels: { show: false } },
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

  // 根據圖表類型添加特定配置
  switch (chartType) {
    case 'candlestick':
      return {
        ...baseConfig,
        chart: {
          ...baseConfig.chart,
          type: 'line',
          id: 'candles',
        },
        stroke: {
          width: screenSize === 'xs' ? [1, 1, 1] : screenSize === 'sm' ? [1, 1.5, 1.5] : [1, 2, 2],
          curve: 'smooth',
        },
        xaxis: {
          ...baseConfig.xaxis,
          type: 'datetime',
          labels: {
            ...baseConfig.xaxis.labels,
            datetimeUTC: true,
            format: screenSize === 'xs' ? 'dd' : 'dd MMM',
          },
        },
        yaxis: {
          ...baseConfig.yaxis,
          tooltip: {
            enabled: shouldShowTooltip,
          },
        },
        tooltip: {
          ...baseConfig.tooltip,
          theme: 'dark',
          shared: true,
          custom: ({ seriesIndex, dataPointIndex, w }: any) => {
            const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
            const date = new Date(data.x).toLocaleDateString();
            
            if (Array.isArray(data.y)) {
              const open = data.y[0].toFixed(2);
              const high = data.y[1].toFixed(2);
              const low = data.y[2].toFixed(2);
              const close = data.y[3].toFixed(2);

              if (isMobile) {
                return `
                <div class="apexcharts-tooltip-candlestick">
                  <div class="p-1 text-xs">
                    <div class="font-semibold">${date}</div>
                    <div>${customOptions?.translation?.close_price || 'Close'}: $${close}</div>
                  </div>
                </div>`;
              } else {
                return `
                <div class="apexcharts-tooltip-candlestick">
                  <div class="p-2">
                    <div class="font-semibold">${date}</div>
                    <div>${customOptions?.translation?.open || 'Open'}: $${open}</div>
                    <div>${customOptions?.translation?.high || 'High'}: $${high}</div>
                    <div>${customOptions?.translation?.low || 'Low'}: $${low}</div>
                    <div>${customOptions?.translation?.close_price || 'Close'}: $${close}</div>
                  </div>
                </div>`;
              }
            } else {
              return `
              <div class="apexcharts-tooltip-candlestick">
                <div class="p-2">
                  <div class="font-semibold">${date}</div>
                  <div>${customOptions?.translation?.price || 'Price'}: $${data.y}</div>
                </div>
              </div>`;
            }
          },
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: customOptions?.upColor || '#00FF00',
              downward: customOptions?.downColor || '#FF0000',
            },
            wick: {
              useFillColor: true,
            },
          },
        },
      };

    case 'volume':
      return {
        ...baseConfig,
        chart: {
          ...baseConfig.chart,
          type: 'bar',
          toolbar: { show: false }, // Volume charts always hide toolbar
          zoom: { enabled: false }, // Volume charts always disable zoom
          sparkline: { enabled: true },
        },
        plotOptions: {
          bar: {
            columnWidth: screenSize === 'xs' ? '80%' : '50%',
            distributed: true,
          },
        },
        colors: ['#737a75'],
        xaxis: {
          ...baseConfig.xaxis,
          type: 'datetime',
          labels: { show: false },
        },
        tooltip: {
          ...baseConfig.tooltip,
          enabled: false,
        },
      };

    case 'line':
      return {
        ...baseConfig,
        chart: {
          ...baseConfig.chart,
          type: 'line',
          id: 'line_chart',
        },
        xaxis: {
          ...baseConfig.xaxis,
          type: 'datetime',
          labels: {
            ...baseConfig.xaxis.labels,
            datetimeUTC: true,
            format: screenSize === 'xs' ? 'dd' : 'dd MMM',
          },
        },
        yaxis: {
          ...baseConfig.yaxis,
          tooltip: {
            enabled: shouldShowTooltip,
          },
        },
        tooltip: {
          ...baseConfig.tooltip,
          theme: 'dark',
          shared: true,
        },
        colors: ['#FF6B6B'],
      };

    case 'mixed':
      return {
        ...baseConfig,
        chart: {
          ...baseConfig.chart,
          type: 'line',
          id: 'mixed_chart',
        },
        xaxis: {
          ...baseConfig.xaxis,
          type: 'datetime',
          labels: {
            ...baseConfig.xaxis.labels,
            datetimeUTC: true,
            format: screenSize === 'xs' ? 'dd' : 'dd MMM',
          },
        },
        yaxis: {
          ...baseConfig.yaxis,
          tooltip: {
            enabled: shouldShowTooltip,
          },
        },
        tooltip: {
          ...baseConfig.tooltip,
          theme: 'dark',
          shared: true,
        },
        colors: ['#FF6B6B', '#4ECDC4', '#FFFFFF'],
        plotOptions: {
          bar: {
            colors: {
              ranges: [
                {
                  from: -100,
                  to: 0,
                  color: '#FF0000',
                },
                {
                  from: 0,
                  to: 100,
                  color: '#00FF00',
                },
              ],
            },
            columnWidth: screenSize === 'xs' ? '90%' : '80%',
          },
        },
      };

    default:
      return baseConfig;
  }
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
