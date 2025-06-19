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

const AnalysisChartGroup = () => {
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
    return (
      <div className="flex flex-col h-full w-full">
        <div className="basis-2/3">
          <CandleStickChart data={prices.data} extra={analysis} />
          <VolumeChart data={prices.data} />
        </div>
        <div className="basis-1/3 pt-4 pl-4 ">
          <Tabs defaultValue="RSI" className="">
            <TabsList>
              <TabsTrigger value="RSI">RSI</TabsTrigger>
              <TabsTrigger value="MACD">MACD</TabsTrigger>
            </TabsList>
            <TabsContent value="RSI">
              <RSIChart extra={analysis} />
            </TabsContent>
            <TabsContent value="MACD">
              <MACDChart data={analysis}></MACDChart>.
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
};

export default AnalysisChartGroup;
