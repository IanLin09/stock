import { useState } from 'react';
import AnalysisChartGroup from '@/components/analysis/chart';
import AnalysisList from '@/components/analysis/list';

const AnalysisChart = () => {
  return (
    <div className="h-full flex flex-rows  text-black dark:text-white p-4">
      <div className="basis-4/5 border border-black dark:border-white">
        <AnalysisChartGroup />
      </div>
      <div className="basis-1/5 col-span-2 border border-black dark:border-white">
        <AnalysisList />
      </div>
    </div>
  );
};

export default AnalysisChart;
