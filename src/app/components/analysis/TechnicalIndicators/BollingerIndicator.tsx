'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import {
  formatIndicatorValue,
  getIndicatorStatusDescription,
} from '@/utils/indicatorCalculations';

interface BollingerIndicatorProps {
  data: StockAnalysisDTO;
  status: IndicatorStatus;
}

const BollingerIndicator = ({ data, status }: BollingerIndicatorProps) => {
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
  const titleSize = getAnalysisTextSize('lg', currentScreenSize);

  const { upper, middle, lower } = data.bollinger || {
    upper: null,
    middle: null,
    lower: null,
  };
  const currentPrice = data.close;
  const bandWidth =
    upper && lower && middle ? ((upper - lower) / middle) * 100 : 0;
  const pricePosition =
    currentPrice && upper && lower
      ? ((currentPrice - lower) / (upper - lower)) * 100
      : 0;

  // 狀態顏色
  const statusColors = {
    bullish: 'text-green-500',
    bearish: 'text-red-500',
    neutral: 'text-gray-500',
    extreme: 'text-orange-500',
  };

  const tradingSignals = [
    '觸及下軌: 支撐強勁，考慮買入',
    '觸及上軌: 壓力較大，考慮減倉',
    '帶寬收窄: 變盤在即，準備突破',
    '帶寬擴張: 趨勢強化，跟隨操作',
  ];

  // 判斷價格位置
  const getPricePosition = () => {
    if (!currentPrice || !upper || !lower || !middle) return '--';
    if (currentPrice <= lower) return '下軌';
    if (currentPrice >= upper) return '上軌';
    if (Math.abs(currentPrice - middle) < (upper - lower) * 0.1) return '中軌';
    return currentPrice > middle ? '上半部' : '下半部';
  };

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>BB - Bollinger Bands</h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            布林帶，判斷支撐壓力和波動性
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {getPricePosition()}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {getIndicatorStatusDescription('bollinger', status)}
          </div>
        </div>
      </div>

      {/* 布林帶數值顯示 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            上軌
          </div>
          <div className={`font-bold ${textSize} text-red-500`}>
            {formatIndicatorValue(upper)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            中軌
          </div>
          <div className={`font-bold ${textSize} text-blue-500`}>
            {formatIndicatorValue(middle)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            下軌
          </div>
          <div className={`font-bold ${textSize} text-green-500`}>
            {formatIndicatorValue(lower)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            當前價
          </div>
          <div
            className={`font-bold ${textSize} ${currentPrice && middle && currentPrice > middle ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(currentPrice)}
          </div>
        </div>
      </div>

      {/* 布林帶視覺化 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>價格位置分析</h4>
        <div className="relative h-8 bg-gradient-to-r from-green-200 via-blue-200 to-red-200 dark:from-green-800 dark:via-blue-800 dark:to-red-800 rounded-lg">
          {/* 上軌 */}
          <div className="absolute top-0 right-0 h-full w-1 bg-red-500 rounded-r-lg"></div>
          {/* 中軌 */}
          <div className="absolute top-0 left-1/2 h-full w-1 bg-blue-500 transform -translate-x-1/2"></div>
          {/* 下軌 */}
          <div className="absolute top-0 left-0 h-full w-1 bg-green-500 rounded-l-lg"></div>
          {/* 當前價格位置 */}
          <div
            className="absolute top-0 h-full w-2 bg-black dark:bg-white rounded-full opacity-80"
            style={{ left: `${Math.max(0, Math.min(100, pricePosition))}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>下軌 (支撐)</span>
          <span>中軌 (均線)</span>
          <span>上軌 (壓力)</span>
        </div>
      </div>

      {/* 帶寬分析 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>帶寬分析</h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${smallTextSize} text-gray-600 dark:text-gray-400`}
            >
              帶寬百分比:
            </span>
            <span className={`font-bold ${textSize}`}>
              {formatIndicatorValue(bandWidth)}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className={`absolute top-0 left-0 h-full rounded-full ${
                bandWidth < 5
                  ? 'bg-orange-500'
                  : bandWidth > 15
                    ? 'bg-purple-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(bandWidth * 5, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>收窄 (&lt;5%)</span>
            <span>正常 (5-15%)</span>
            <span>擴張 (&gt;15%)</span>
          </div>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>技術分析</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>價格位置:</span>
              <span>{formatIndicatorValue(pricePosition)}%</span>
            </div>
            <div className="flex justify-between">
              <span>帶寬:</span>
              <span>{formatIndicatorValue(bandWidth)}%</span>
            </div>
            <div className="flex justify-between">
              <span>波動性:</span>
              <span>{bandWidth < 5 ? '低' : bandWidth > 15 ? '高' : '中'}</span>
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
              價格觸及或接近下軌，支撐強勁，可能出現反彈，適合考慮買入。
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              價格觸及或接近上軌，壓力較大，可能出現回調，建議考慮減倉。
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              價格在中軌附近波動，無明顯支撐或壓力，可觀望等待突破。
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              帶寬收窄至低位，市場可能醞釀變盤，需要密切關注突破方向。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BollingerIndicator;
