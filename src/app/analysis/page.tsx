import AnalysisChartGroup from '@/components/analysis/chart';
import AnalysisList from '@/components/analysis/list';
export const dynamic = 'force-dynamic';

const AnalysisChart = () => {
  return (
    <div className="h-full flex flex-row text-black dark:text-white p-2 gap-2">
      {/* 左側圖表區域 - 移除 overflow-hidden，改用 min-w-0 */}
      <div className="basis-2/3 min-w-0 border border-black dark:border-white rounded-lg">
        <AnalysisChartGroup />
      </div>
      {/* 右側列表區域 */}
      <div className="basis-1/3 min-w-0 border border-black dark:border-white rounded-lg p-2">
        <AnalysisList />
      </div>
    </div>
  );
};

export default AnalysisChart;