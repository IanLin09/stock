'use client';
import { StockDTO } from '@/utils/dto';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useStockPriceStyle } from '@/utils/zustand';
import { useSparklineResponsive } from '@/hooks/use-chart-responsive';
import { useWindowSize, useScreenSize } from '@/hooks/use-responsive';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type LineChartProps = {
  prices: StockDTO[];
  previousPrice: number;
  close: number;
};

const StockChart = ({ close, prices, previousPrice }: LineChartProps) => {
  const { upColor, downColor } = useStockPriceStyle();
  const { options: sparklineOptions } = useSparklineResponsive();
  const windowSize = useWindowSize();
  const screenSize = useScreenSize();
  const color = close - previousPrice > 0 ? upColor : downColor;

  const convertToSeries = (prices: StockDTO[]) => {
    return [
      {
        data: prices.map((price) => ({
          x: price.datetime,
          y: price.close,
        })),
      },
    ];
  };

  // Container-based sizing with dynamic height adjustment
  const containerHeight = useMemo(() => {
    switch (screenSize) {
      case 'xs':
        return 40;
      case 'sm':
        return 50;
      case 'md':
        return 60;
      case 'lg':
        return 70;
      case 'xl':
        return 80;
      case '2xl':
        return 90;
      default:
        return 60;
    }
  }, [screenSize]);

  const containerWidth = useMemo(() => {
    if (windowSize.width === 0) return '100%';
    return Math.min(windowSize.width * 0.95, 200);
  }, [windowSize.width]);

  // Responsive ApexChart configuration
  const options = {
    ...sparklineOptions,
    chart: {
      ...sparklineOptions.chart,
      id: 'stock-sparkline',
      type: 'area' as const,
      height: containerHeight,
      width: containerWidth,
    },
    tooltip: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: containerHeight * 0.9,
          },
          stroke: {
            width: 2,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: containerHeight * 0.8,
          },
          stroke: {
            width: 1.5,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: containerHeight * 0.7,
          },
          stroke: {
            width: 1,
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
    annotations: {
      yaxis: [
        {
          y: Number(previousPrice),
          borderColor: color,
          label: {
            borderColor: color,
            style: {
              color: color,
              background: color,
            },
          },
        },
      ],
    },
    stroke: {
      ...sparklineOptions.stroke,
      colors: [color],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: color,
            opacity: 0.4,
          },
          {
            offset: 100,
            color: color,
            opacity: 0,
          },
        ],
      },
    },
    colors: [color],
  };

  const series = convertToSeries(prices);

  return (
    <div
      className="w-full flex items-center justify-center overflow-hidden"
      style={{
        height: `${containerHeight}px`,
        maxWidth: '100%',
      }}
    >
      <Chart
        options={options}
        series={series}
        type="area"
        width={containerWidth}
        height={containerHeight}
      />
    </div>
  );
};

export default StockChart;
