'use client';
import { useScreenSize, useWindowSize, useIsMobile, useIsTablet } from './use-responsive';
import { useMemo } from 'react';

export type AnalysisLayoutType = 'desktop' | 'tablet' | 'mobile';
export type ChartSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Analysis 頁面專用布局判斷
export const useAnalysisLayout = (): AnalysisLayoutType => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  return useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }, [isMobile, isTablet]);
};

// Analysis 頁面專用斷點判斷
export const useAnalysisBreakpoints = () => {
  const screenSize = useScreenSize();
  const windowSize = useWindowSize();
  
  return useMemo(() => ({
    // 基本斷點
    isXs: screenSize === 'xs',
    isSm: screenSize === 'sm', 
    isMd: screenSize === 'md',
    isLg: screenSize === 'lg',
    isXl: screenSize === 'xl',
    is2xl: screenSize === '2xl',
    
    // Analysis 專用組合斷點
    isMobilePortrait: windowSize.width < 640,
    isMobileLandscape: windowSize.width >= 640 && windowSize.width < 768,
    isTabletPortrait: windowSize.width >= 768 && windowSize.width < 1024,
    isTabletLandscape: windowSize.width >= 1024 && windowSize.width < 1280,
    isDesktop: windowSize.width >= 1280,
    isLargeDesktop: windowSize.width >= 1536,
    
    // 布局決策斷點
    shouldUseTabLayout: windowSize.width < 768, // 手機用標籤頁
    shouldUseVerticalLayout: windowSize.width >= 768 && windowSize.width < 1024, // 平板用垂直
    shouldUseHorizontalLayout: windowSize.width >= 1024, // 桌面用水平
    
    // 圖表功能斷點
    shouldShowToolbar: windowSize.width >= 768,
    shouldShowTooltip: windowSize.width >= 640,
    shouldSimplifyChart: windowSize.width < 640,
    
    currentScreenSize: screenSize,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height
  }), [screenSize, windowSize]);
};

// 圖表尺寸計算
export const useChartDimensions = () => {
  const { currentScreenSize, windowWidth, windowHeight } = useAnalysisBreakpoints();
  
  return useMemo(() => {
    // 主要蠟燭圖高度 - 再次縮減確保 RSI 可見
    const getCandlestickHeight = (): number => {
      switch (currentScreenSize) {
        case 'xs': return 160;
        case 'sm': return 180;
        case 'md': return 200;
        case 'lg': return 220;
        case 'xl': return 240;
        case '2xl': return 260;
        default: return 200;
      }
    };
    
    // 成交量圖高度 - 進一步縮減
    const getVolumeHeight = (): number => {
      switch (currentScreenSize) {
        case 'xs': return 25;
        case 'sm': return 28;
        case 'md': return 30;
        case 'lg': return 35;
        case 'xl': return 40;
        case '2xl': return 45;
        default: return 30;
      }
    };
    
    // 指標圖高度 - 減少避免頁面過高
    const getIndicatorHeight = (): number => {
      switch (currentScreenSize) {
        case 'xs': return 120;
        case 'sm': return 140;
        case 'md': return 160;
        case 'lg': return 170;
        case 'xl': return 180;
        case '2xl': return 190;
        default: return 160;
      }
    };
    
    // 側邊欄寬度 (百分比)
    const getSidebarWidth = (): string => {
      if (windowWidth < 768) return '100%'; // 手機全寬
      if (windowWidth < 1024) return '100%'; // 平板全寬 (垂直布局)
      if (windowWidth < 1280) return '25%'; // 小桌面 1/4
      return '20%'; // 大桌面 1/5
    };
    
    // 主圖表區域寬度
    const getMainChartWidth = (): string => {
      if (windowWidth < 1024) return '100%';
      if (windowWidth < 1280) return '75%';
      return '80%';
    };
    
    // 圖表容器間距
    const getChartSpacing = (): string => {
      switch (currentScreenSize) {
        case 'xs': return 'space-y-2';
        case 'sm': return 'space-y-3';
        case 'md': return 'space-y-4';
        default: return 'space-y-6';
      }
    };
    
    return {
      candlestickHeight: getCandlestickHeight(),
      volumeHeight: getVolumeHeight(),
      indicatorHeight: getIndicatorHeight(),
      sidebarWidth: getSidebarWidth(),
      mainChartWidth: getMainChartWidth(),
      chartSpacing: getChartSpacing(),
      
      // 百分比版本 (for Flexbox)
      candlestickHeightPercent: windowWidth < 768 ? '60%' : '65%',
      indicatorHeightPercent: windowWidth < 768 ? '40%' : '35%',
      volumeHeightPercent: '5%',
      
      // 容器高度
      totalChartHeight: windowHeight < 600 ? 
        Math.min(windowHeight - 200, 400) : // 小螢幕限制高度
        windowHeight - 150, // 正常螢幕預留空間
      
      // 工具列相關
      toolbarHeight: currentScreenSize === 'xs' ? 0 : 40,
      tabHeight: 48,
      
      currentScreenSize
    };
  }, [currentScreenSize, windowWidth, windowHeight]);
};

// Analysis 專用樣式計算
export const useAnalysisStyles = () => {
  const layout = useAnalysisLayout();
  const breakpoints = useAnalysisBreakpoints();
  const dimensions = useChartDimensions();
  
  return useMemo(() => ({
    // 主容器樣式
    getMainContainerClasses: (): string => {
      const base = 'h-full text-black dark:text-white p-4';
      
      switch (layout) {
        case 'mobile':
          return `${base} flex flex-col space-y-4`;
        case 'tablet':
          return `${base} flex flex-col space-y-4`;
        case 'desktop':
          return `${base} flex flex-row space-x-4`;
        default:
          return `${base} flex flex-col space-y-4`;
      }
    },
    
    // 圖表區域樣式
    getChartAreaClasses: (): string => {
      switch (layout) {
        case 'mobile':
          return 'w-full';
        case 'tablet':
          return 'w-full h-2/3';
        case 'desktop':
          return 'flex-1 border border-black dark:border-white';
        default:
          return 'w-full';
      }
    },
    
    // 側邊欄樣式
    getSidebarClasses: (): string => {
      switch (layout) {
        case 'mobile':
          return 'w-full';
        case 'tablet':
          return 'w-full h-1/3 overflow-x-auto';
        case 'desktop':
          return `w-1/5 border border-black dark:border-white`;
        default:
          return 'w-full';
      }
    },
    
    // 圖表組合區域樣式
    getChartGroupClasses: (): string => {
      const base = 'flex w-full h-full';
      
      if (breakpoints.shouldUseTabLayout) {
        return `${base} flex-col`; // 手機用標籤頁，不需要特殊布局
      }
      
      return `${base} flex-col ${dimensions.chartSpacing}`;
    },
    
    // 主圖表容器樣式
    getMainChartContainerClasses: (): string => {
      if (breakpoints.shouldUseTabLayout) {
        return 'w-full h-full';
      }
      
      return `w-full ${dimensions.candlestickHeightPercent === '60%' ? 'flex-[3]' : 'flex-[2]'}`;
    },
    
    // 指標圖表容器樣式
    getIndicatorContainerClasses: (): string => {
      if (breakpoints.shouldUseTabLayout) {
        return 'w-full h-full';
      }
      
      return `w-full ${dimensions.indicatorHeightPercent === '40%' ? 'flex-[2]' : 'flex-[1]'} pt-4`;
    },
    
    layout,
    breakpoints,
    dimensions
  }), [layout, breakpoints, dimensions]);
};