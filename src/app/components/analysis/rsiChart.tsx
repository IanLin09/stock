import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO } from '@/utils/dto';

type params = {
  extra: StockAnalysisDTO[];
};

const RSIChart = ({ extra }: params) => {
  const series = [
    {
      name: 'RSI',
      data: extra.map((price) => ({
        x: new Date(price.datetime), // or use dayjs/format if needed
        y: Number(price.rsi[14].toFixed(2)), // or any other value like price.high
      })),
    },
  ];

  const option: ApexOptions = {
    chart: {
      type: 'line',
      id: 'RSI_chart',
      toolbar: {
        autoSelected: 'pan',
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    title: {
      text: `RSI`,
      align: 'left',
      style: {
        color: '#FFFFFF',
      },
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
    },
  };

  return (
    <div className="h-[200px] w-full">
      <Chart options={option} series={series} type="line" height="100%"></Chart>
    </div>
  );
};

export default RSIChart;
