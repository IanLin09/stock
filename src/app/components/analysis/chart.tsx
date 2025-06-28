'use client';
import { getRangeList, getAnalysisList } from '@/utils/api';
import { StockChartDTO, StockAnalysisDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import CandleStickChart from './candlestckChart';
import VolumeChart from './volumnChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RSIChart from './rsiChart';
import MACDChart from './macdChart';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';

const AnalysisChartGroup = () => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();
  const {
    data: prices,
    isLoading,
    error,
  } = useQuery<StockChartDTO, Error>({
    queryKey: ['chartData', 'QQQ', '3M'],
    queryFn: () => getRangeList('QQQ', '3M'),
  });
  const { data: analysis, isLoading: analysisLoading } = useQuery<
    StockAnalysisDTO[],
    Error
  >({
    queryKey: ['analysisData', 'QQQ', '3M'],
    queryFn: () => getAnalysisList('QQQ', '3M'),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);

  if (isLoading || analysisLoading) return <p>Loading...</p>;

  if (prices && analysis) {
    // 生成響應式類別

    return (
      <div className="h-full flex flex-col space-y-2 text-black dark:text-white p-2">
        {/* 主圖表區域 */}
        <div className="flex-[2] border border-black dark:border-white rounded-lg">
          <CandleStickChart data={prices.data} extra={analysis} />
          <VolumeChart data={prices.data} />
        </div>

        {/* 技術指標區域 */}
        <div className="flex-1 border border-black dark:border-white rounded-lg">
          <Tabs defaultValue="RSI" className="h-full">
            <TabsList
              className={`grid w-full grid-cols-2 ${
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
            </TabsList>
            <TabsContent value="RSI" className="h-full mt-1">
              <RSIChart extra={analysis} />
            </TabsContent>
            <TabsContent value="MACD" className="h-full mt-1">
              <MACDChart data={analysis} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
};

export default AnalysisChartGroup;
