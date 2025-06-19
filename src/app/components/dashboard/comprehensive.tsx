'use client';
import ComprehensiveChart from './comprehensiveChart';
import { ClosePrices } from './closePrice';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';

type params = {
  symbol: string;
};

const ComprehensiveArea = ({ symbol }: params) => {
  const { data, isLoading, error } = ClosePrices();
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);

  if (!symbol) return <></>;
  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Loading...</p>;
  return (
    <div className="flex flex-col p-4">
      <div className=" p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold">{symbol}</div>
        </div>

        <div className="flex text-right mr-8">
          <div className="text-right mr-8">
            <div className="text-2xl font-bold">{data[symbol].close}</div>
            <div className="text-gray-400">{t('at_close')}</div>
          </div>
        </div>
      </div>
      <br />
      <div className="min-h-[370px] p-1">
        {' '}
        <ComprehensiveChart
          closePrice={data[symbol].close}
          symbol={symbol}
        />{' '}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-left pl-10">
          {t('high')}: {data[symbol].high}
        </div>
        <div className="text-left pl-10">
          {t('low')}: {data[symbol].low}
        </div>
        <div className="text-left pl-10">
          {t('open')}: {data[symbol].open}
        </div>
        <div className="text-left pl-10">
          {t('vol')}: {data[symbol].volume}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveArea;
