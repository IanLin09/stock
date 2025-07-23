'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    t('rsi_signal_buy'),
    t('rsi_signal_sell'),
    t('rsi_signal_divergence'),
  ];

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>
            {t('rsi_full_name')}
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            {t('rsi_description')}
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
          <span className="text-green-500">{t('oversold')}</span>
          <span className="text-gray-500">{t('neutral')}</span>
          <span className="text-red-500">{t('overbought')}</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className={`font-medium ${textSize}`}>{t('technical_data')}</h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>{t('average_gain')}:</span>
              <span>{formatIndicatorValue(data.rsi?.gain, 4)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('average_loss')}:</span>
              <span>{formatIndicatorValue(data.rsi?.loss, 4)}</span>
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
        <div className={`font-medium ${textSize} mb-2`}>{t('current_status')}</div>
        <div className={`${smallTextSize} text-gray-600 dark:text-gray-400`}>
          {status === 'bullish' && (
            <div className="text-green-600">
              {t('rsi_status_bullish')}
            </div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">
              {t('rsi_status_bearish')}
            </div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">
              {t('rsi_status_neutral')}
            </div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">
              {t('rsi_status_extreme')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSIIndicator;
