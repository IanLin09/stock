'use client';
import { getRangeList, getAnalysisList } from '@/utils/api';
import { StockChartDTO, StockAnalysisDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import CandleStickChart from './candlestckChart';
import VolumeChart from './volumnChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RSIChart from './rsiChart';
import MACDChart from './macdChart';
import KDJChart from './kdjChart';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { useAnalysisStore } from '@/utils/zustand';

const AnalysisChartGroup = () => {
  // 狀態管理
  const { currentSymbol, timeRange } = useAnalysisStore();

  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  
  const {
    data: prices,
    isLoading,
    error,
  } = useQuery<StockChartDTO, Error>({
    queryKey: ['chartData', currentSymbol, timeRange],
    queryFn: () => getRangeList(currentSymbol, timeRange),
  });
  
  const { data: analysis, isLoading: analysisLoading } = useQuery<
    StockAnalysisDTO[],
    Error
  >({
    queryKey: ['analysisData', currentSymbol, timeRange],
    queryFn: () => getAnalysisList(currentSymbol, timeRange),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);

  // 調試：檢查數據
  useEffect(() => {
    if (analysis) {
      console.log('Analysis data:', analysis);
      console.log('Analysis length:', analysis.length);
    }
  }, [analysis]);

  if (isLoading || analysisLoading) return <p>Loading...</p>;

  if (prices && analysis) {
    return (
      <div className="h-full flex flex-col gap-2 text-black dark:text-white p-2">
        {/* 主圖表區域 */}
        <div className="flex-[2] min-h-0 border border-black dark:border-white rounded-lg flex flex-col">
          <div className="flex-1 min-h-0">
            <CandleStickChart data={prices.data} extra={analysis} />
          </div>
          <div className="h-16">
            <VolumeChart data={prices.data} />
          </div>
        </div>

        {/* 技術指標區域 - 修正高度問題 */}
        <div className="flex-1 min-h-0 border border-black dark:border-white rounded-lg">
          <Tabs defaultValue="RSI" className="h-full flex flex-col">
            <TabsList
              className={`grid w-full grid-cols-3 flex-shrink-0 ${
                currentScreenSize === 'xs' ? 'h-8 text-xs' : 'h-10'
              }`}
            >
              <TabsTrigger
                value="RSI"
                className={currentScreenSize === 'xs' ? 'text-xs py-1' : ''}
              >
                RSI
              </TabsTrigger>
              <TabsTrigger
                value="MACD"
                className={currentScreenSize === 'xs' ? 'text-xs py-1' : ''}
              >
                MACD
              </TabsTrigger>
              <TabsTrigger
                value="KDJ"
                className={currentScreenSize === 'xs' ? 'text-xs py-1' : ''}
              >
                KDJ
              </TabsTrigger>
            </TabsList>
            
            {/* 修正 TabsContent 高度 */}
            <div className="flex-1 min-h-0">
              <TabsContent value="RSI" className="h-full m-0 p-2">
                <div className="h-full">
                  <RSIChart extra={analysis} />
                </div>
              </TabsContent>
              <TabsContent value="MACD" className="h-full m-0 p-2">
                <div className="h-full">
                  <MACDChart data={analysis} />
                </div>
              </TabsContent>
              <TabsContent value="KDJ" className="h-full m-0 p-2">
                <div className="h-full">
                  <KDJChart data={analysis} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // 如果沒有數據，顯示錯誤信息
  return (
    <div className="h-full flex items-center justify-center">
      <p>No data available</p>
    </div>
  );
};

export default AnalysisChartGroup;