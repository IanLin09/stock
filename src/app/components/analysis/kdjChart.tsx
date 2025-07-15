import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO } from '@/utils/dto';
import {
  useAnalysisBreakpoints,
  useChartDimensions,
} from '@/hooks/use-analysis-responsive';
import { getAnalysisChartOptions } from '@/utils/analysis-responsive';

type KDJChartProps = {
  data: StockAnalysisDTO[];
};

type chartData = {
  x: Date;
  y: number;
};

const KDJChart = ({ data }: KDJChartProps) => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const { indicatorHeight } = useChartDimensions();

  const kData: chartData[] = [];
  const dData: chartData[] = [];
  const jData: chartData[] = [];

  data
    .filter((item) => item.kdj)
    .map((d) => {
      kData.push({ x: d.datetime, y: d.kdj.k });
      dData.push({ x: d.datetime, y: d.kdj.d });
      jData.push({ x: d.datetime, y: d.kdj.j });
    });

  const series = [
    {
      name: 'K',
      data: kData,
    },
    {
      name: 'D',
      data: dData,
    },
    {
      name: 'J',
      data: jData,
    },
  ];

  // 獲取完整的響應式圖表配置
  const kdjOptions: ApexOptions = {
    ...getAnalysisChartOptions(currentScreenSize, 'line'),
    chart: {
      ...getAnalysisChartOptions(currentScreenSize, 'line').chart,
      id: 'KDJ_chart',
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
          y: 80,
          borderColor: '#ef4444',
          label: {
            style: {
              color: '#ef4444',
              background: 'transparent',
              fontSize: currentScreenSize === 'xs' ? '10px' : '11px',
            },
            position: 'right',
          },
        },
        {
          y: 20,
          borderColor: '#22c55e',
          label: {
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
    colors: ['#3B82F6', '#F59E0B', '#8B5CF6'], // 色盲友善的顏色組合：藍(K)、橙(D)、紫(J)
    title:
      currentScreenSize === 'xs'
        ? undefined
        : {
            text: 'KDJ',
            align: 'left',
            style: {
              color: '#FFFFFF',
              fontSize: currentScreenSize === 'sm' ? '16px' : '18px',
            },
          },
  };

  return (
    <Chart
      options={kdjOptions}
      series={series}
      type="line"
      height={indicatorHeight}
    />
  );
};

export default KDJChart;
