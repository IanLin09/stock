import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO } from '@/utils/dto';
import {
  useAnalysisBreakpoints,
  useChartDimensions,
} from '@/hooks/use-analysis-responsive';
import { getAnalysisChartOptions } from '@/utils/analysis-responsive';

type RSIChartProps = {
  extra: StockAnalysisDTO[];
};

const RSIChart = ({ extra }: RSIChartProps) => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const { indicatorHeight } = useChartDimensions();

  // 獲取完整的響應式圖表配置
  const rsiOptions: ApexOptions = {
    ...getAnalysisChartOptions(currentScreenSize, 'line'),
    chart: {
      ...getAnalysisChartOptions(currentScreenSize, 'line').chart,
      id: 'RSI_chart',
    },
    yaxis: {
      ...getAnalysisChartOptions(currentScreenSize, 'line').yaxis,
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: (val: number) => val.toFixed(0),
        style: {
          fontSize:
            currentScreenSize === 'xs'
              ? '10px'
              : currentScreenSize === 'sm'
                ? '11px'
                : '12px',
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: 70,
          borderColor: '#ef4444',
          label: {
            text: 'Overbought (70)',
            style: {
              color: '#ef4444',
              background: 'transparent',
              fontSize: currentScreenSize === 'xs' ? '10px' : '11px',
            },
            position: 'right',
          },
        },
        {
          y: 30,
          borderColor: '#22c55e',
          label: {
            text: 'Oversold (30)',
            style: {
              color: '#22c55e',
              background: 'transparent',
              fontSize: currentScreenSize === 'xs' ? '10px' : '11px',
            },
            position: 'right',
          },
        },
      ],
    },
    title:
      currentScreenSize === 'xs'
        ? undefined
        : {
            text: 'RSI',
            align: 'left',
            style: {
              color: '#FFFFFF',
              fontSize: currentScreenSize === 'sm' ? '16px' : '18px',
            },
          },
  };

  const series = [
    {
      name: 'RSI',
      data: extra.map((price) => ({
        x: new Date(price.datetime),
        y: Number(price.rsi[14].toFixed(2)),
      })),
    },
  ];

  return (
    <Chart
      options={rsiOptions}
      series={series}
      type="line"
      height={indicatorHeight}
    />
  );
};

export default RSIChart;
