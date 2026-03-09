import React from 'react';
import { render, screen } from '@testing-library/react';
import MeanReversionStrategy from '../MeanReversionStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'mean_reversion',
  action: 'buy',
  signal: 'bullish',
  strength: 85,
  confidence: 'strong',
  riskLevel: 'medium',
  supportingIndicators: ['RSI'],
  conflictingIndicators: [],
  recommendation: 'strategy_rsi_extreme_oversold_reversal',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'RSI', signal: 'extreme', strength: 88, confidence: 'strong', message: 'strategy_rsi_extreme_oversold', reasons: [], direction: 'oversold' },
  { indicator: 'KDJ', signal: 'bullish', strength: 75, confidence: 'moderate', message: 'strategy_kdj_oversold', reasons: [] },
];

describe('MeanReversionStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />)
    ).not.toThrow();
  });

  it('shows RSI strength 88 from real indicators', () => {
    render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />);
    expect(screen.getAllByText(/88/).length).toBeGreaterThan(0);
  });

  it('shows KDJ strength 75 from real indicators', () => {
    render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />);
    expect(screen.getAllByText(/75/).length).toBeGreaterThan(0);
  });
});
