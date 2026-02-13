'use client';
import type { StockAnalysisDTO } from '@/utils/dto';
import { quickAnalyzeStock } from '@/utils/strategySystemController';
import { useMemo } from 'react';

type StrategyDashboardProps = {
  symbol: string;
  analysis: StockAnalysisDTO | null;
};

export default function StrategyDashboard({
  symbol,
  analysis,
}: StrategyDashboardProps) {
  // Compute strategy analysis
  const strategyAnalysis = useMemo(() => {
    if (!analysis) return null;
    return quickAnalyzeStock(analysis, symbol);
  }, [analysis, symbol]);

  if (!analysis || !strategyAnalysis) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-4 text-center text-gray-500"
      >
        Loading strategy analysis...
      </div>
    );
  }

  const {
    action,
    confidence,
    riskLevel,
    overallSignal,
    indicatorJudgments = [],
    strategySignals = [],
    finalRecommendation,
  } = strategyAnalysis;

  // Map action to signal type for coloring
  const getSignalFromAction = (action: string): string => {
    if (action.includes('buy')) return 'bullish';
    if (action.includes('sell')) return 'bearish';
    return 'neutral';
  };

  const signal = getSignalFromAction(action);

  // Determine signal color
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'extreme':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Determine action color
  const getActionColor = (action: string) => {
    if (action.includes('buy')) {
      return 'text-green-700 bg-green-100 border-green-300';
    }
    if (action.includes('sell')) {
      return 'text-red-700 bg-red-100 border-red-300';
    }
    return 'text-blue-700 bg-blue-100 border-blue-300';
  };

  // Calculate convergence count
  const convergenceCount = indicatorJudgments.filter(
    (ind) => ind.signal === overallSignal
  ).length;

  // Get indicator signal color
  const getIndicatorSignalColor = (sig: string) => {
    switch (sig) {
      case 'bullish':
        return 'text-green-600 bg-green-50';
      case 'bearish':
        return 'text-red-600 bg-red-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      case 'extreme':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-700 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Strategy Dashboard</h2>
        <div className="text-sm text-gray-600">Symbol: {symbol}</div>
      </div>

      {/* Signal Summary Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium">Signal Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overall Signal */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Overall Signal</div>
            <div
              className={`px-4 py-2 rounded-md border font-medium text-center ${getSignalColor(signal)}`}
              data-testid="signal-strength"
            >
              {signal.toUpperCase()} ({confidence}%)
            </div>
          </div>

          {/* Recommended Action */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Recommended Action</div>
            <div
              className={`px-4 py-2 rounded-md border font-medium text-center ${getActionColor(action)}`}
              data-testid="primary-action"
            >
              {action.toUpperCase().replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Convergence Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium">Indicator Convergence</h3>

        <div className="space-y-3">
          {/* Convergence Count */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-700">Indicators Agreeing</span>
            <span
              className="font-semibold text-lg"
              data-testid="convergence-count"
            >
              {convergenceCount} / {indicatorJudgments.length}
            </span>
          </div>

          {/* Individual Indicators */}
          <div className="space-y-2" data-testid="indicator-list">
            {indicatorJudgments.map((indicator) => (
              <div
                key={indicator.indicator}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {indicator.indicator}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Strength: {Math.round(indicator.strength)}% | Confidence:{' '}
                    {indicator.confidence}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-md text-xs font-medium ${getIndicatorSignalColor(indicator.signal)}`}
                >
                  {indicator.signal.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Assessment Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium">Risk Assessment</h3>

        <div className="space-y-3">
          {/* Risk Warnings */}
          {finalRecommendation?.riskWarnings &&
            finalRecommendation.riskWarnings.length > 0 && (
              <div
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                data-testid="risk-warnings"
              >
                <div className="text-sm font-medium text-yellow-800 mb-2">
                  Risk Warnings
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {finalRecommendation.riskWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Strategy Signals */}
          <div className="space-y-2" data-testid="strategy-signals-list">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Strategy Signals
            </div>
            {strategySignals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm capitalize">
                    {signal.type.replace('_', ' ')} Strategy
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Action: {signal.action} | Strength:{' '}
                    {Math.round(signal.strength)}%
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-md text-xs font-medium ${getRiskLevelColor(signal.riskLevel)}`}
                >
                  {signal.riskLevel.toUpperCase()} RISK
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
