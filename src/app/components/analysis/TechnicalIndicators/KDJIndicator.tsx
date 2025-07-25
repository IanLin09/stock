'use client';
import { StockAnalysisDTO, IndicatorStatus } from '@/utils/dto';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    t('kdj_signal_oversold'),
    t('kdj_signal_overbought'),
    t('kdj_signal_golden'),
    t('kdj_signal_death'),
  ];

  // 判斷金叉死叉
  const isGoldenCross = k !== null && d !== null && k > d;
  const crossSignal =
    k === null || d === null
      ? '--'
      : isGoldenCross
        ? t('golden_cross')
        : t('death_cross');

  return (
    <div className="p-4 space-y-4">
      {/* 指標標題和數值 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${titleSize}`}>{t('kdj_full_name')}</h3>
          <p className={`text-gray-600 dark:text-gray-400 ${smallTextSize}`}>
            {t('kdj_description')}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${textSize} ${statusColors[status]}`}>
            {crossSignal}
          </div>
          <div className={`${smallTextSize} text-gray-500`}>
            {t(getIndicatorStatusDescription('kdj', status))}
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
        <h4 className={`font-medium ${textSize}`}>{t('kdj_range_analysis')}</h4>

        {/* K線 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>
              {t('kdj_k_line')}: {formatIndicatorValue(k)}
            </span>
            <span>{t('kdj_oversold_overbought')}</span>
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
            <span>
              {t('kdj_d_line')}: {formatIndicatorValue(d)}
            </span>
            <span>{t('kdj_oversold_overbought')}</span>
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
            <span>
              {t('kdj_j_line')}: {formatIndicatorValue(j)}
            </span>
            <span>{t('kdj_j_range_note')}</span>
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
          <h4 className={`font-medium ${textSize}`}>
            {t('technical_analysis')}
          </h4>
          <div className={`space-y-1 ${smallTextSize}`}>
            <div className="flex justify-between">
              <span>{t('kdj_kd_relationship')}:</span>
              <span
                className={isGoldenCross ? 'text-green-500' : 'text-red-500'}
              >
                {isGoldenCross
                  ? `K > D (${t('golden_cross')})`
                  : `K < D (${t('death_cross')})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('kdj_overall_position')}:</span>
              <span>
                {k !== null && d !== null && k < 20 && d < 20
                  ? t('oversold_zone')
                  : k !== null && d !== null && k > 80 && d > 80
                    ? t('overbought_zone')
                    : t('neutral_zone')}
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
            <div className="text-green-600">{t('kdj_status_bullish')}</div>
          )}
          {status === 'bearish' && (
            <div className="text-red-600">{t('kdj_status_bearish')}</div>
          )}
          {status === 'neutral' && (
            <div className="text-gray-600">{t('kdj_status_neutral')}</div>
          )}
          {status === 'extreme' && (
            <div className="text-orange-600">{t('kdj_status_extreme')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KDJIndicator;
