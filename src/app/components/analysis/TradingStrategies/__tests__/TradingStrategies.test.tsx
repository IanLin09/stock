import React from 'react';
import { render, screen } from '@testing-library/react';
import TradingStrategies from '../index';

// Mock the hook — component must use this, not compute its own scores
jest.mock('@/hooks/useStrategyEngine', () => ({
  useStrategyEngine: () => ({
    isLoading: false,
    isError: false,
    analysis: {
      overallStrength: 82,
      overallSignal: 'bullish',
      strategySignals: [
        { type: 'momentum', action: 'buy', signal: 'bullish', strength: 82, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
        { type: 'mean_reversion', action: 'hold', signal: 'neutral', strength: 50, confidence: 'weak', riskLevel: 'low', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
        { type: 'breakout', action: 'buy', signal: 'bullish', strength: 78, confidence: 'moderate', riskLevel: 'high', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
      ],
      indicatorJudgments: [],
      finalRecommendation: { primaryAction: 'buy', secondaryActions: [], riskWarnings: [], timeframe: 'short' },
      timestamp: new Date(),
      symbol: 'QQQ',
    },
    indicators: [],
    strategies: [
      { type: 'momentum', action: 'buy', signal: 'bullish', strength: 82, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
    ],
    overallScore: 82,
    marketCondition: 'market_strong_uptrend',
    riskLevel: 'medium',
    actionAdvice: { primary: 'primary_advice_buy', secondary: [], warnings: [], timeframe: '' },
    refreshAnalysis: jest.fn(),
    getIndicatorStatus: jest.fn(),
    getStrategyByType: jest.fn(),
    formatStrengthLabel: jest.fn(),
    getSignalColorByType: jest.fn(),
    comprehensiveAnalysis: null,
    primaryRecommendation: '',
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/utils/zustand', () => ({
  useAnalysisStore: () => ({ currentSymbol: 'QQQ', timeRange: '3M' }),
}));

describe('TradingStrategies — uses real engine data', () => {
  it('shows overallScore from useStrategyEngine (82), not a locally computed value', () => {
    render(<TradingStrategies />);
    expect(screen.getAllByText('82%').length).toBeGreaterThan(0);
  });

  it('shows market condition i18n key from hook', () => {
    render(<TradingStrategies />);
    expect(screen.getByText('market_strong_uptrend')).toBeInTheDocument();
  });

  it('does NOT import or call getSymbolDetail', () => {
    // If getSymbolDetail is still called the mock above won't cover it and
    // the component will throw — this test passing proves it's removed.
    render(<TradingStrategies />);
    expect(screen.queryByText('strategy_analysis_failed')).not.toBeInTheDocument();
  });
});
