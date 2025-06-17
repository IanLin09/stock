'use client';
import { StockDTO } from '@/utils/dto';
import React from 'react';
import dynamic from 'next/dynamic';
import { useStockPriceStyle } from '@/utils/zustand';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type params = {
  prices: StockDTO[];
  previousPrice: number;
  close: number;
};

const StockChart = ({ close, prices, previousPrice }: params) => {
  const { upColor, downColor } = useStockPriceStyle();
  const color = close - previousPrice > 0 ? upColor : downColor;
  const convertToSeries = (prices: StockDTO[]) => {
    return [
      {
        data: prices.map((price) => ({
          x: price.datetime, // or use dayjs/format if needed
          y: price.close, // or any other value like price.high
        })),
      },
    ];
  };
  const options = {
    chart: {
      id: 'basic-bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
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
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    grid: { show: false },
    tooltip: { enabled: false },
    dataLabels: {
      enabled: false,
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
  };

  const series = convertToSeries(prices);

  return (
    <div className="w-full h-full item-center max-w-3xl mx-auto">
      <Chart
        options={options}
        series={series}
        type="area"
        width="40%"
        height={'30%'}
      />
    </div>
  );
};

export default StockChart;
