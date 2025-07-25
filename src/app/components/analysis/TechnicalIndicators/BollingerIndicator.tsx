'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    t('bb_signal_lower'),
    t('bb_signal_upper'),
    t('bb_signal_squeeze'),
    t('bb_signal_expansion'),
  ];

  // 判斷價格位置
  const getPricePosition = () => {
    if (!currentPrice || !upper || !lower || !middle) return '--';
    if (currentPrice <= lower) return t('lower_band');
    if (currentPrice >= upper) return t('upper_band');
    if (Math.abs(currentPrice - middle) < (upper - lower) * 0.1)
      return t('middle_band');
    return currentPrice > middle ? t('upper_half') : t('lower_half');
  };

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>
            {t('bollinger_full_name')}
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            {t('bollinger_description')}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {getPricePosition()}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {t(getIndicatorStatusDescription('bollinger', status))}
          </div>
        </div>
      </div>

      {/* 布林帶數值顯示 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('upper_band')}
          </div>
          <div className={`font-bold ${textSize} text-red-500`}>
            {formatIndicatorValue(upper)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('middle_band')}
          </div>
          <div className={`font-bold ${textSize} text-blue-500`}>
            {formatIndicatorValue(middle)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('lower_band')}
          </div>
          <div className={`font-bold ${textSize} text-green-500`}>
            {formatIndicatorValue(lower)}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('current_price')}
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
        <h4 className={`font-medium ${textSize}`}>
          {t('bb_price_position_analysis')}
        </h4>
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
          <span>{t('bb_lower_support')}</span>
          <span>{t('bb_middle_average')}</span>
          <span>{t('bb_upper_resistance')}</span>
        </div>
      </div>

      {/* 帶寬分析 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>
          {t('bb_bandwidth_analysis')}
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${smallTextSize} text-gray-600 dark:text-gray-400`}
            >
              {t('bb_bandwidth_percentage')}:
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
            <span>{t('bb_squeeze')}</span>
            <span>{t('bb_normal')}</span>
            <span>{t('bb_expansion')}</span>
          </div>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>
            {t('technical_analysis')}
          </h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>{t('price_position')}:</span>
              <span>{formatIndicatorValue(pricePosition)}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('bandwidth')}:</span>
              <span>{formatIndicatorValue(bandWidth)}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('bb_volatility')}:</span>
              <span>
                {bandWidth < 5
                  ? t('bb_low')
                  : bandWidth > 15
                    ? t('bb_high')
                    : t('bb_medium')}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>{t('trading_signals')}</h4>
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
        <div className={`font-medium ${textSize} mb-2`}>
          {t('current_status')}
        </div>
        <div className={`${smallTextSize} text-gray-600 dark:text-gray-400`}>
          {status === 'bullish' && (
            <div className="text-green-600">{t('bb_status_bullish')}</div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">{t('bb_status_bearish')}</div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">{t('bb_status_neutral')}</div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">{t('bb_status_extreme')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BollingerIndicator;
