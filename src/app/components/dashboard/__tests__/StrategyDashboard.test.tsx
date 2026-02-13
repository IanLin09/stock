import { render, screen } from '@testing-library/react';
import StrategyDashboard from '../StrategyDashboard';
import type { StockAnalysisDTO } from '@/utils/dto';

// Mock data
const mockAnalysis: StockAnalysisDTO = {
  symbol: 'QQQ',
  datetime: '2025-02-12',
  indicators: {
    macd: { dif: 2.5, dea: 1.8, histogram: 0.7 },
    rsi: { '14': 65 },
    kdj: { k: 70, d: 65, j: 80 },
    bollingerBands: { upper: 110, middle: 105, lower: 100 },
    ma: { '20': 105 },
  },
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
});
