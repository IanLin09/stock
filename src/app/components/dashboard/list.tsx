'use client';
import { useQuery } from '@tanstack/react-query';
import StockChart from './lineChart';
import { StockChartDTO } from '@/utils/dto';
import { ClosePrices } from './closePrice';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useIsMobile } from '@/hooks/use-responsive';
import { getResponsiveSpacing } from '@/utils/responsive';

type DashboardListProps = {
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
};

const getList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/intraday/latest`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });
  const data: StockChartDTO[] = await res.json();
  return data;
};

const DashboardList = ({ setSymbol }: DashboardListProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['intra_day_list'],
    queryFn: getList,
  });
  const { upColor, downColor } = useStockPriceStyle();
  const latestClosePriceQuery = ClosePrices();

  // Responsive hooks
  const isMobile = useIsMobile();

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }

    if (latestClosePriceQuery.error) {
      handleError(latestClosePriceQuery.error, { context: 'Data Fetch' });
    }
  }, [error, latestClosePriceQuery.error]);

  if (latestClosePriceQuery.isLoading) {
    return <div className={getResponsiveSpacing('sm')}>Loading...</div>;
  }
  if (isLoading)
    return <p className={getResponsiveSpacing('sm')}>Loading...</p>;

  return (
    <>
      <div
        className={`${getResponsiveSpacing('sm')} flex flex-col space-y-1 sm:space-y-2 ${
          data && data.length > 4 ? 'overflow-y-auto' : 'overflow-y-hidden'
        }`}
        style={{
          height: 'auto',
          maxHeight: data && data.length > 4 ? (isMobile ? '60vh' : '55vh') : 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) transparent'
        }}
      >
        {data &&
          data.map((stock) => (
            <div
              key={stock._id}
              onClick={() => setSymbol(stock._id)}
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
                color:
                  (latestClosePriceQuery.data?.[stock._id]?.close ?? 0) -
                    (stock.previous ?? 0) >
                  0
                    ? upColor
                    : downColor,
              }}
            >
              {/* Stock Symbol */}
              <div
                className={`
                ${
                  isMobile
                    ? 'text-center text-lg font-bold mb-2'
                    : 'w-20 sm:w-24 md:w-32 text-left text-sm sm:text-base font-medium'
                }
              `}
              >
                {stock._id}
              </div>

              {/* Chart Section */}
              <div
                className={`
                ${
                  isMobile
                    ? 'flex justify-center items-center h-16 mb-2'
                    : 'flex-1 max-w-[120px] sm:max-w-[140px] md:max-w-[160px] text-right'
                }
              `}
              >
                <StockChart
                  close={latestClosePriceQuery.data?.[stock._id]?.close ?? 0}
                  prices={stock.data}
                  previousPrice={stock.previous ? stock.previous : 0}
                />
              </div>

              {/* Price Section */}
              <div
                className={`
                ${
                  isMobile
                    ? 'text-center text-xl font-bold'
                    : 'w-16 sm:w-20 md:w-24 text-right text-sm sm:text-base font-medium'
                }
              `}
              >
                {latestClosePriceQuery.data &&
                  latestClosePriceQuery.data[stock._id].close}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default DashboardList;
