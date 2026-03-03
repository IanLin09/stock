import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComprehensiveArea from '../comprehensive';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        '1m': '1m',
        '3m': '3m',
        '6m': '6m',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the closePrice hooks
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
}));

// Mock the ComprehensiveChart component
jest.mock('../comprehensiveChart', () => {
  return function MockComprehensiveChart({
    symbol,
    closePrice,
  }: {
    symbol: string;
    closePrice: number;
    range: string;
    onPlotOffsetChange?: (offset: number) => void;
  }) {
    return (
      <div data-testid="comprehensive-chart">
        Chart for {symbol} - {closePrice}
      </div>
    );
  };
});

// Mock responsive hooks
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTablet: jest.fn(() => false),
}));

// Mock utils
jest.mock('../../../utils/responsive', () => ({
  getResponsiveTextSize: jest.fn((size) => `text-${size}`),
  getResponsiveSpacing: jest.fn((size) => `p-${size}`),
}));

// Mock error handler
jest.mock('../../../utils/error', () => ({
  handleError: jest.fn(),
}));

// Mock zustand store
jest.mock('../../../utils/zustand', () => ({
  useStockPriceStyle: () => ({
    upColor: '#22c55e',
    downColor: '#ef4444',
  }),
}));

import { ClosePrices } from '../closePrice';

const mockClosePrices = ClosePrices as jest.MockedFunction<typeof ClosePrices>;

describe('ComprehensiveArea', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  const mockStockData = {
    symbol: 'QQQ',
    close: 350.25,
    high: 355.75,
    low: 348.5,
    open: 352.0,
    volume: 25000000,
    datetime: '2024-01-15',
  };

  describe('Basic Rendering', () => {
    it('should render stock symbol and data when loaded', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('panel-price')).toHaveTextContent('350.25');
      });
    });

    it('should render comprehensive chart component', async () => {
      mockClosePrices.mockReturnValue({
        data: { TQQQ: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="TQQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
        expect(screen.getByText(/Chart for TQQQ/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state', async () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should handle error state gracefully', async () => {
      const mockError = new Error('API Error');
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        isError: true,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call ClosePrices hook', () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      expect(mockClosePrices).toHaveBeenCalled();
    });

    it('should call ClosePrices to get current price', () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      expect(mockClosePrices).toHaveBeenCalled();
    });
  });
});
