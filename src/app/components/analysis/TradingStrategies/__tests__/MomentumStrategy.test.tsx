import React from 'react';
import { render, screen } from '@testing-library/react';
import MomentumStrategy from '../MomentumStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'momentum',
  action: 'buy',
  signal: 'bullish',
  strength: 78,
  confidence: 'strong',
  riskLevel: 'medium',
  supportingIndicators: ['RSI', 'MACD'],
  conflictingIndicators: [],
  recommendation: 'strategy_momentum_multiple_bullish',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'RSI', signal: 'bullish', strength: 72, confidence: 'moderate', message: 'strategy_rsi_overbought_zone', reasons: [], direction: 'overbought' },
  { indicator: 'MACD', signal: 'bullish', strength: 80, confidence: 'strong', message: 'strategy_macd_golden_cross', reasons: [] },
  { indicator: 'MA', signal: 'bullish', strength: 65, confidence: 'moderate', message: 'strategy_ma_above', reasons: [] },
];

describe('MomentumStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />)
    ).not.toThrow();
  });

  it('shows RSI signal from indicators array, not hardcoded', () => {
    render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />);
    // RSI signal 'bullish' at strength 72 should show — not a constant 'neutral'
    expect(screen.getAllByText(/72/).length).toBeGreaterThan(0);
  });

  it('shows MACD signal strength from indicators array', () => {
    render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />);
    expect(screen.getAllByText(/80/).length).toBeGreaterThan(0);
  });
});
