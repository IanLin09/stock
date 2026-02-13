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

  const { action, confidence, riskLevel } = strategyAnalysis;

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
    </div>
  );
}
