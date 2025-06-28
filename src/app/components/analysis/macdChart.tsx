import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO } from '@/utils/dto';
import {
  useAnalysisBreakpoints,
  useChartDimensions,
} from '@/hooks/use-analysis-responsive';
import { getAnalysisChartOptions } from '@/utils/analysis-responsive';

type MACDChartProps = {
  data: StockAnalysisDTO[];
};

type chartData = {
  x: Date;
  y: number;
};

const MACDChart = ({ data }: MACDChartProps) => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const { indicatorHeight } = useChartDimensions();

  const dif: chartData[] = [];
  const dea: chartData[] = [];
  const histogram: chartData[] = [];

  data.map((d) => {
    dif.push({ x: d.datetime, y: d.macd.dif });
    dea.push({ x: d.datetime, y: d.macd.dea });
    histogram.push({ x: d.datetime, y: d.macd.histogram });
  });
  
  const series = [
    {
      name: 'dif',
      type: 'line',
      data: dif,
    },
    {
      name: 'dea',
      type: 'line',
      data: dea,
    },
    {
      name: 'histogram',
      type: 'column',
      data: histogram,
    },
  ];

  // 獲取完整的響應式圖表配置
  const macdOptions: ApexOptions = {
    ...getAnalysisChartOptions(currentScreenSize, 'mixed'),
    chart: {
      ...getAnalysisChartOptions(currentScreenSize, 'mixed').chart,
      id: 'MACD_chart',
      type: 'line',
    },
    plotOptions: {
      ...getAnalysisChartOptions(currentScreenSize, 'mixed').plotOptions,
      bar: {
        ...getAnalysisChartOptions(currentScreenSize, 'mixed').plotOptions?.bar,
        columnWidth: currentScreenSize === 'xs' ? '90%' : '80%',
        colors: {
          ranges: [
            {
              from: -100,
              to: 0,
              color: '#EF4444', // 色盲友善的紅色
            },
            {
              from: 0,
              to: 100,
              color: '#10B981', // 色盲友善的綠色
            },
          ],
        },
      },
    },
    colors: ['#3B82F6', '#F59E0B', '#8B5CF6'], // 色盲友善的顏色組合：藍、橙、紫
    title: currentScreenSize === 'xs' ? undefined : {
      text: 'MACD',
      align: 'left',
      style: {
        color: '#FFFFFF',
        fontSize: currentScreenSize === 'sm' ? '16px' : '18px',
      },
    },
  };

  return (
    <Chart
      options={macdOptions}
      series={series}
      type="line"
      height={indicatorHeight}
    />
  );
};

export default MACDChart;
