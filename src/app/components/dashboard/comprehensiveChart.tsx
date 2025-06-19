'use client';
import { PreviousPriceDTO, StockChartDTO, StockDTO } from '@/utils/dto';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRangeList } from '@/utils/api';
import { useTranslation } from 'react-i18next';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type chartParams = {
  prices: StockDTO[];
  previousPrice: number;
  closePrice: number;
};

type params = {
  symbol: string;
  closePrice: number;
};

const ComprehensiveChartGenerator = ({
  closePrice,
  prices,
  previousPrice,
}: chartParams) => {
  const { upColor, downColor } = useStockPriceStyle();
  const color = closePrice - previousPrice > 0 ? upColor : downColor;

  const options = {
    chart: {
      id: 'comprehensive-bar',
      toolbar: { show: false },
    },
    annotations: {
      yaxis: [
        {
          y: Number(previousPrice),
          borderColor: color,
          label: {
            borderColor: color,
            text: String(previousPrice),
            style: {
              color: '#000000',
              background: color,
            },
          },
        },
      ],
    },
    xaxis: {
      labels: { show: false },
    },
    yaxis: {
      labels: { show: true },
      axisTicks: { show: false },
      axisBorder: { show: true },
    },
    stroke: {
      width: 1.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    colors: [color],
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      style: {
        fontSize: '14px',
        fontFamily: undefined,
        color: '#FFFFFF', // text color
      },
      theme: 'false',
    },
    fontColor: '#00FF00',
  };

  const series = [
    {
      name: 'price',
      data: prices.map((price) => ({
        x: price.datetime, // or use dayjs/format if needed
        y: price.close, // or any other value like price.high
      })),
    },
  ];

  return (
    <div className="w-full h-full item-center max-w-3xl mx-auto">
      <Chart options={options} series={series} type="area" height="300" />
    </div>
  );
};

const getPreviousPrice = async (symbol: string, range: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/daily/previousDayPrice?symbol=${symbol}&range=${range}`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
      },
    }
  );

  const data: PreviousPriceDTO = await res.json();
  return data;
};

const ComprehensiveChart = ({ symbol, closePrice }: params) => {
  const [range, setRange] = useState<string>('1D');
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery<StockChartDTO, Error>({
    queryKey: ['chartData', { symbol }, { range }],
    queryFn: () => getRangeList(symbol, range),
  });

  const previousPrice = useQuery<PreviousPriceDTO>({
    queryKey: ['previousClose', symbol, range],
    queryFn: () => getPreviousPrice(symbol, range),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }

    if (previousPrice.error) {
      handleError(previousPrice.error, { context: 'Data Fetch' });
    }
  }, [error, previousPrice.error]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Tabs defaultValue={range} className="w-full">
        <TabsList>
          <TabsTrigger onClick={() => setRange('1D')} value="1D">
            {t('1d')}
          </TabsTrigger>
          <TabsTrigger onClick={() => setRange('1W')} value="1W">
            {t('1w')}
          </TabsTrigger>
          <TabsTrigger onClick={() => setRange('1M')} value="1M">
            {t('1m')}
          </TabsTrigger>
          <TabsTrigger onClick={() => setRange('3M')} value="3M">
            {t('3m')}
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col">
          <div className="basis-2/3">
            {data && (
              <ComprehensiveChartGenerator
                closePrice={closePrice}
                prices={data.data}
                previousPrice={
                  previousPrice.data?.close ? previousPrice.data?.close : 0
                }
              />
            )}
          </div>
        </div>
      </Tabs>
    </>
  );
};
export default ComprehensiveChart;
