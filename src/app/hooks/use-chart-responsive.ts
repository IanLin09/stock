import { useScreenSize, useWindowSize } from './use-responsive';
import { getChartHeight, shouldShowChartToolbar } from '@/utils/responsive';

/**
 * Hook for chart-specific responsive configurations
 */
export function useChartResponsive() {
  const screenSize = useScreenSize();
  const windowSize = useWindowSize();

  // Calculate responsive chart dimensions
  const chartHeight = getChartHeight(screenSize);
  const showToolbar = shouldShowChartToolbar(screenSize);

  // Calculate optimal chart width based on container
  const getOptimalWidth = (containerWidth?: number) => {
    const baseWidth = containerWidth || windowSize.width;

    switch (screenSize) {
      case 'xs':
        return Math.min(baseWidth * 0.95, 350);
      case 'sm':
        return Math.min(baseWidth * 0.9, 500);
      case 'md':
        return Math.min(baseWidth * 0.85, 700);
      case 'lg':
        return Math.min(baseWidth * 0.8, 900);
      case 'xl':
        return Math.min(baseWidth * 0.75, 1100);
      case '2xl':
        return Math.min(baseWidth * 0.7, 1300);
      default:
        return baseWidth * 0.8;
    }
  };

  // Generate responsive chart options
  const getChartOptions = (baseOptions: any = {}) => {
    return {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        height: chartHeight,
        toolbar: {
          ...baseOptions.chart?.toolbar,
          show: showToolbar,
        },
        // Responsive font sizes
        fontFamily: 'inherit',
      },
      // Responsive text sizes
      xaxis: {
        ...baseOptions.xaxis,
        labels: {
          ...baseOptions.xaxis?.labels,
          style: {
            ...baseOptions.xaxis?.labels?.style,
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
        ...baseOptions.yaxis,
        labels: {
          ...baseOptions.yaxis?.labels,
          style: {
            ...baseOptions.yaxis?.labels?.style,
            fontSize:
              screenSize === 'xs'
                ? '10px'
                : screenSize === 'sm'
                  ? '11px'
                  : '12px',
          },
        },
      },
      legend: {
        ...baseOptions.legend,
        fontSize:
          screenSize === 'xs' ? '11px' : screenSize === 'sm' ? '12px' : '13px',
        position:
          screenSize === 'xs'
            ? 'bottom'
            : baseOptions.legend?.position || 'top',
      },
      tooltip: {
        ...baseOptions.tooltip,
        style: {
          ...baseOptions.tooltip?.style,
          fontSize: screenSize === 'xs' ? '12px' : '14px',
        },
      },
      // Responsive margins and padding
      plotOptions: {
        ...baseOptions.plotOptions,
        bar: {
          ...baseOptions.plotOptions?.bar,
          columnWidth:
            screenSize === 'xs' ? '90%' : screenSize === 'sm' ? '80%' : '70%',
        },
      },
    };
  };

  // Container classes for chart wrappers
  const getChartContainerClasses = () => {
    const baseClasses = 'w-full mx-auto';
    const responsiveClasses = [
      'h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96', // Responsive heights
      'overflow-hidden', // Prevent overflow
    ];

    return `${baseClasses} ${responsiveClasses.join(' ')}`;
  };

  // Get responsive chart props for ApexCharts
  const getResponsiveChartProps = (options: any, series: any) => {
    return {
      options: getChartOptions(options),
      series,
      height: chartHeight,
      width: '100%',
    };
  };

  return {
    screenSize,
    chartHeight,
    showToolbar,
    windowSize,
    getOptimalWidth,
    getChartOptions,
    getChartContainerClasses,
    getResponsiveChartProps,
  };
}

/**
 * Hook for sparkline/mini chart configurations
 */
export function useSparklineResponsive() {
  const screenSize = useScreenSize();

  const getSparklineHeight = () => {
    switch (screenSize) {
      case 'xs':
        return 30;
      case 'sm':
        return 35;
      case 'md':
        return 40;
      case 'lg':
        return 45;
      case 'xl':
        return 50;
      case '2xl':
        return 55;
      default:
        return 40;
    }
  };

  const getSparklineWidth = () => {
    switch (screenSize) {
      case 'xs':
        return '100%';
      case 'sm':
        return '80%';
      case 'md':
        return '70%';
      case 'lg':
        return '60%';
      case 'xl':
        return '50%';
      case '2xl':
        return '40%';
      default:
        return '60%';
    }
  };

  const sparklineOptions = {
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: {
      width: screenSize === 'xs' ? 1 : screenSize === 'sm' ? 1.5 : 2,
    },
    tooltip: {
      enabled: screenSize !== 'xs', // Disable on very small screens
    },
  };

  return {
    height: getSparklineHeight(),
    width: getSparklineWidth(),
    options: sparklineOptions,
    screenSize,
  };
}
