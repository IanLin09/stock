import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IndicatorSummary from '../IndicatorSummary';

// Mock api
jest.mock('../../../utils/api', () => ({
  getSymbolDetail: jest.fn(),
}));

// Mobile mock — default desktop; flip to true in mobile tests
let mockIsMobile = false;
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

import { getSymbolDetail } from '../../../utils/api';
const mockGetSymbolDetail = getSymbolDetail as jest.MockedFunction<
  typeof getSymbolDetail
>;

const mockIndicatorData = {
  indicators: {
    _id: '1',
    symbol: 'QQQ',
    datetime: new Date('2026-02-27'),
    open: 600,
    close: 607.87,
    macd: { dif: 0.4, dea: -0.1, histogram: 0.8, ema12: 605, ema26: 600 },
    ma: { 20: 601.2 },
    ema: { 5: 604.1 },
    rsi: { 14: 58.2, gain: 1.2, loss: 0.8 },
    bollinger: { datetime: new Date(), upper: 615, middle: 605, lower: 595 },
    kdj: { datetime: new Date(), k: 72, d: 68, j: 78, rsv: 70 },
  },
  report: [],
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('IndicatorSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when symbol is empty', () => {
    const { container } = renderWithQuery(<IndicatorSummary symbol="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state while fetching', () => {
    mockGetSymbolDetail.mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    expect(screen.getByTestId('indicator-summary-loading')).toBeInTheDocument();
  });

  it('renders all 6 indicator rows after data loads', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-summary')).toBeInTheDocument()
    );

    expect(screen.getByTestId('indicator-row-rsi')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-row-macd')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-row-ma')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-row-kdj')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-row-bollinger')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-row-ema')).toBeInTheDocument();
  });

  it('displays RSI value correctly', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-rsi')).toBeInTheDocument()
    );
    expect(screen.getByTestId('indicator-row-rsi')).toHaveTextContent('58.20');
  });

  it('displays MACD values as DIF / DEA / Hist', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-macd')).toBeInTheDocument()
    );
    const macdRow = screen.getByTestId('indicator-row-macd');
    expect(macdRow).toHaveTextContent('0.40');
    expect(macdRow).toHaveTextContent('-0.10');
    expect(macdRow).toHaveTextContent('0.80');
  });

  it('displays Bollinger values as Upper / Mid / Lower', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-bollinger')).toBeInTheDocument()
    );
    const bbandsRow = screen.getByTestId('indicator-row-bollinger');
    expect(bbandsRow).toHaveTextContent('615.00');
    expect(bbandsRow).toHaveTextContent('605.00');
    expect(bbandsRow).toHaveTextContent('595.00');
  });

  it('shows signal badge for RSI', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-rsi')).toBeInTheDocument()
    );
    // RSI 58.2 → neutral
    expect(screen.getByTestId('signal-badge-rsi')).toHaveTextContent('neutral');
  });

  it('shows signal badge for MACD as bullish when DIF > DEA and Hist > 0', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-macd')).toBeInTheDocument()
    );
    // dif 0.4 > dea -0.1 and hist 0.8 > 0 → bullish
    expect(screen.getByTestId('signal-badge-macd')).toHaveTextContent(
      'bullish'
    );
  });

  it('does not render a signal badge for EMA', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-ema')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('signal-badge-ema')).toBeNull();
  });
});

describe('IndicatorSummary mobile compact', () => {
  beforeEach(() => {
    mockIsMobile = true;
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockIsMobile = false;
  });

  it('uses abbreviated MACD labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-macd')).toBeInTheDocument()
    );
    const macdRow = screen.getByTestId('indicator-row-macd');
    // Mobile shows "D: / A: / H:" instead of "DIF / DEA / Hist"
    expect(macdRow).toHaveTextContent('D:');
    expect(macdRow).toHaveTextContent('A:');
    expect(macdRow).toHaveTextContent('H:');
  });

  it('uses abbreviated KDJ labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-kdj')).toBeInTheDocument()
    );
    const kdjRow = screen.getByTestId('indicator-row-kdj');
    // Mobile: "K: / D: / J:" instead of "K / D / J"
    expect(kdjRow).toHaveTextContent('K:');
  });

  it('uses abbreviated Bollinger labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-bollinger')).toBeInTheDocument()
    );
    const bbandsRow = screen.getByTestId('indicator-row-bollinger');
    // Mobile: "U: / M: / L:" instead of "Upper / Mid / Lower"
    expect(bbandsRow).toHaveTextContent('U:');
    expect(bbandsRow).toHaveTextContent('M:');
    expect(bbandsRow).toHaveTextContent('L:');
  });
});
