/**
 * 交易策略分析組件主入口 - Phase 3-3 版本
 * Trading Strategies Analysis Components Entry Point - Phase 3.3 Version
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getSymbolDetail } from '@/utils/api';
import { AnalysisListDTO } from '@/utils/dto';
import { useAnalysisStore } from '@/utils/zustand';

interface TradingStrategiesProps {
  className?: string;
}

// Phase 3-3 基礎策略分析邏輯
const analyzeStrategies = (data: AnalysisListDTO) => {
  const indicators = data.indicators || {};

  // 動量策略分析
  const rsi = indicators.rsi?.[14] || 50;
  const macdDif = indicators.macd?.dif || 0;
  const macdDea = indicators.macd?.dea || 0;

  const momentumScore = calculateMomentumScore(rsi, macdDif, macdDea);
  const meanReversionScore = calculateMeanReversionScore(
    rsi,
    indicators.ma?.[20] || 0,
    indicators.close || 0
  );
  const breakoutScore = calculateBreakoutScore(indicators);

  // 綜合評分
  const overallScore = Math.round(
    (momentumScore + meanReversionScore + breakoutScore) / 3
  );

  // 市場狀況判斷
  const marketCondition = determineMarketCondition(rsi, macdDif, macdDea);

  // 風險評估
  const riskLevel = assessRiskLevel(overallScore, rsi);

  // 操作建議
  const actionAdvice = generateActionAdvice(overallScore);

  return {
    strategies: [
      {
        type: 'momentum',
        score: momentumScore,
        signal:
          momentumScore > 60 ? 'buy' : momentumScore < 40 ? 'sell' : 'hold',
      },
      {
        type: 'mean_reversion',
        score: meanReversionScore,
        signal:
          meanReversionScore > 60
            ? 'buy'
            : meanReversionScore < 40
              ? 'sell'
              : 'hold',
      },
      {
        type: 'breakout',
        score: breakoutScore,
        signal:
          breakoutScore > 60 ? 'buy' : breakoutScore < 40 ? 'sell' : 'hold',
      },
    ],
    overallScore,
    marketCondition,
    riskLevel,
    actionAdvice,
  };
};

// 策略評分計算函數
const calculateMomentumScore = (
  rsi: number,
  macdDif: number,
  macdDea: number
): number => {
  let score = 50; // 基礎分數

  // RSI 動量評估
  if (rsi > 70)
    score += 20; // 強勢
  else if (rsi > 60)
    score += 10; // 偏強
  else if (rsi < 30)
    score -= 20; // 超跌
  else if (rsi < 40) score -= 10; // 偏弱

  // MACD 動量評估
  if (macdDif > macdDea)
    score += 15; // 金叉
  else score -= 15; // 死叉

  return Math.max(0, Math.min(100, score));
};

const calculateMeanReversionScore = (
  rsi: number,
  ma20: number,
  close: number
): number => {
  let score = 50;

  // RSI 均值回歸
  if (rsi < 30)
    score += 25; // 超跌反彈機會
  else if (rsi > 70) score -= 25; // 超買回調風險

  // 價格與均線偏離
  if (ma20 > 0) {
    const deviation = ((close - ma20) / ma20) * 100;
    if (Math.abs(deviation) > 5) {
      score += deviation < 0 ? 15 : -15; // 偏離過大，反轉機會
    }
  }

  return Math.max(0, Math.min(100, score));
};

const calculateBreakoutScore = (indicators: any): number => {
  let score = 50;

  // 簡化的突破評估
  const rsi = indicators.rsi?.[14] || 50;
  const volume = indicators.volume || 0;

  if (rsi > 60 && volume > 1000000)
    score += 20; // 向上突破
  else if (rsi < 40 && volume > 1000000) score -= 20; // 向下突破

  return Math.max(0, Math.min(100, score));
};

const determineMarketCondition = (
  rsi: number,
  macdDif: number,
  macdDea: number
): string => {
  if (rsi > 70 && macdDif > macdDea) return 'market_strong_uptrend';
  if (rsi < 30 && macdDif < macdDea) return 'market_strong_downtrend';
  if (rsi > 50 && macdDif > macdDea) return 'market_moderate_uptrend';
  if (rsi < 50 && macdDif < macdDea) return 'market_moderate_downtrend';
  return 'market_sideways';
};

const assessRiskLevel = (
  score: number,
  rsi: number
): 'low' | 'medium' | 'high' => {
  if (rsi > 80 || rsi < 20) return 'high'; // 極端水平
  if (score > 70 || score < 30) return 'medium'; // 強烈信號
  return 'low'; // 溫和信號
};

const generateActionAdvice = (score: number) => {
  const advice = {
    primary: 'primary_advice_hold',
    secondary: [] as string[],
    warnings: [] as string[],
    timeframe: 'short_term',
  };

  if (score > 70) {
    advice.primary = 'primary_advice_buy';
    advice.secondary = [
      'secondary_advice_batch_build',
      'secondary_advice_stop_loss',
    ];
    advice.warnings = ['warning_risk_control'];
  } else if (score < 30) {
    advice.primary = 'primary_advice_sell';
    advice.secondary = [
      'secondary_advice_batch_reduce',
      'secondary_advice_watch_support',
    ];
    advice.warnings = ['warning_no_panic'];
  } else {
    advice.secondary = [
      'secondary_advice_wait_signal',
      'secondary_advice_watch_technical',
    ];
    advice.warnings = ['warning_no_frequent'];
  }

  return advice;
};

const TradingStrategies: React.FC<TradingStrategiesProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
  const { currentSymbol } = useAnalysisStore();

  // 獲取數據
  const {
    data: info,
    isLoading,
    isError,
  } = useQuery<AnalysisListDTO, Error>({
    queryKey: ['analysisList', currentSymbol],
    queryFn: () => getSymbolDetail(currentSymbol),
  });

  // 策略分析
  const analysis = info ? analyzeStrategies(info) : null;

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-500 dark:text-red-400 text-center">
          <p className="text-sm font-medium">{t('strategy_analysis_failed')}</p>
          <p className="text-xs mt-1">{t('check_network')}</p>
        </div>
      </div>
    );
  }

  const { strategies, overallScore, marketCondition, riskLevel, actionAdvice } =
    analysis;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* 標題區域 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('strategy_analysis')}
          </h3>
          <div className="flex items-center space-x-2">
            {/* 市場狀況 */}
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                marketCondition.includes('uptrend')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : marketCondition.includes('downtrend')
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {t(marketCondition)}
            </span>

            {/* 評分 */}
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                overallScore >= 70
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : overallScore >= 50
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {overallScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 策略評分區域 */}
      <div className="p-3">
        <div className="space-y-3">
          {/* 各策略評分 */}
          <div className="grid grid-cols-1 gap-2">
            {strategies.map((strategy) => (
              <div
                key={strategy.type}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t(
                      strategy.type === 'momentum'
                        ? 'momentum_strategy'
                        : strategy.type === 'mean_reversion'
                          ? 'mean_reversion_strategy'
                          : 'breakout_strategy'
                    )}
                  </span>
                  <span
                    className={`text-xs px-1 py-0.5 rounded ${
                      strategy.signal === 'buy'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : strategy.signal === 'sell'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {t(
                      strategy.signal === 'buy'
                        ? 'buy_signal'
                        : strategy.signal === 'sell'
                          ? 'sell_signal'
                          : 'hold_signal'
                    )}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {strategy.score}%
                </div>
              </div>
            ))}
          </div>

          {/* 風險評估 */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t('risk_level')}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                riskLevel === 'high'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {t(
                riskLevel === 'high'
                  ? 'high_risk'
                  : riskLevel === 'medium'
                    ? 'medium_risk'
                    : 'low_risk'
              )}
            </span>
          </div>

          {/* 操作建議 */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('trading_advice')}: {t(actionAdvice.primary)}
            </div>

            {actionAdvice.secondary.length > 0 && (
              <div className="space-y-1">
                {actionAdvice.secondary.map((advice, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-300 flex items-center"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {t(advice)}
                  </div>
                ))}
              </div>
            )}

            {actionAdvice.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {actionAdvice.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="text-xs text-amber-600 dark:text-amber-400 flex items-center"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                    {t(warning)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingStrategies;
