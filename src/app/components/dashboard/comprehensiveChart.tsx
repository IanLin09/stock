'use client';
import { PreviousPriceDTO, StockChartDTO, StockDTO } from '@/utils/dto';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRangeList } from '@/utils/api';
import { useTranslation } from 'react-i18next';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useChartResponsive } from '@/hooks/use-chart-responsive';
import { useScreenSize, useWindowSize } from '@/hooks/use-responsive';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ChartParams = {
  prices: StockDTO[];
  previousPrice: number;
  closePrice: number;
};

type ComprehensiveChartProps = {
  symbol: string;
  closePrice: number;
};

const ComprehensiveChartGenerator = ({
  closePrice,
  prices,
  previousPrice,
}: ChartParams) => {
  const { upColor, downColor } = useStockPriceStyle();
  const { getChartOptions, getChartContainerClasses } = useChartResponsive();
  const screenSize = useScreenSize();
  const windowSize = useWindowSize();
  const color = closePrice - previousPrice > 0 ? upColor : downColor;

  // Container-based sizing with dynamic height adjustment
  const containerHeight = useMemo(() => {
    switch (screenSize) {
      case 'xs':
        return 180;
      case 'sm':
        return 200;
      case 'md':
        return 220;
      case 'lg':
        return 240;
      case 'xl':
        return 260;
      case '2xl':
        return 280;
      default:
        return 220;
    }
  }, [screenSize]);

  const containerWidth = useMemo(() => {
    if (windowSize.width === 0) return '100%';
    return '100%';
  }, [windowSize.width]);

  // Base chart options
  const baseOptions = {
    chart: {
      id: 'comprehensive-bar',
      toolbar: { show: screenSize !== 'xs' && screenSize !== 'sm' },
      height: containerHeight,
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
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontSize:
            screenSize === 'xs'
              ? '10px'
              : screenSize === 'sm'
                ? '11px'
                : '12px',
        },
      },
      axisTicks: { show: false },
      axisBorder: { show: true },
    },
    stroke: {
      width: screenSize === 'xs' ? 1 : screenSize === 'sm' ? 1.25 : 1.5,
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
        fontSize: screenSize === 'xs' ? '12px' : '14px',
        fontFamily: undefined,
        color: '#FFFFFF',
      },
      theme: 'false',
    },
    fontColor: '#00FF00',
    // Responsive configuration for ApexChart
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: containerHeight * 0.9,
            toolbar: { show: true },
          },
          stroke: {
            width: 1.5,
          },
          tooltip: {
            enabled: true,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: containerHeight * 0.8,
            toolbar: { show: false },
          },
          stroke: {
            width: 1.25,
          },
          xaxis: {
            labels: {
              show: true,
              style: {
                fontSize: '10px',
              },
            },
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                fontSize: '10px',
              },
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: containerHeight * 0.7,
            toolbar: { show: false },
          },
          stroke: {
            width: 1,
          },
          xaxis: {
            labels: {
              show: false,
            },
          },
          tooltip: {
            enabled: false,
          },
          annotations: {
            yaxis: [],
          },
        },
      },
    ],
  };

  // Generate responsive chart options
  const options = getChartOptions(baseOptions);

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
    <div
      className={`w-full mx-auto overflow-hidden ${getChartContainerClasses()}`}
      style={{
        height: `${containerHeight}px`,
        maxWidth: '100%',
      }}
    >
      <Chart
        options={options}
        series={series}
        type="area"
        height={containerHeight}
        width={containerWidth}
      />
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

const ComprehensiveChart = ({ symbol, closePrice }: ComprehensiveChartProps) => {
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
