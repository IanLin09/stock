import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardList from '../list';
import * as closePrice from '../closePrice';
import { useIsMobile } from '../../../hooks/use-responsive';
import { useStockPriceStyle } from '../../../utils/zustand';

// Mock dependencies
jest.mock('../../../hooks/use-responsive');
jest.mock('../../../utils/zustand');
jest.mock('../closePrice');

const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockUseStockPriceStyle = useStockPriceStyle as jest.MockedFunction<
  typeof useStockPriceStyle
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DashboardList', () => {
  const mockSetSymbol = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseIsMobile.mockReturnValue(false);
    mockUseStockPriceStyle.mockReturnValue({
      upColor: '#10b981',
      downColor: '#ef4444',
    });
  });

  it('renders loading state initially', () => {
    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays stock data after successful fetch', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.23,
        volume: 1234567,
        datetime: new Date('2026-02-23'),
        open: 104.5,
        high: 106.0,
        low: 104.0,
      },
      TQQQ: {
        symbol: 'TQQQ',
        close: 52.15,
        volume: 2500000,
        datetime: new Date('2026-02-23'),
        open: 51.8,
        high: 52.5,
        low: 51.5,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
        TQQQ: { close: 50.0, _id: '2', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('QQQ')).toBeInTheDocument();
      expect(screen.getByText('TQQQ')).toBeInTheDocument();
    });

    expect(screen.getByText('105.23')).toBeInTheDocument();
    expect(screen.getByText('52.15')).toBeInTheDocument();
  });

  it('calculates and displays positive percentage change correctly', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
    });
  });

  it('calculates and displays negative percentage change correctly', async () => {
    const mockLatestPrices = {
      TQQQ: {
        symbol: 'TQQQ',
        close: 95.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 96.0,
        high: 97.0,
        low: 94.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        TQQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('-5.00%')).toBeInTheDocument();
    });
  });

  it('shows N/A when previous price is unavailable', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('formats volume correctly (millions)', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1234567,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('1.2M')).toBeInTheDocument();
    });
  });

  it('calls setSymbol when row is clicked', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('QQQ')).toBeInTheDocument();
    });

    const qqq = screen.getByText('QQQ');
    fireEvent.click(qqq);

    expect(mockSetSymbol).toHaveBeenCalledWith('QQQ');
  });

  it('renders mobile layout when isMobile is true', async () => {
    mockUseIsMobile.mockReturnValue(true);

    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('Vol: 1.0M')).toBeInTheDocument();
    });
  });

  it('applies correct color for positive change', async () => {
    const mockLatestPrices = {
      QQQ: {
        symbol: 'QQQ',
        close: 105.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 104.0,
        high: 106.0,
        low: 103.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        QQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const row = screen
        .getByText('QQQ')
        .closest('div[class*="cursor-pointer"]');
      expect(row).toHaveStyle({ color: '#10b981' });
    });
  });

  it('applies correct color for negative change', async () => {
    const mockLatestPrices = {
      TQQQ: {
        symbol: 'TQQQ',
        close: 95.0,
        volume: 1000000,
        datetime: new Date('2026-02-23'),
        open: 96.0,
        high: 97.0,
        low: 94.0,
      },
    };

    (closePrice.ClosePrices as jest.Mock).mockReturnValue({
      data: mockLatestPrices,
      isLoading: false,
      error: null,
    });

    (closePrice.PreviousPrices as jest.Mock).mockReturnValue({
      data: {
        TQQQ: { close: 100.0, _id: '1', datetime: '2026-02-22' },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardList setSymbol={mockSetSymbol} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const row = screen
        .getByText('TQQQ')
        .closest('div[class*="cursor-pointer"]');
      expect(row).toHaveStyle({ color: '#ef4444' });
    });
  });
});
