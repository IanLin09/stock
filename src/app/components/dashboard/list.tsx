'use client';
import { ClosePrices, PreviousPrices } from './closePrice';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect, useMemo } from 'react';
import { handleError } from '@/utils/error';
import { useIsMobile } from '@/hooks/use-responsive';
import { getResponsiveSpacing } from '@/utils/responsive';
import { formatVolume, formatPercentage } from '@/utils/formatters';

type DashboardListProps = {
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
};

type StockDisplayData = {
  symbol: string;
  close: number;
  volume: number;
  percentage: string;
  change: number;
};

const DashboardList = ({ setSymbol }: DashboardListProps) => {
  const { upColor, downColor } = useStockPriceStyle();
  const latestClosePriceQuery = ClosePrices();

  // Responsive hooks
  const isMobile = useIsMobile();

  // Get list of symbols from latest prices
  const symbols = useMemo(() => {
    if (!latestClosePriceQuery.data) return [];
    return Object.keys(latestClosePriceQuery.data).sort();
  }, [latestClosePriceQuery.data]);
  // Fetch previous prices for all symbols in a single bulk request
  const previousPricesQuery = PreviousPrices('1D');

  // Calculate display data
  const displayData = useMemo<StockDisplayData[]>(() => {
    if (!latestClosePriceQuery.data) return [];

    return symbols.map((symbol) => {
      const current = latestClosePriceQuery.data[symbol];
      const previous = previousPricesQuery.data?.[symbol]?.close;

      const change = previous ? current.close - previous : 0;
      const percentage = formatPercentage(current.close, previous);

      return {
        symbol,
        close: current.close,
        volume: current.volume,
        percentage,
        change,
      };
    });
  }, [latestClosePriceQuery.data, symbols, previousPricesQuery.data]);

  // Handle errors
  useEffect(() => {
    if (latestClosePriceQuery.error) {
      handleError(latestClosePriceQuery.error, { context: 'Data Fetch' });
    }
  }, [latestClosePriceQuery.error]);

  useEffect(() => {
    if (previousPricesQuery.error) {
      handleError(previousPricesQuery.error, { context: 'Data Fetch' });
    }
  }, [previousPricesQuery.error]);

  // Loading state
  const isLoading =
    latestClosePriceQuery.isLoading || previousPricesQuery.isLoading;

  if (isLoading) {
    return <div className={getResponsiveSpacing('sm')}>Loading...</div>;
  }

  return (
    <>
      <div
        className={`${getResponsiveSpacing('sm')} flex flex-col space-y-1 sm:space-y-2 ${
          displayData.length > 4 ? 'overflow-y-auto' : 'overflow-y-hidden'
        }`}
        style={{
          height: 'auto',
          maxHeight:
            displayData.length > 4 ? (isMobile ? '60vh' : '55vh') : 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) transparent',
        }}
      >
        {displayData.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => setSymbol(stock.symbol)}
            className={`
              cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg
              transition-colors duration-200
              ${
                isMobile
                  ? 'flex flex-col space-y-2 p-3 border border-gray-200 dark:border-gray-700'
                  : 'flex flex-row items-center py-1 px-2'
              }
            `}
            style={{
              color: stock.change >= 0 ? upColor : downColor,
            }}
          >
            {isMobile ? (
              <>
                {/* Mobile Layout */}
                {/* Symbol */}
                <div className="text-center text-lg font-bold">
                  {stock.symbol}
                </div>

                {/* Close Price */}
                <div className="text-center text-xl font-bold">
                  {stock.close.toFixed(2)}
                </div>

                {/* Percentage */}
                <div className="text-center text-base font-bold">
                  {stock.percentage}
                </div>

                {/* Volume */}
                <div className="text-center text-sm">
                  Vol: {formatVolume(stock.volume)}
                </div>
              </>
            ) : (
              <>
                {/* Desktop Layout */}
                {/* Symbol */}
                <div className="w-20 sm:w-24 md:w-32 text-left text-sm sm:text-base font-medium">
                  {stock.symbol}
                </div>

                {/* Close Price */}
                <div className="flex-1 text-right text-sm sm:text-base">
                  {stock.close.toFixed(2)}
                </div>

                {/* Percentage */}
                <div className="w-24 sm:w-28 text-right text-sm sm:text-base font-bold">
                  {stock.percentage}
                </div>

                {/* Volume */}
                <div className="w-20 sm:w-24 text-right text-xs sm:text-sm">
                  {formatVolume(stock.volume)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardList;
