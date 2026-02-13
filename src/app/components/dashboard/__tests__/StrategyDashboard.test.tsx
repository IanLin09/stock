import { render, screen } from '@testing-library/react';
import StrategyDashboard from '../StrategyDashboard';
import type { StockAnalysisDTO } from '@/utils/dto';

// Mock StrategyEngine
jest.mock('../../../utils/strategyEngine', () => ({
  StrategyEngine: {
    performCompleteAnalysis: jest.fn(() => ({
      symbol: 'QQQ',
      timestamp: new Date('2025-02-12'),
      overallSignal: 'bullish',
      overallStrength: 75,
      indicatorJudgments: [
        {
          indicator: 'RSI',
          signal: 'bullish',
          strength: 70,
          confidence: 'strong',
          message: 'RSI in bullish zone',
          reasons: ['RSI above 50'],
        },
        {
          indicator: 'MACD',
          signal: 'bullish',
          strength: 80,
          confidence: 'strong',
          message: 'MACD golden cross',
          reasons: ['DIF above DEA'],
        },
        {
          indicator: 'KDJ',
          signal: 'neutral',
          strength: 50,
          confidence: 'weak',
          message: 'KDJ neutral',
          reasons: ['K around 50'],
        },
      ],
      strategySignals: [
        {
          type: 'momentum',
          action: 'buy',
          signal: 'bullish',
          strength: 75,
          confidence: 'strong',
          riskLevel: 'medium',
          supportingIndicators: ['RSI', 'MACD'],
          conflictingIndicators: [],
          recommendation: 'Consider buying',
        },
      ],
      finalRecommendation: {
        primaryAction: 'buy',
        secondaryActions: ['Set stop loss', 'Monitor volume'],
        riskWarnings: ['Market volatility'],
        timeframe: 'short-term',
      },
    })),
  },
}));

// Mock data
const mockAnalysis: StockAnalysisDTO = {
  _id: '507f1f77bcf86cd799439011',
  symbol: 'QQQ',
  datetime: new Date('2025-02-12'),
  open: 104.5,
  close: 105.2,
  macd: { dif: 2.5, dea: 1.8, histogram: 0.7, ema12: 103.5, ema26: 102.0 },
  rsi: { '14': 65, gain: 1.5, loss: 0.8 },
  kdj: { datetime: new Date('2025-02-12'), k: 70, d: 65, j: 80, rsv: 75 },
  bollinger: { datetime: new Date('2025-02-12'), upper: 110, middle: 105, lower: 100 },
  ma: { '20': 105 },
  ema: { '5': 104 }
};

describe('StrategyDashboard', () => {
  test('should render dashboard title', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/strategy dashboard/i)).toBeInTheDocument();
  });

  test('should render symbol', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/QQQ/)).toBeInTheDocument();
  });

  test('should render loading state when no analysis', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={null} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('should display overall signal strength', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/overall signal/i)).toBeInTheDocument();
    expect(screen.getByTestId('signal-strength')).toBeInTheDocument();
  });

  test('should display primary action recommendation', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/recommended action/i)).toBeInTheDocument();
    expect(screen.getByTestId('primary-action')).toBeInTheDocument();
  });

  test('should display indicator convergence section', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/indicator convergence/i)).toBeInTheDocument();
    expect(screen.getByTestId('convergence-count')).toBeInTheDocument();
  });

  test('should display individual indicator judgments', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/indicator convergence/i)).toBeInTheDocument();
    expect(screen.getByTestId('indicator-list')).toBeInTheDocument();
  });

  test('should display risk assessment section', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/risk assessment/i)).toBeInTheDocument();
    expect(screen.getByTestId('risk-warnings')).toBeInTheDocument();
  });

  test('should display strategy signals with risk levels', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/risk assessment/i)).toBeInTheDocument();
    expect(screen.getByTestId('strategy-signals-list')).toBeInTheDocument();
  });

  test('should display action recommendations section', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/action recommendations/i)).toBeInTheDocument();
    expect(screen.getByTestId('primary-recommendation')).toBeInTheDocument();
  });

  test('should display secondary actions and timeframe', () => {
    render(<StrategyDashboard symbol="QQQ" analysis={mockAnalysis} />);

    expect(screen.getByText(/action recommendations/i)).toBeInTheDocument();
    expect(screen.getByTestId('secondary-actions')).toBeInTheDocument();
    expect(screen.getByTestId('timeframe')).toBeInTheDocument();
  });
});
