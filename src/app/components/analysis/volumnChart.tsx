import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { StockDTO } from '@/utils/dto';

type params = {
  data: StockDTO[];
};

const VolumeChart = ({ data }: params) => {
  const VolumeSeries = [
    {
      name: 'volume',
      data: data.map((price) => ({
        x: price.datetime, // or use dayjs/format if needed
        y: price.volume, // or any other value like price.high
      })),
    },
  ];

  const barOption: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        distributed: true, // needed to allow individual bar colors
      },
    },
    colors: ['#737a75'],
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    tooltip: { enabled: false },
  };

  return (
    <Chart
      options={barOption}
      series={VolumeSeries}
      type="bar"
      height="5%"
    ></Chart>
  );
};

export default VolumeChart;
