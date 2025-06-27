'use client';
import ComprehensiveChart from './comprehensiveChart';
import { ClosePrices } from './closePrice';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useIsMobile, useIsTablet } from '@/hooks/use-responsive';
import {
  getResponsiveTextSize,
  getResponsiveSpacing,
} from '@/utils/responsive';

type ComprehensiveAreaProps = {
  symbol: string;
};

const ComprehensiveArea = ({ symbol }: ComprehensiveAreaProps) => {
  const { data, isLoading, error } = ClosePrices();
  const { t } = useTranslation();

  // Responsive hooks
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);

  if (!symbol) return <></>;
  if (isLoading)
    return <p className={getResponsiveSpacing('sm')}>Loading...</p>;
  if (!data) return <p className={getResponsiveSpacing('sm')}>Loading...</p>;
  return (
    <div className={`flex flex-col ${getResponsiveSpacing('md')}`}>
      {/* Header Section */}
      <div
        className={`
        ${getResponsiveSpacing('sm')}
        ${
          isMobile
            ? 'flex flex-col space-y-3'
            : 'flex items-center justify-between'
        }
      `}
      >
        {/* Symbol Section */}
        <div className="flex items-center">
          <div
            className={`
            ${getResponsiveTextSize('3xl')} font-bold
            ${isMobile ? 'text-center w-full' : ''}
          `}
          >
            {symbol}
          </div>
        </div>

        {/* Price Section */}
        <div
          className={`
          ${
            isMobile
              ? 'flex flex-col items-center space-y-1'
              : 'flex text-right'
          }
        `}
        >
          <div
            className={`
            ${isMobile ? 'text-center' : 'text-right mr-4 sm:mr-8'}
          `}
          >
            <div className={`${getResponsiveTextSize('2xl')} font-bold`}>
              {data[symbol].close}
            </div>
            <div className={`text-gray-400 ${getResponsiveTextSize('sm')}`}>
              {t('at_close')}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div
        className={`
        ${
          isMobile
            ? 'min-h-[180px] mt-4'
            : isTablet
              ? 'min-h-[200px] mt-6'
              : 'min-h-[220px] mt-6'
        }
        ${getResponsiveSpacing('sm')}
      `}
      >
        <ComprehensiveChart closePrice={data[symbol].close} symbol={symbol} />
      </div>

      {/* Stats Grid */}
      <div
        className={`
        ${
          isMobile
            ? 'grid grid-cols-1 gap-2 mt-4'
            : 'grid grid-cols-2 gap-2 sm:gap-4 mt-6'
        }
      `}
      >
        <div
          className={`
          text-left
          ${
            isMobile
              ? 'px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded'
              : 'pl-4 sm:pl-6 md:pl-10'
          }
          ${getResponsiveTextSize('base')}
        `}
        >
          {t('high')}: {data[symbol].high}
        </div>
        <div
          className={`
          text-left
          ${
            isMobile
              ? 'px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded'
              : 'pl-4 sm:pl-6 md:pl-10'
          }
          ${getResponsiveTextSize('base')}
        `}
        >
          {t('low')}: {data[symbol].low}
        </div>
        <div
          className={`
          text-left
          ${
            isMobile
              ? 'px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded'
              : 'pl-4 sm:pl-6 md:pl-10'
          }
          ${getResponsiveTextSize('base')}
        `}
        >
          {t('open')}: {data[symbol].open}
        </div>
        <div
          className={`
          text-left
          ${
            isMobile
              ? 'px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded'
              : 'pl-4 sm:pl-6 md:pl-10'
          }
          ${getResponsiveTextSize('base')}
        `}
        >
          {t('vol')}: {data[symbol].volume}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveArea;
