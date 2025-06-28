import AnalysisChartGroup from '@/components/analysis/chart';
import AnalysisList from '@/components/analysis/list';
export const dynamic = 'force-dynamic';

const AnalysisChart = () => {
  return (
    <div className="h-full flex flex-row text-black dark:text-white p-2">
      <div className="basis-3/4 border border-black dark:border-white">
        <AnalysisChartGroup />
      </div>
      <div className="basis-1/4 border border-black dark:border-white">
        <AnalysisList />
      </div>
    </div>
  );
};

export default AnalysisChart;
