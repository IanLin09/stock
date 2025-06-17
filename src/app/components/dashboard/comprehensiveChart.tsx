'use client';
import { PreviousPriceDTO, StockChartDTO, StockDTO } from '@/utils/dto';
import React, { useState } from 'react';
import { DateTime } from 'luxon';
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
  type: string;
};

type params = {
  symbol: string;
  closePrice: number;
};

type ChartQueryKey = readonly [
  'chartData',
  { symbol: string },
  { range: string },
];

let monthLabel: number[] = [];

const getMonthLabel = () => {
  if (monthLabel.length > 0) return monthLabel;

  const today = DateTime.local(); // or DateTime.fromISO('2025-05-05')
  const start = today.minus({ days: 30 });

  let current = start.startOf('day');

  while (current <= today.endOf('day')) {
    if (current.weekday === 1) {
      // 1 = Monday
      monthLabel.push(current.day); // or format as needed
    }
    current = current.plus({ days: 1 });
  }
  return monthLabel;
};

const ComprehensiveChartGenerator = ({
  closePrice,
  prices,
  previousPrice,
  type,
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
      type: 'category' as 'category',
      labels: { show: false },
      // labels: {
      //   formatter: (dateStr: string) => {
      //     if (!dateStr) return '';
      //     let formatt = 'yyyy-MM-dd HH:mm:ss';
      //     if (type == '1M' || type == '3M') {
      //       formatt = 'yyyy-MM-dd';
      //     }
      //     const dt = DateTime.fromFormat(
      //       dateStr,
      //       formatt,
      //       { zone: 'America/New_York' } // Automatically handles UTC-4
      //     );
      //     switch (type) {
      //       case '1D':
      //         return dt.minute == 0 ? `${dt.hour}` : '';
      //       case '1W':
      //         return dt.hour == 10 && dt.minute == 0 ? `${dt.day}` : '';
      //       case '1M':
      //         const moLabels = getMonthLabel();
      //         return moLabels.includes(dt.day) ? `${dt.day}` : '';
      //       case '3M':
      //         return dt.day == 1 ? `${dt.toFormat('LLLL')}` : '';
      //       default:
      //         return '';
      //     }
      //   },
      //   rotate: 0,
      //   style: {
      //     colors: '#FFFFFF',
      //     fontSize: '12px',
      //     fontFamily: 'Helvetica, Arial, sans-serif',
      //     fontWeight: 400,
      //     cssClass: 'apexcharts-xaxis-label',
      //   },
      // },
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
      // x: {
      //   formatter: (value: any) => {
      //

      //     const dateStr = String(value);
      //     let formatt = 'yyyy-MM-dd HH:mm:ss';
      //     if (type == '1M' || type == '3M') {
      //       formatt = 'yyyy-MM-dd';
      //     }
      //     const dt = DateTime.fromFormat(dateStr, formatt, {
      //       zone: 'America/New_York',
      //     });

      //     return dt.isValid ? dt.toFormat(formatt) : '';
      //   },
      // }
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

  let data: PreviousPriceDTO = await res.json();
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
                type={range}
              />
            )}
          </div>
        </div>
      </Tabs>
    </>
  );
};
export default ComprehensiveChart;
