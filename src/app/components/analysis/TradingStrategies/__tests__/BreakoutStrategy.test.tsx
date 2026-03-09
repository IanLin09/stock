import React from 'react';
import { render, screen } from '@testing-library/react';
import BreakoutStrategy from '../BreakoutStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'breakout',
  action: 'buy',
  signal: 'bullish',
  strength: 77,
  confidence: 'strong',
  riskLevel: 'high',
  supportingIndicators: ['MACD', 'MA'],
  conflictingIndicators: [],
  recommendation: 'strategy_macd_strong_golden_breakout',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'MACD', signal: 'bullish', strength: 82, confidence: 'strong', message: 'strategy_macd_golden_cross', reasons: [] },
  { indicator: 'MA', signal: 'bullish', strength: 68, confidence: 'moderate', message: 'strategy_ma_above', reasons: [] },
];

describe('BreakoutStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />)
    ).not.toThrow();
  });

  it('shows MACD strength 82 from real indicators', () => {
    render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />);
    expect(screen.getAllByText(/82/).length).toBeGreaterThan(0);
  });

  it('shows MA strength 68 from real indicators', () => {
    render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />);
    expect(screen.getAllByText(/68/).length).toBeGreaterThan(0);
  });
});
