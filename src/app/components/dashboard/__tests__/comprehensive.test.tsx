import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComprehensiveArea from '../comprehensive';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        at_close: 'At Close',
        high: 'High',
        low: 'Low',
        open: 'Open',
        vol: 'Volume',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the ClosePrices hook
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
}));

// Mock the ComprehensiveChart component
jest.mock('../comprehensiveChart', () => {
  return function MockComprehensiveChart({ symbol }: { symbol: string }) {
    return <div data-testid="comprehensive-chart">Chart for {symbol}</div>;
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
    low: 348.50,
    open: 352.00,
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
        expect(screen.getByText('QQQ')).toBeInTheDocument();
        expect(screen.getByText('350.25')).toBeInTheDocument();
        expect(screen.getByText('At Close')).toBeInTheDocument();
        expect(screen.getByText(/High/)).toBeInTheDocument();
        expect(screen.getByText(/Low/)).toBeInTheDocument();
        expect(screen.getByText(/Open/)).toBeInTheDocument();
        expect(screen.getByText(/Volume/)).toBeInTheDocument();
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
        expect(screen.getByText('Chart for TQQQ')).toBeInTheDocument();
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

      // Component shows loading state when data is loading
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('QQQ')).not.toBeInTheDocument();
      expect(screen.queryByTestId('comprehensive-chart')).not.toBeInTheDocument();
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

      // Component should show loading state when data is undefined and there's an error
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display all stock price information', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        // Check all price values are displayed (using partial text matching for values that are part of larger text)
        expect(screen.getByText('350.25')).toBeInTheDocument();
        expect(screen.getByText(/355\.75/)).toBeInTheDocument(); // High: 355.75
        expect(screen.getByText(/348\.5/)).toBeInTheDocument(); // Low: 348.5 (note the trailing zero is removed)
        expect(screen.getByText(/352/)).toBeInTheDocument(); // Open: 352 (trailing zeros removed)
        expect(screen.getByText(/25000000/)).toBeInTheDocument(); // Volume: 25000000

        // Check all labels are displayed
        expect(screen.getByText('At Close')).toBeInTheDocument();
        expect(screen.getByText(/High:/)).toBeInTheDocument();
        expect(screen.getByText(/Low:/)).toBeInTheDocument();
        expect(screen.getByText(/Open:/)).toBeInTheDocument();
        expect(screen.getByText(/Volume:/)).toBeInTheDocument();
      });
    });

    it('should handle different symbols correctly', async () => {
      const nvdlData = { ...mockStockData, symbol: 'NVDL' };
      mockClosePrices.mockReturnValue({
        data: { NVDL: nvdlData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="NVDL" />);

      await waitFor(() => {
        expect(screen.getByText('NVDL')).toBeInTheDocument();
        expect(screen.getByText('Chart for NVDL')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render correctly on different screen sizes', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      const { container } = renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        // Component should have responsive classes
        const elements = container.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Integration', () => {
    it('should pass correct symbol to ComprehensiveChart', async () => {
      mockClosePrices.mockReturnValue({
        data: { TQQQ: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="TQQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
        expect(screen.getByText('Chart for TQQQ')).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes and Structure', () => {
    it('should render with correct structure and classes', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      const { container } = renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        // Check that the component has the expected structure
        const symbolElement = screen.getByText('QQQ');
        expect(symbolElement).toBeInTheDocument();
        
        // Check that responsive grid classes are present
        const gridElements = container.querySelectorAll('[class*="grid"]');
        expect(gridElements.length).toBeGreaterThan(0);
      });
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

    it('should handle hook state changes', async () => {
      // Initial loading state
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      const { rerender } = renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      // Update to loaded state
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
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
        expect(screen.getByText('350.25')).toBeInTheDocument();
      });
    });
  });
});