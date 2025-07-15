import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO, StockDTO } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
import { useStockPriceStyle } from '@/utils/zustand';
import {
  useAnalysisBreakpoints,
  useChartDimensions,
} from '@/hooks/use-analysis-responsive';
import { getAnalysisChartOptions } from '@/utils/analysis-responsive';

type CandlestickChartProps = {
  data: StockDTO[];
  extra: StockAnalysisDTO[];
};

const CandleStickChart = ({ data, extra }: CandlestickChartProps) => {
  const { t } = useTranslation();
  const { upColor, downColor } = useStockPriceStyle();

  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const { candlestickHeight } = useChartDimensions();

  // 獲取完整的響應式圖表配置
  const candlestickOptions: ApexOptions = getAnalysisChartOptions(
    currentScreenSize,
    'candlestick',
    {
      upColor,
      downColor,
      translation: {
        open: t('open'),
        high: t('high'),
        low: t('low'),
        close_price: t('close_price'),
        price: t('price'),
      },
    }
  );

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
      name: 'Bollinger',
      type: 'rangeArea',
      data: extra
        .filter((item) => item.bollinger)
        .map((item) => ({
          x: new Date(item.datetime), // or use dayjs/format if needed
          y: [item.bollinger['lower'], item.bollinger['upper']], // or any other value like price.high
        })),
    },
    {
      name: 'EMA5',
      type: 'line',
      data: extra
        .filter((item) => item.bollinger)
        .map((price) => ({
          x: new Date(price.datetime), // or use dayjs/format if needed
          y: Number(price.ema[5].toFixed(2)), // or any other value like price.high
        })),
    },
    {
      name: 'MA20',
      type: 'line',
      data: extra
        .filter((item) => item.bollinger)
        .map((price) => ({
          x: new Date(price.datetime), // or use dayjs/format if needed
          y: Number(price.ma[20].toFixed(2)), // or any other value like price.high
        })),
    },
  ];

  return (
    <Chart
      options={candlestickOptions}
      series={candlestickSeries}
      height={candlestickHeight}
    />
  );
};

export default CandleStickChart;
