/**
 * 交易策略分析組件主入口 - Mission C 版本
 * Trading Strategies Analysis - wired to useStrategyEngine
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalysisStore } from '@/utils/zustand';
import { useStrategyEngine } from '@/hooks/useStrategyEngine';
import StrategyTabs from './StrategyTabs';
import MomentumStrategy from './MomentumStrategy';
import MeanReversionStrategy from './MeanReversionStrategy';
import BreakoutStrategy from './BreakoutStrategy';

interface TradingStrategiesProps {
  className?: string;
}

// Map primaryAction → i18n advice keys
function buildActionAdvice(primaryAction: string, secondaryActions: string[], riskWarnings: string[]) {
  switch (primaryAction) {
    case 'buy':
      return {
        primary: 'primary_advice_buy',
        secondary: ['secondary_advice_batch_build', 'secondary_advice_stop_loss', ...secondaryActions.slice(0, 1)],
        warnings: ['warning_risk_control', ...riskWarnings.slice(0, 1)],
      };
    case 'sell':
    case 'reduce':
      return {
        primary: 'primary_advice_sell',
        secondary: ['secondary_advice_batch_reduce', 'secondary_advice_watch_support', ...secondaryActions.slice(0, 1)],
        warnings: ['warning_no_panic', ...riskWarnings.slice(0, 1)],
      };
    default:
      return {
        primary: 'primary_advice_hold',
        secondary: ['secondary_advice_wait_signal', 'secondary_advice_watch_technical'],
        warnings: ['warning_no_frequent'],
      };
  }
}

const TradingStrategies: React.FC<TradingStrategiesProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { currentSymbol, timeRange } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<'momentum' | 'mean_reversion' | 'breakout' | 'risk' | 'advice'>('momentum');

  const { analysis, indicators, strategies, overallScore, marketCondition, riskLevel, isLoading, isError } =
    useStrategyEngine({ symbol: currentSymbol, timeRange });

  const actionAdvice = useMemo(() => {
    if (!analysis) return { primary: 'primary_advice_hold', secondary: [], warnings: [] };
    const { primaryAction, secondaryActions, riskWarnings } = analysis.finalRecommendation;
    return buildActionAdvice(primaryAction, secondaryActions, riskWarnings);
  }, [analysis]);

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
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

  const activeStrategy = strategies.find((s) => s.type === activeTab) || null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('strategy_analysis')}
          </h3>
          <div className="flex items-center space-x-2">
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

      {/* Tab navigation — uses real strategy strengths from engine */}
      <StrategyTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        strategies={strategies}
      />

      {/* Active tab content */}
      <div className="p-3">
        {activeTab === 'momentum' && activeStrategy && (
          <MomentumStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'mean_reversion' && activeStrategy && (
          <MeanReversionStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'breakout' && activeStrategy && (
          <BreakoutStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'risk' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t('risk_level')}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  riskLevel === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : riskLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {t(riskLevel === 'high' ? 'high_risk' : riskLevel === 'medium' ? 'medium_risk' : 'low_risk')}
              </span>
            </div>
          </div>
        )}
        {activeTab === 'advice' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t('trading_advice')}: {t(actionAdvice.primary)}
            </div>
            {actionAdvice.secondary.map((advice, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {t(advice)}
              </div>
            ))}
            {actionAdvice.warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                {t(w)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingStrategies;
