'use client';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import {
  useAnalysisBreakpoints,
  useAnalysisLayout,
} from '@/hooks/use-analysis-responsive';
import {
  getAnalysisTextSize,
  getAnalysisSpacing,
  getAnalysisGridClasses,
  getLayoutTransitionClasses,
} from '@/utils/analysis-responsive';

const AnalysisList = () => {
  const { t } = useTranslation();
  
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const currentLayout = useAnalysisLayout();
  
  const {
    data: info,
    isLoading,
    error,
  } = useQuery<AnalysisListDTO, Error>({
    queryKey: ['analysisList', 'QQQ'],
    queryFn: () => getSymbolDetail('QQQ'),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);
  if (isLoading) return <p>Loading...</p>;

  if (info) {
    // 生成響應式類別
    const containerPadding = getAnalysisSpacing('md', currentScreenSize, 'padding');
    const titleTextSize = getAnalysisTextSize('2xl', currentScreenSize);
    const bodyTextSize = getAnalysisTextSize('base', currentScreenSize);
    const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
    const gridClasses = getAnalysisGridClasses(currentScreenSize, 2);
    const transitionClasses = getLayoutTransitionClasses();
    
    // 響應式間距
    const verticalSpacing = currentScreenSize === 'xs' ? 'space-y-3' : 
                           currentScreenSize === 'sm' ? 'space-y-4' : 'space-y-6';
    
    return (
      <div className={`h-full flex flex-col text-black dark:text-white ${containerPadding} ${transitionClasses}`}>
        {/* 標題和價格區域 */}
        <div className={`basis-1/5 ${verticalSpacing.replace('space-y', 'space-y-2')}`}>
          <h1 className={`font-bold ${titleTextSize}`}>QQQ</h1>
          <p className={bodyTextSize}>
            {t('close_price')}: {info?.indicators.close}
          </p>
        </div>
        
        {/* 技術指標區域 */}
        <div className={`basis-1/5 ${verticalSpacing.replace('space-y', 'space-y-2')}`}>
          <p className={bodyTextSize}>RSI: {info?.indicators.rsi[14]}</p>
          <p className={bodyTextSize}>
            {t('compare_MA20')}:{' '}
            {(
              ((info?.indicators.close - info.indicators.ma[20]) /
                info.indicators.ma[20]) *
              100
            ).toFixed(2)}{' '}
            %
          </p>
        </div>
        
        {/* 報告日期網格區域 */}
        <div className={`basis-2/5 ${currentLayout === 'mobile' ? 'pt-4' : 'pt-6'}`}>
          <div className={`${gridClasses} ${currentScreenSize === 'xs' ? 'gap-2' : 'gap-3'}`}>
            <div className={`font-semibold ${smallTextSize}`}>{t('symbol')}</div>
            <div className={`font-semibold ${smallTextSize}`}>{t('next_rd')}</div>
            {info.report &&
              info.report.map((item) => (
                <>
                  <div key={`${item.symbol}-symbol`} className={`${smallTextSize} py-1`}>
                    {item.symbol}
                  </div>
                  <div key={`${item.symbol}-date`} className={`${smallTextSize} py-1`}>
                    {item.reportDate}
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
    );
  }
};

export default AnalysisList;
