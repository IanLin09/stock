'use client';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockDTO } from '@/utils/dto';
import {
  useAnalysisBreakpoints,
  useChartDimensions,
} from '@/hooks/use-analysis-responsive';
import { getAnalysisChartOptions } from '@/utils/analysis-responsive';

type VolumeChartProps = {
  data: StockDTO[];
};

const VolumeChart = ({ data }: VolumeChartProps) => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const { volumeHeight } = useChartDimensions();

  // 獲取完整的響應式圖表配置
  const barOption: ApexOptions = getAnalysisChartOptions(
    currentScreenSize,
    'volume'
  );
  const VolumeSeries = [
    {
      name: 'volume',
      data: data.map((price) => ({
        x: price.datetime,
        y: price.volume,
      })),
    },
  ];

  return (
    <>
      <Chart
        options={barOption}
        series={VolumeSeries}
        type="bar"
        height={volumeHeight}
      />
    </>
  );
};

export default VolumeChart;
