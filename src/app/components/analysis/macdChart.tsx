import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockAnalysisDTO } from '@/utils/dto';

type params = {
  data: StockAnalysisDTO[];
};

type chartData = {
  x: Date;
  y: number;
};

const MACDChart = ({ data }: params) => {
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

  const option: ApexOptions = {
    chart: {
      type: 'bar',
      id: 'MACD_chart',
      toolbar: {
        autoSelected: 'pan',
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    colors: ['#FF6B6B', '#4ECDC4', '#FFFFFF'],
    title: {
      text: `MACD`,
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
    plotOptions: {
      bar: {
        colors: {
          ranges: [
            {
              from: -100,
              to: 0,
              color: '#FF0000',
            },
            {
              from: 0,
              to: 100,
              color: '#00FF00',
            },
          ],
        },
        columnWidth: '80%',
      },
    },
  };

  return (
    <div className="h-[200px] w-full">
      <Chart options={option} series={series} type="line" height="100%"></Chart>
    </div>
  );
};

export default MACDChart;
