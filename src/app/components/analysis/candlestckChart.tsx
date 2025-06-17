import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO, StockDTO, MaData } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
import { useStockPriceStyle } from '@/utils/zustand';

type params = {
  data: StockDTO[];
  extra: StockAnalysisDTO[];
};

const CandleStickChart = ({ data, extra }: params) => {
  const { t } = useTranslation();
  const { upColor, downColor } = useStockPriceStyle();

  const candlestickOptions: ApexOptions = {
    chart: {
      type: 'line',
      id: 'candles',
      toolbar: {
        autoSelected: 'pan',
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    // title: {
    //   text: `QQQ Stock Price`,
    //   align: 'left',
    //   style: {
    //     color: '#FFFFFF',
    //   },
    // },
    stroke: {
      width: [1, 2, 2], // candle, MA5, MA20
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: true,
        format: 'dd MMM',
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      shared: true,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const date = new Date(data.x).toLocaleDateString();
        if (Array.isArray(data.y)) {
          const open = data.y[0].toFixed(2);
          const high = data.y[1].toFixed(2);
          const low = data.y[2].toFixed(2);
          const close = data.y[3].toFixed(2);

          return `
          <div class="apexcharts-tooltip-candlestick">
            <div class="p-2">
              <div class="font-semibold">${date}</div>
              <div>${t('open')}: $${open}</div>
              <div>${t('high')}: $${high}</div>
              <div>${t('low')}: $${low}</div>
              <div>${t('close_price')}: $${close}</div>
            </div>
          </div>
        `;
        } else {
          return `
          <div class="apexcharts-tooltip-candlestick">
            <div class="p-2">
              <div class="font-semibold">${date}</div>
              <div>${t('price')}: $${data.y}</div>
            </div>
          </div>
        `;
        }
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: upColor,
          downward: downColor,
        },
        wick: {
          useFillColor: true,
        },
      },
    },
  };

  const candlestickSeries = [
    {
      name: 'price',
      type: 'candlestick',
      data: data.map((price) => ({
        x: new Date(price.datetime), // or use dayjs/format if needed
        y: [price.open, price.high, price.low, price.close], // or any other value like price.high
      })),
    },
    {
      name: 'EMA5',
      type: 'line',
      data: extra.map((price) => ({
        x: new Date(price.datetime), // or use dayjs/format if needed
        y: Number(price.ema[5].toFixed(2)), // or any other value like price.high
      })),
    },
    {
      name: 'MA20',
      type: 'line',
      data: extra.map((price) => ({
        x: new Date(price.datetime), // or use dayjs/format if needed
        y: Number(price.ma[20].toFixed(2)), // or any other value like price.high
      })),
    },
  ];

  return (
    <Chart
      options={candlestickOptions}
      series={candlestickSeries}
      height="95%"
    ></Chart>
  );
};

export default CandleStickChart;
