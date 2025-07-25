'use client';
import React, { useEffect } from 'react';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import { handleError } from '@/utils/error';
import {
  useAnalysisBreakpoints,
  useAnalysisLayout,
} from '@/hooks/use-analysis-responsive';
import {
  getAnalysisSpacing,
  getLayoutTransitionClasses,
} from '@/utils/analysis-responsive';
import { useAnalysisStore } from '@/utils/zustand';
import SymbolSwitcher from './SymbolSwitcher';
import TechnicalIndicators from './TechnicalIndicators';
import TradingStrategies from './TradingStrategies';

const AnalysisList = () => {
  // 添加自定義滾動條樣式
  const injectScrollbarStyles = () => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.6);
        }
        .dark .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // 注入樣式
  useEffect(() => {
    injectScrollbarStyles();
  }, []);

  // 狀態管理
  const { currentSymbol } = useAnalysisStore();

  // 自定義滾動條樣式
  const customScrollStyle = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
    scrollBehavior: 'smooth' as const,
  };

  const indicatorScrollStyle = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
    scrollBehavior: 'smooth' as const,
  };

  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const currentLayout = useAnalysisLayout();

  const {
    data: info,
    isLoading,
    error,
  } = useQuery<AnalysisListDTO, Error>({
    queryKey: ['analysisList', currentSymbol],
    queryFn: () => getSymbolDetail(currentSymbol),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);
  if (isLoading) return <p>Loading...</p>;

  if (info) {
    // 生成響應式類別
    const containerPadding = getAnalysisSpacing(
      'md',
      currentScreenSize,
      'padding'
    );
    const transitionClasses = getLayoutTransitionClasses();

    // 響應式間距
    const verticalSpacing =
      currentScreenSize === 'xs'
        ? 'space-y-3'
        : currentScreenSize === 'sm'
          ? 'space-y-4'
          : 'space-y-6';

    return (
      <div
        className={`h-full flex flex-col text-black dark:text-white ${containerPadding} ${transitionClasses} overflow-y-auto custom-scrollbar`}
        style={customScrollStyle}
      >
        {/* Symbol 切換和價格區域 */}
        <div
          className={`basis-1/5 ${verticalSpacing.replace('space-y', 'space-y-2')}`}
        >
          <SymbolSwitcher />
        </div>

        {/* 技術指標區域 */}
        <div
          className={`basis-2/5 ${currentLayout === 'mobile' ? 'pt-2' : 'pt-4'} overflow-y-auto custom-scrollbar-thin`}
          style={indicatorScrollStyle}
        >
          <TechnicalIndicators />
        </div>

        {/* 策略分析區域 */}
        <div
          className={`basis-2/5 ${currentLayout === 'mobile' ? 'pt-2' : 'pt-4'} overflow-y-auto custom-scrollbar-thin`}
          style={indicatorScrollStyle}
        >
          <TradingStrategies className="h-full" />
        </div>
      </div>
    );
  }
};

export default AnalysisList;
