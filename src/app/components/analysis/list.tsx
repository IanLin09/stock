'use client';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';

const AnalysisList = () => {
  const { t } = useTranslation();
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
    return (
      <div className="h-full flex flex-col px-4 py-8 text-black dark:text-white">
        <div className="basis-1/5 ">
          <h1>QQQ</h1>
          <p>
            {t('close_price')}: {info?.indicators.close}
          </p>
        </div>
        <div className="basis-1/5">
          <p>RSI: {info?.indicators.rsi[14]}</p>
          <p>
            {t('compare_MA20')}:{' '}
            {(
              ((info?.indicators.close - info.indicators.ma[20]) /
                info.indicators.ma[20]) *
              100
            ).toFixed(2)}{' '}
            %
          </p>
        </div>
        <div className="basis-2/5 grid grid-cols-2 gap-2">
          <div>{t('symbol')}</div>
          <div>{t('next_rd')}</div>
          {info.report &&
            info.report.map((item) => (
              <>
                <div key={`${item.symbol}-symbol`}>{item.symbol}</div>
                <div>{item.reportDate}</div>
              </>
            ))}
        </div>
      </div>
    );
  }
};

export default AnalysisList;
