import { render, screen } from '@testing-library/react';
import StrategyDashboard from '../StrategyDashboard';
import type { StockAnalysisDTO } from '@/utils/dto';

// Mock strategySystemController
jest.mock('../../../utils/strategySystemController', () => ({
  quickAnalyzeStock: jest.fn(() => ({
    action: 'buy',
    confidence: 75,
    riskLevel: 'medium',
    reasoning: 'Technical indicators show bullish signals',
    keyPoints: ['MACD positive', 'RSI above 50'],
  })),
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
});
