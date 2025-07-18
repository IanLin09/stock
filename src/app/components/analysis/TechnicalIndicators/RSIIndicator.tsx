'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import {
  formatIndicatorValue,
  getIndicatorStatusDescription,
} from '@/utils/indicatorCalculations';

interface RSIIndicatorProps {
  data: StockAnalysisDTO;
  status: IndicatorStatus;
}

const RSIIndicator = ({ data, status }: RSIIndicatorProps) => {
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
  const titleSize = getAnalysisTextSize('lg', currentScreenSize);

  const rsiValue = data.rsi?.[14];
  const rsiPercentage = rsiValue ? (rsiValue / 100) * 100 : 0;

  // 狀態顏色
  const statusColors = {
    bullish: 'text-green-500',
    bearish: 'text-red-500',
    neutral: 'text-gray-500',
    extreme: 'text-orange-500',
  };

  const progressColors = {
    bullish: 'bg-green-500',
    bearish: 'bg-red-500',
    neutral: 'bg-gray-500',
    extreme: 'bg-orange-500',
  };

  const tradingSignals = [
    'RSI < 30: 考慮買入機會',
    'RSI > 70: 考慮減倉',
    'RSI背離: 注意趨勢反轉',
  ];

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>
            RSI (14) - Relative Strength Index
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            相對強弱指數，衡量價格動能強弱
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {formatIndicatorValue(rsiValue)}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {getIndicatorStatusDescription('rsi', status)}
          </div>
        </div>
      </div>

      {/* RSI 進度條 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>30</span>
          <span>70</span>
          <span>100</span>
        </div>
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          {/* 超賣區域 */}
          <div className="absolute left-0 top-0 h-full w-[30%] bg-green-100 dark:bg-green-900 rounded-l-full opacity-30"></div>
          {/* 超買區域 */}
          <div className="absolute right-0 top-0 h-full w-[30%] bg-red-100 dark:bg-red-900 rounded-r-full opacity-30"></div>
          {/* RSI 指標位置 */}
          <div
            className={`absolute top-0 h-full w-1 ${progressColors[status]} rounded-full`}
            style={{ left: `${rsiPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-500">超賣</span>
          <span className="text-gray-500">中性</span>
          <span className="text-red-500">超買</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>技術數據</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>平均漲幅:</span>
              <span>{formatIndicatorValue(data.rsi?.gain, 4)}</span>
            </div>
            <div className="flex justify-between">
              <span>平均跌幅:</span>
              <span>{formatIndicatorValue(data.rsi?.loss, 4)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>交易信號</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            {tradingSignals.map((signal, index) => (
              <div key={index} className="text-gray-600 dark:text-gray-400">
                • {signal}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 狀態說明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className={`font-medium ${textSize} mb-2`}>當前狀況</div>
        <div className={`${smallTextSize} text-gray-600 dark:text-gray-400`}>
          {status === 'bullish' && (
            <div className="text-green-600">
              RSI 處於超賣區間（&lt;30），股價可能出現反彈，建議關注買入機會。
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              RSI 處於超買區間（&gt;70），股價可能出現回調，建議考慮減倉。
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              RSI 處於中性區間（30-70），股價走勢相對穩定，可觀望。
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              RSI 處於極端區間，可能出現趨勢反轉，需要特別注意。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSIIndicator;
