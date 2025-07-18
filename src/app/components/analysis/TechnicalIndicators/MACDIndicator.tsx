'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import {
  formatIndicatorValue,
  getIndicatorStatusDescription,
} from '@/utils/indicatorCalculations';

interface MACDIndicatorProps {
  data: StockAnalysisDTO;
  status: IndicatorStatus;
}

const MACDIndicator = ({ data, status }: MACDIndicatorProps) => {
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
  const titleSize = getAnalysisTextSize('lg', currentScreenSize);

  const { dif, dea, histogram, ema12, ema26 } = data.macd || {
    dif: null,
    dea: null,
    histogram: null,
    ema12: null,
    ema26: null,
  };

  // 狀態顏色
  const statusColors = {
    bullish: 'text-green-500',
    bearish: 'text-red-500',
    neutral: 'text-gray-500',
    extreme: 'text-orange-500',
  };

  const tradingSignals = [
    '金叉(DIF上穿DEA): 買入信號',
    '死叉(DIF下穿DEA): 賣出信號',
    'MACD背離: 趨勢可能反轉',
  ];

  // 判斷金叉死叉
  const isGoldenCross =
    dif !== null &&
    dea !== null &&
    histogram !== null &&
    dif > dea &&
    histogram > 0;
  const isDeathCross =
    dif !== null &&
    dea !== null &&
    histogram !== null &&
    dif < dea &&
    histogram < 0;

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>
            MACD - Moving Average Convergence Divergence
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            趨勢跟踪指標，識別動量變化
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {isGoldenCross ? '金叉' : isDeathCross ? '死叉' : '中性'}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {getIndicatorStatusDescription('macd', status)}
          </div>
        </div>
      </div>

      {/* MACD 數值顯示 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            DIF
          </div>
          <div
            className={`font-bold ${textSize} ${dif !== null && dif > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(dif, 4)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            DEA
          </div>
          <div
            className={`font-bold ${textSize} ${dea !== null && dea > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(dea, 4)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            Histogram
          </div>
          <div
            className={`font-bold ${textSize} ${histogram !== null && histogram > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(histogram, 4)}
          </div>
        </div>
      </div>

      {/* 直方圖視覺化 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>直方圖趨勢</h4>
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded">
          <div className="absolute top-1/2 left-1/2 w-px h-full bg-gray-400 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div
            className={`absolute top-1/2 h-6 rounded transform -translate-y-1/2 ${
              histogram !== null && histogram > 0
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
            style={{
              left:
                histogram !== null && histogram > 0
                  ? '50%'
                  : `${50 + (histogram || 0) * 100}%`,
              width: `${Math.abs(histogram || 0) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>負向</span>
          <span>0</span>
          <span>正向</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>EMA 數據</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>EMA12:</span>
              <span>{formatIndicatorValue(ema12)}</span>
            </div>
            <div className="flex justify-between">
              <span>EMA26:</span>
              <span>{formatIndicatorValue(ema26)}</span>
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
              MACD 呈現金叉信號，DIF 上穿 DEA，且直方圖為正，顯示買入機會。
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              MACD 呈現死叉信號，DIF 下穿 DEA，且直方圖為負，顯示賣出訊號。
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              MACD 處於中性狀態，DIF 和 DEA 接近，趨勢不明確，建議觀望。
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              MACD 顯示強勢信號，直方圖絕對值較大，趨勢可能持續。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MACDIndicator;
