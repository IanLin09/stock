'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    t('macd_signal_golden'),
    t('macd_signal_death'),
    t('macd_signal_divergence'),
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
            {t('macd_full_name')}
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            {t('macd_description')}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {isGoldenCross
              ? t('golden_cross')
              : isDeathCross
                ? t('death_cross')
                : t('neutral')}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {t(getIndicatorStatusDescription('macd', status))}
          </div>
        </div>
      </div>

      {/* MACD 數值顯示 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`font-medium ${smallTextSize} text-gray-600 dark:text-gray-400`}
          >
            {t('macd_dif')}
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
            {t('macd_dea')}
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
            {t('macd_histogram')}
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
        <h4 className={`font-medium ${textSize}`}>{t('histogram_trend')}</h4>
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
          <span>{t('negative')}</span>
          <span>0</span>
          <span>{t('positive')}</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>{t('ema_data')}</h4>
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
            <div className="text-green-600">{t('macd_status_bullish')}</div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">{t('macd_status_bearish')}</div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">{t('macd_status_neutral')}</div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">{t('macd_status_extreme')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MACDIndicator;
