'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisTextSize } from '@/utils/analysis-responsive';
import {
  formatIndicatorValue,
  getIndicatorStatusDescription,
} from '@/utils/indicatorCalculations';

interface MovingAverageIndicatorProps {
  data: StockAnalysisDTO;
  status: IndicatorStatus;
}

const MovingAverageIndicator = ({
  data,
  status,
}: MovingAverageIndicatorProps) => {
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const smallTextSize = getAnalysisTextSize('sm', currentScreenSize);
  const titleSize = getAnalysisTextSize('lg', currentScreenSize);

  const currentPrice = data.close;
  const ma20 = data.ma?.[20];
  const ema5 = data.ema?.[5];
  const deviation =
    ma20 && currentPrice ? ((currentPrice - ma20) / ma20) * 100 : 0;

  // 狀態顏色
  const statusColors = {
    bullish: 'text-green-500',
    bearish: 'text-red-500',
    neutral: 'text-gray-500',
    extreme: 'text-orange-500',
  };

  const tradingSignals = [
    '價格高於MA20: 短期看漲',
    '價格低於MA20: 短期看跌',
    'MA排列: 判斷長期趨勢',
  ];

  // 判斷價格與均線關係
  const isAboveMA = currentPrice && ma20 && currentPrice > ma20;
  const priceMARelation =
    currentPrice && ma20 ? (currentPrice > ma20 ? '高於' : '低於') : '--';

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>MA - Moving Average</h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            平滑價格波動，識別趨勢方向
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {priceMARelation}MA20
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {getIndicatorStatusDescription('ma', status)}
          </div>
        </div>
      </div>

      {/* 價格與均線比較 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            當前價格
          </div>
          <div
            className={`font-bold ${textSize} ${isAboveMA ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(currentPrice)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            MA20
          </div>
          <div className={`font-bold ${textSize} text-blue-500`}>
            {formatIndicatorValue(ma20)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            偏離度
          </div>
          <div
            className={`font-bold ${textSize} ${deviation > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatIndicatorValue(deviation, 2)}%
          </div>
        </div>
      </div>

      {/* 偏離度視覺化 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>價格偏離度</h4>
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded">
          <div className="absolute top-1/2 left-1/2 w-px h-full bg-gray-400 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div
            className={`absolute top-1/2 h-6 rounded transform -translate-y-1/2 ${
              deviation > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              left: deviation > 0 ? '50%' : `${50 + deviation * 2}%`,
              width: `${Math.abs(deviation) * 2}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>低於均線</span>
          <span>MA20</span>
          <span>高於均線</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>均線數據</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>EMA5:</span>
              <span>{formatIndicatorValue(ema5)}</span>
            </div>
            <div className="flex justify-between">
              <span>MA20:</span>
              <span>{formatIndicatorValue(ma20)}</span>
            </div>
            <div className="flex justify-between">
              <span>當前價:</span>
              <span>{formatIndicatorValue(currentPrice)}</span>
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

      {/* 趨勢分析 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>趨勢分析</h4>
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`p-2 rounded ${ema5 > ma20 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
          >
            <div className={`${smallTextSize} text-center`}>
              <div className="font-medium">短期趨勢</div>
              <div className={ema5 > ma20 ? 'text-green-600' : 'text-red-600'}>
                {ema5 > ma20 ? '向上' : '向下'}
              </div>
            </div>
          </div>
          <div
            className={`p-2 rounded ${currentPrice > ma20 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
          >
            <div className={`${smallTextSize} text-center`}>
              <div className="font-medium">中期趨勢</div>
              <div
                className={
                  currentPrice > ma20 ? 'text-green-600' : 'text-red-600'
                }
              >
                {currentPrice > ma20 ? '向上' : '向下'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 狀態說明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className={`font-medium ${textSize} mb-2`}>當前狀況</div>
        <div className={`${smallTextSize} text-gray-600 dark:text-gray-400`}>
          {status === 'bullish' && (
            <div className="text-green-600">
              價格高於MA20且偏離度超過5%，顯示短期看漲趨勢，建議關注做多機會。
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              價格低於MA20且偏離度超過-5%，顯示短期看跌趨勢，建議考慮減倉。
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              價格接近MA20，偏離度在正負5%內，趨勢不明確，建議觀望。
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              價格偏離MA20超過10%，可能出現回歸均線的走勢，需要謹慎操作。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovingAverageIndicator;
