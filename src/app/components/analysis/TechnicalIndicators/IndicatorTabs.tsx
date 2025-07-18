'use client';
import { useAnalysisStore } from '@/utils/zustand';
import { useQuery } from '@tanstack/react-query';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import RSIIndicator from './RSIIndicator';
import MACDIndicator from './MACDIndicator';
import MovingAverageIndicator from './MovingAverageIndicator';
import KDJIndicator from './KDJIndicator';
import BollingerIndicator from './BollingerIndicator';
import { calculateIndicatorStatuses } from '@/utils/indicatorCalculations';

const IndicatorTabs = () => {
  const { currentSymbol } = useAnalysisStore();
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('sm', currentScreenSize);

  const { data: analysisData } = useQuery<AnalysisListDTO, Error>({
    queryKey: ['analysisList', currentSymbol],
    queryFn: () => getSymbolDetail(currentSymbol),
  });

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Loading indicators...
        </div>
      </div>
    );
  }

  const indicatorStatuses = calculateIndicatorStatuses(analysisData.indicators);

  return (
    <div className="h-full">
      <Tabs defaultValue="rsi" className="h-full">
        <TabsList
          className={`grid w-full grid-cols-5 ${
            currentScreenSize === 'xs' ? 'h-8 text-xs' : 'h-10'
          }`}
        >
          <TabsTrigger
            value="rsi"
            className={currentScreenSize === 'xs' ? 'text-xs py-1' : textSize}
          >
            RSI
          </TabsTrigger>
          <TabsTrigger
            value="macd"
            className={currentScreenSize === 'xs' ? 'text-xs py-1' : textSize}
          >
            MACD
          </TabsTrigger>
          <TabsTrigger
            value="ma"
            className={currentScreenSize === 'xs' ? 'text-xs py-1' : textSize}
          >
            MA
          </TabsTrigger>
          <TabsTrigger
            value="kdj"
            className={currentScreenSize === 'xs' ? 'text-xs py-1' : textSize}
          >
            KDJ
          </TabsTrigger>
          <TabsTrigger
            value="bollinger"
            className={currentScreenSize === 'xs' ? 'text-xs py-1' : textSize}
          >
            BB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rsi" className="h-full mt-2">
          <RSIIndicator
            data={analysisData.indicators}
            status={indicatorStatuses.rsi}
          />
        </TabsContent>

        <TabsContent value="macd" className="h-full mt-2">
          <MACDIndicator
            data={analysisData.indicators}
            status={indicatorStatuses.macd}
          />
        </TabsContent>

        <TabsContent value="ma" className="h-full mt-2">
          <MovingAverageIndicator
            data={analysisData.indicators}
            status={indicatorStatuses.ma}
          />
        </TabsContent>

        <TabsContent value="kdj" className="h-full mt-2">
          <KDJIndicator
            data={analysisData.indicators}
            status={indicatorStatuses.kdj}
          />
        </TabsContent>

        <TabsContent value="bollinger" className="h-full mt-2">
          <BollingerIndicator
            data={analysisData.indicators}
            status={indicatorStatuses.bollinger}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndicatorTabs;
