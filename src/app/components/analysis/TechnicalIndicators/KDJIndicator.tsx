'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import {
  formatIndicatorValue,
  getIndicatorStatusDescription,
} from '@/utils/indicatorCalculations';

interface KDJIndicatorProps {
  data: StockAnalysisDTO;
  status: IndicatorStatus;
}

const KDJIndicator = ({ data, status }: KDJIndicatorProps) => {
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
  const titleSize = getAnalysisTextSize('lg', currentScreenSize);

  const { k, d, j, rsv } = data.kdj || { k: null, d: null, j: null, rsv: null };

  // 狀態顏色
  const statusColors = {
    bullish: 'text-green-500',
    bearish: 'text-red-500',
    neutral: 'text-gray-500',
    extreme: 'text-orange-500',
  };

  const tradingSignals = [
    'K, D, J < 20: 超賣區間，考慮買入',
    'K, D, J > 80: 超買區間，考慮賣出',
    'K線上穿D線: 金叉買入信號',
    'K線下穿D線: 死叉賣出信號',
  ];

  // 判斷金叉死叉
  const isGoldenCross = k !== null && d !== null && k > d;
  const crossSignal =
    k === null || d === null ? '--' : isGoldenCross ? '金叉' : '死叉';

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>
            KDJ - Stochastic Oscillator
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            隨機振盪器，判斷超買超賣狀態
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {crossSignal}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {getIndicatorStatusDescription('kdj', status)}
          </div>
        </div>
      </div>

      {/* KDJ 數值顯示 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            K
          </div>
          <div
            className={`font-bold ${textSize} ${k !== null && k > 50 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(k)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            D
          </div>
          <div
            className={`font-bold ${textSize} ${d !== null && d > 50 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(d)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            J
          </div>
          <div
            className={`font-bold ${textSize} ${j !== null && j > 50 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(j)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            RSV
          </div>
          <div
            className={`font-bold ${textSize} ${rsv !== null && rsv > 50 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(rsv)}
          </div>
        </div>
      </div>

      {/* KDJ 區間視覺化 */}
      <div className="space-y-3">
        <h4 className={`font-medium ${textSize}`}>KDJ 區間分析</h4>

        {/* K線 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>K線: {formatIndicatorValue(k)}</span>
            <span>超賣 &lt; 20 | 超買 &gt; 80</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="absolute left-0 top-0 h-full w-[20%] bg-green-100 dark:bg-green-900 rounded-l-full opacity-30"></div>
            <div className="absolute right-0 top-0 h-full w-[20%] bg-red-100 dark:bg-red-900 rounded-r-full opacity-30"></div>
            <div
              className="absolute top-0 h-full w-1 bg-blue-500 rounded-full"
              style={{
                left: `${k !== null ? Math.max(0, Math.min(100, k)) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* D線 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>D線: {formatIndicatorValue(d)}</span>
            <span>超賣 &lt; 20 | 超買 &gt; 80</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="absolute left-0 top-0 h-full w-[20%] bg-green-100 dark:bg-green-900 rounded-l-full opacity-30"></div>
            <div className="absolute right-0 top-0 h-full w-[20%] bg-red-100 dark:bg-red-900 rounded-r-full opacity-30"></div>
            <div
              className="absolute top-0 h-full w-1 bg-orange-500 rounded-full"
              style={{
                left: `${d !== null ? Math.max(0, Math.min(100, d)) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* J線 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>J線: {formatIndicatorValue(j)}</span>
            <span>J線可能超出0-100範圍</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="absolute left-0 top-0 h-full w-[20%] bg-green-100 dark:bg-green-900 rounded-l-full opacity-30"></div>
            <div className="absolute right-0 top-0 h-full w-[20%] bg-red-100 dark:bg-red-900 rounded-r-full opacity-30"></div>
            <div
              className="absolute top-0 h-full w-1 bg-purple-500 rounded-full"
              style={{
                left: `${j !== null ? Math.max(0, Math.min(100, j)) : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>技術分析</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>K & D關係:</span>
              <span
                className={isGoldenCross ? 'text-green-500' : 'text-red-500'}
              >
                {isGoldenCross ? 'K > D (金叉)' : 'K < D (死叉)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>整體位置:</span>
              <span>
                {k !== null && d !== null && k < 20 && d < 20
                  ? '超賣區'
                  : k !== null && d !== null && k > 80 && d > 80
                    ? '超買區'
                    : '中性區'}
              </span>
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
              KDJ 指標處於超賣區間（K, D, J 均小於20），股價可能反彈，適合買入。
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              KDJ 指標處於超買區間（K, D, J 均大於80），股價可能回調，建議減倉。
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              KDJ 指標處於中性區間，無明顯超買超賣信號，可觀望等待機會。
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              KDJ 指標處於極端區間，可能出現趨勢反轉，需要密切關注。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KDJIndicator;
