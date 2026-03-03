'use client';
import { StockChartDTO, StockDTO } from '@/utils/dto';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getRangeList, getAnalysisList } from '@/utils/api';
import { useStockPriceStyle } from '@/utils/zustand';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useChartResponsive } from '@/hooks/use-chart-responsive';
import { useScreenSize, useWindowSize } from '@/hooks/use-responsive';
import StrategyDashboard from './StrategyDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ChartParams = {
  prices: StockDTO[];
  previousPrice: number;
  closePrice: number;
  onPlotOffsetChange?: (offset: number) => void;
};

type ComprehensiveChartProps = {
  symbol: string;
  closePrice: number;
  range: string;
  onPlotOffsetChange?: (offset: number) => void;
  onPreviousPriceChange?: (price: number) => void;
};

const ComprehensiveChartGenerator = ({
  closePrice,
  prices,
  previousPrice,
  onPlotOffsetChange,
}: ChartParams) => {
  const { upColor, downColor } = useStockPriceStyle();
  const { getChartOptions, getChartContainerClasses } = useChartResponsive();
  const screenSize = useScreenSize();
  const windowSize = useWindowSize();
  const color = closePrice - previousPrice > 0 ? upColor : downColor;

  const containerWidth = useMemo(() => {
    if (windowSize.width === 0) return '100%';
    return '100%';
  }, [windowSize.width]);

  // Base chart options
  const baseOptions = {
    chart: {
      id: 'comprehensive-bar',
      toolbar: { show: screenSize !== 'xs' && screenSize !== 'sm' },
      height: '100%',
      events: {
        mounted: (chartInstance: any) => {
          const offset = chartInstance?.w?.globals?.translateX;
          if (typeof offset === 'number') onPlotOffsetChange?.(offset);
        },
        updated: (chartInstance: any) => {
          const offset = chartInstance?.w?.globals?.translateX;
          if (typeof offset === 'number') onPlotOffsetChange?.(offset);
        },
      },
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
      className={`w-full h-full mx-auto overflow-hidden ${getChartContainerClasses()}`}
      style={{ maxWidth: '100%' }}
    >
      <Chart
        options={options}
        series={series}
        type="area"
        height="100%"
        width={containerWidth}
      />
    </div>
  );
};


const ComprehensiveChart = ({
  symbol,
  closePrice,
  range,
  onPlotOffsetChange,
  onPreviousPriceChange,
}: ComprehensiveChartProps) => {
  const { data, isLoading, error } = useQuery<StockChartDTO, Error>({
    queryKey: ['chartData', { symbol }, { range }],
    queryFn: () => getRangeList(symbol, range),
    enabled: range !== 'Range',
  });

  // Range tab uses 1M analysis data since 'Range' is not a valid API range value
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
  } = useQuery({
    queryKey: ['analysis', symbol, range],
    queryFn: () => getAnalysisList(symbol, '1M'),
    enabled: range === 'Range',
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
    if (analysisError) {
      handleError(analysisError, { context: 'Analysis Fetch' });
    }
  }, [error, analysisError]);

  // Use the first data point in the chart as the start-of-range reference price.
  // This works for every range (1M, 3M, 6M) because data.data is sorted ascending
  // and data.data[0] is always the first visible candle of the selected period.
  useEffect(() => {
    const startClose = data?.data?.[0]?.close;
    if (startClose != null) {
      onPreviousPriceChange?.(startClose);
    }
  }, [data, onPreviousPriceChange]);

  if (isLoading || isAnalysisLoading) return <p>Loading...</p>;

  return (
    <div className="w-full h-full">
      {range === 'Range' ? (
        <StrategyDashboard
          symbol={symbol}
          analysis={analysisData?.[0] || null}
        />
      ) : (
        data && (
          <ComprehensiveChartGenerator
            closePrice={closePrice}
            prices={data.data}
            previousPrice={data.data[0]?.close ?? 0}
            onPlotOffsetChange={onPlotOffsetChange}
          />
        )
      )}
    </div>
  );
};
export default ComprehensiveChart;
