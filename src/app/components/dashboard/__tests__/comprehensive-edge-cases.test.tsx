import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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

// Mock responsive hooks
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTablet: jest.fn(() => false),
}));

// Mock utility functions
jest.mock('../../../utils/responsive', () => ({
  getResponsiveTextSize: jest.fn((size) => `text-${size}`),
  getResponsiveSpacing: jest.fn((size) => `p-${size}`),
}));

// Mock error handler
jest.mock('../../../utils/error', () => ({
  handleError: jest.fn(),
}));

// Mock closePrice hooks
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
}));

// Mock zustand store
jest.mock('../../../utils/zustand', () => ({
  useStockPriceStyle: () => ({
    upColor: '#22c55e',
    downColor: '#ef4444',
  }),
}));

// Mock ComprehensiveChart component
jest.mock('../comprehensiveChart', () => {
  return function MockComprehensiveChart({ symbol, closePrice }: any) {
    return (
      <div data-testid="comprehensive-chart">
        <div data-testid="chart-symbol">{symbol}</div>
        <div data-testid="chart-close-price">{closePrice}</div>
      </div>
    );
  };
});

import { ClosePrices } from '../closePrice';
import { useIsMobile, useIsTablet } from '../../../hooks/use-responsive';

const mockClosePrices = ClosePrices as jest.MockedFunction<typeof ClosePrices>;
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockUseIsTablet = useIsTablet as jest.MockedFunction<typeof useIsTablet>;

describe('Comprehensive Components Edge Cases', () => {
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

    // Set default mock values
    mockUseIsMobile.mockReturnValue(false);
    mockUseIsTablet.mockReturnValue(false);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  const mockStockData = {
    QQQ: {
      symbol: 'QQQ',
      close: 350.25,
      high: 355.75,
      low: 348.5,
      open: 352.0,
      volume: 25000000,
    },
  };

  describe('Empty Data Scenarios', () => {
    it('should handle completely empty price data', async () => {
      mockClosePrices.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        // Should show loading when no data
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should handle undefined data gracefully', async () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should handle empty object data without crashing', async () => {
      mockClosePrices.mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      // Optional chaining prevents crash; component renders with 0 as price
      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toBeInTheDocument();
        expect(screen.getByTestId('panel-price')).toHaveTextContent('0');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when data is loading', async () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle rapid loading state changes', async () => {
      // Start with loading
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      const { rerender } = renderWithProviders(
        <ComprehensiveArea symbol="QQQ" />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Change to success state
      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      rerender(
        <QueryClientProvider client={queryClient}>
          <ComprehensiveArea symbol="QQQ" />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('chart-symbol')).toHaveTextContent('QQQ');
      });
    });
  });

  describe('Error States', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: timeoutError,
        isError: true,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should handle 404 API errors', async () => {
      const notFoundError = new Error('Symbol not found');
      (notFoundError as any).status = 404;

      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: notFoundError,
        isError: true,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="INVALID" />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should handle 500 server errors', async () => {
      const serverError = new Error('Internal server error');
      (serverError as any).status = 500;

      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: serverError,
        isError: true,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('Malformed Data Scenarios', () => {
    it('should handle malformed price data', async () => {
      const malformedData = {
        QQQ: {
          symbol: 'QQQ',
          close: null,
          high: undefined,
          low: 'invalid',
          open: NaN,
          volume: -1,
        },
      };

      mockClosePrices.mockReturnValue({
        data: malformedData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
      });
    });

    it('should handle missing symbol data without crashing', async () => {
      const dataWithoutSymbol = {
        AAPL: {
          symbol: 'AAPL',
          close: 150.25,
          high: 155.75,
          low: 148.5,
          open: 152.0,
          volume: 15000000,
        },
      };

      mockClosePrices.mockReturnValue({
        data: dataWithoutSymbol,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      // Optional chaining prevents crash; component renders with 0 as price
      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('panel-price')).toHaveTextContent('0');
      });
    });
  });

  describe('Responsive Behavior Edge Cases', () => {
    it('should handle mobile layout correctly', async () => {
      mockUseIsMobile.mockReturnValue(true);
      mockUseIsTablet.mockReturnValue(false);

      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
      });
    });

    it('should handle tablet layout correctly', async () => {
      mockUseIsMobile.mockReturnValue(false);
      mockUseIsTablet.mockReturnValue(true);

      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
      });
    });

    it('should handle desktop layout correctly', async () => {
      mockUseIsMobile.mockReturnValue(false);
      mockUseIsTablet.mockReturnValue(false);

      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Symbol Edge Cases', () => {
    it('should handle special characters in symbols', async () => {
      const specialSymbol = 'BRK.B';
      const specialData = {
        'BRK.B': {
          symbol: 'BRK.B',
          close: 350.25,
          high: 355.75,
          low: 348.5,
          open: 352.0,
          volume: 25000000,
        },
      };

      mockClosePrices.mockReturnValue({
        data: specialData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol={specialSymbol} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent('BRK.B');
        expect(screen.getByTestId('chart-symbol')).toHaveTextContent('BRK.B');
      });
    });

    it('should handle very long symbol names', async () => {
      const longSymbol = 'VERYLONGSYMBOLNAME123456789';
      const longData = {
        [longSymbol]: {
          symbol: longSymbol,
          close: 350.25,
          high: 355.75,
          low: 348.5,
          open: 352.0,
          volume: 25000000,
        },
      };

      mockClosePrices.mockReturnValue({
        data: longData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol={longSymbol} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toHaveTextContent(
          longSymbol
        );
      });
    });

    it('should handle empty string symbol', async () => {
      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="" />);

      expect(
        screen.queryByTestId('comprehensive-chart')
      ).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to ComprehensiveChart', async () => {
      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('chart-symbol')).toHaveTextContent('QQQ');
        expect(screen.getByTestId('chart-close-price')).toHaveTextContent(
          '350.25'
        );
      });
    });

    it('should handle rapid component unmounting', async () => {
      mockClosePrices.mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      const { unmount } = renderWithProviders(
        <ComprehensiveArea symbol="QQQ" />
      );

      act(() => {
        unmount();
      });

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
});
