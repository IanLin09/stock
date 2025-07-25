'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    t('ma_signal_above'),
    t('ma_signal_below'),
    t('ma_signal_cross'),
  ];

  // 判斷價格與均線關係
  const isAboveMA = currentPrice && ma20 && currentPrice > ma20;
  const priceMARelation =
    currentPrice && ma20
      ? currentPrice > ma20
        ? t('above')
        : t('below')
      : '--';

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>{t('ma_full_name')}</h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            {t('ma_description')}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {priceMARelation}MA20
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {t(getIndicatorStatusDescription('ma', status))}
          </div>
        </div>
      </div>

      {/* 價格與均線比較 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('ma_current_price')}
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
            {t('deviation')}
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
        <h4 className={`font-medium ${textSize}`}>{t('price_deviation')}</h4>
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
          <span>{t('below_average')}</span>
          <span>MA20</span>
          <span>{t('above_average')}</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>{t('average_data')}</h4>
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
              <span>{t('current_price')}:</span>
              <span>{formatIndicatorValue(currentPrice)}</span>
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

      {/* 趨勢分析 */}
      <div className="space-y-2">
        <h4 className={`font-medium ${textSize}`}>{t('trend_analysis')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`p-2 rounded ${ema5 > ma20 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
          >
            <div className={`${smallTextSize} text-center`}>
              <div className="font-medium">{t('short_term_trend')}</div>
              <div className={ema5 > ma20 ? 'text-green-600' : 'text-red-600'}>
                {ema5 > ma20 ? t('upward') : t('downward')}
              </div>
            </div>
          </div>
          <div
            className={`p-2 rounded ${currentPrice > ma20 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
          >
            <div className={`${smallTextSize} text-center`}>
              <div className="font-medium">{t('medium_term_trend')}</div>
              <div
                className={
                  currentPrice > ma20 ? 'text-green-600' : 'text-red-600'
                }
              >
                {currentPrice > ma20 ? t('upward') : t('downward')}
              </div>
            </div>
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
            <div className="text-green-600">{t('ma_status_bullish')}</div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">{t('ma_status_bearish')}</div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">{t('ma_status_neutral')}</div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">{t('ma_status_extreme')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovingAverageIndicator;
