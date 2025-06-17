'use client';
import { useQuery } from '@tanstack/react-query';
import StockChart from './lineChart';
import { StockChartDTO } from '@/utils/dto';
import { ClosePrices } from './closePrice';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';

type params = {
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
  let data: StockChartDTO[] = await res.json();
  return data;
};

const DashboardList = ({ setSymbol }: params) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['intra_day_list'],
    queryFn: getList,
  });
  const { upColor, downColor } = useStockPriceStyle();
  const latestClosePriceQuery = ClosePrices();

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }

    if (latestClosePriceQuery.error) {
      handleError(latestClosePriceQuery.error, { context: 'Data Fetch' });
    }
  }, [error, latestClosePriceQuery.error]);

  if (latestClosePriceQuery.isLoading) {
    return <div>Loading...</div>;
  }
  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <div className="px-3 flex flex-col h-full">
        {data &&
          data.map((stock, idx) => (
            <div
              key={stock._id}
              onClick={() => setSymbol(stock._id)}
              className={`cursor-default flex flex-row items-center flex-1 py-2`}
              style={{
                color:
                  (latestClosePriceQuery.data?.[stock._id]?.close ?? 0) -
                    (stock.previous ?? 0) >
                  0
                    ? upColor
                    : downColor,
              }}
            >
              <div className="w-1/3 text-left">{stock._id}</div>
              <div className="w-1/3 text-right">
                <StockChart
                  close={latestClosePriceQuery.data?.[stock._id]?.close ?? 0}
                  prices={stock.data}
                  previousPrice={stock.previous ? stock.previous : 0}
                />
              </div>
              <div className="w-1/3 text-center">
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
