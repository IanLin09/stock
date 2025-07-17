'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAnalysisStore } from '@/utils/zustand';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';

const PriceDisplay = () => {
  const { t } = useTranslation();
  const { currentSymbol } = useAnalysisStore();

  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);

  const { data: info } = useQuery<AnalysisListDTO, Error>({
    queryKey: ['analysisList', currentSymbol],
    queryFn: () => getSymbolDetail(currentSymbol),
  });

  if (!info) {
    return (
      <div className={`${textSize} text-gray-500 dark:text-gray-400`}>
        {t('loading')}...
      </div>
    );
  }

  return (
    <div className="ml-4 flex flex-col">
      <div className={`${textSize} font-semibold text-black dark:text-white`}>
        {info.indicators.close}
      </div>
      <div className={`${smallTextSize} text-gray-600 dark:text-gray-400`}>
        {t('close_price')}
      </div>
    </div>
  );
};

export default PriceDisplay;
