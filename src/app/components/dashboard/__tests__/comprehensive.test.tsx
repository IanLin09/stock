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

// Mock the closePrice hooks
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
}));

// Capture the onPreviousPriceChange callback so tests can call it directly
let capturedOnPreviousPriceChange: ((price: number) => void) | undefined;

// Mock the ComprehensiveChart component
jest.mock('../comprehensiveChart', () => {
  return function MockComprehensiveChart({
    symbol,
    onPreviousPriceChange,
  }: {
    symbol: string;
    onPreviousPriceChange?: (price: number) => void;
  }) {
    capturedOnPreviousPriceChange = onPreviousPriceChange;
    return <div data-testid="comprehensive-chart">Chart for {symbol}</div>;
  };
});

// Mobile mock — default desktop; flip to true in mobile tests
let mockIsMobile = false;

// Mock responsive hooks
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: () => mockIsMobile,
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
    capturedOnPreviousPriceChange = undefined;
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
    it('should render stock symbol and price when loaded', async () => {
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

    it('should render time range tabs', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByText('1m')).toBeInTheDocument();
        expect(screen.getByText('3m')).toBeInTheDocument();
        expect(screen.getByText('6m')).toBeInTheDocument();
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

  describe('Percentage Change', () => {
    it('should show positive percentage change when chart reports lower previous price', async () => {
      mockClosePrices.mockReturnValue({
        data: { QQQ: { ...mockStockData, close: 350.25 } },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      // Simulate ComprehensiveChart reporting the start-of-range previous price
      act(() => {
        capturedOnPreviousPriceChange?.(346.0);
      });

      await waitFor(() => {
        const pctEl = screen.getByTestId('panel-pct-change');
        expect(pctEl.textContent).toMatch(/^\+/);
        expect(pctEl).toHaveStyle({ color: '#22c55e' });
      });
    });

    it('should show negative percentage change when chart reports higher previous price', async () => {
      mockClosePrices.mockReturnValue({
        data: { QQQ: { ...mockStockData, close: 340.0 } },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      act(() => {
        capturedOnPreviousPriceChange?.(350.0);
      });

      await waitFor(() => {
        const pctEl = screen.getByTestId('panel-pct-change');
        expect(pctEl.textContent).toMatch(/^-/);
        expect(pctEl).toHaveStyle({ color: '#ef4444' });
      });
    });

    it('should not show percentage change before chart reports a previous price', async () => {
      mockClosePrices.mockReturnValue({
        data: { QQQ: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      // No act() call — chart hasn't fired onPreviousPriceChange yet
      await waitFor(() => {
        expect(screen.queryByTestId('panel-pct-change')).not.toBeInTheDocument();
      });
    });

    it('should clear percentage change when symbol changes', async () => {
      mockClosePrices.mockReturnValue({
        data: {
          QQQ: { ...mockStockData, close: 350.25 },
          TQQQ: { ...mockStockData, symbol: 'TQQQ', close: 60.0 },
        },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      const { rerender } = renderWithProviders(
        <ComprehensiveArea symbol="QQQ" />
      );

      act(() => {
        capturedOnPreviousPriceChange?.(346.0);
      });

      await waitFor(() => {
        expect(screen.getByTestId('panel-pct-change')).toBeInTheDocument();
      });

      // Switch symbol — prevClose should reset until chart reports a new value
      rerender(
        <QueryClientProvider client={queryClient}>
          <ComprehensiveArea symbol="TQQQ" />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('panel-pct-change')).not.toBeInTheDocument();
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
      expect(screen.queryByText('QQQ')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('comprehensive-chart')
      ).not.toBeInTheDocument();
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

  describe('Symbol handling', () => {
    it('should return empty when symbol is empty string', () => {
      mockClosePrices.mockReturnValue({
        data: { QQQ: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="" />);

      expect(screen.queryByTestId('panel-symbol')).not.toBeInTheDocument();
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
    it('should render correctly and contain expected UI elements', async () => {
      mockClosePrices.mockReturnValue({
        data: { [mockStockData.symbol]: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-symbol')).toBeInTheDocument();
        expect(screen.getByTestId('panel-price')).toBeInTheDocument();
        expect(screen.getByTestId('comprehensive-chart')).toBeInTheDocument();
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

    it('should pass onPreviousPriceChange to ComprehensiveChart', async () => {
      mockClosePrices.mockReturnValue({
        data: { QQQ: mockStockData },
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

      // The mock captures the callback — verify it is a function
      await waitFor(() => {
        expect(typeof capturedOnPreviousPriceChange).toBe('function');
      });
    });

    it('should handle hook state changes', async () => {
      mockClosePrices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      } as any);

      const { rerender } = renderWithProviders(
        <ComprehensiveArea symbol="QQQ" />
      );

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
        expect(screen.getByTestId('panel-price')).toHaveTextContent('350.25');
      });
    });
  });
});

describe('ComprehensiveArea mobile Range tab', () => {
  let queryClient: QueryClient;

  const mockStockData = {
    symbol: 'QQQ',
    close: 350.25,
    high: 355.75,
    low: 348.5,
    open: 352.0,
    volume: 25000000,
    datetime: '2024-01-15',
  };

  beforeEach(() => {
    mockIsMobile = true;
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockIsMobile = false;
  });

  const renderWithProviders = (component: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);

  it('hides the Range tab trigger on mobile', async () => {
    mockClosePrices.mockReturnValue({
      data: { QQQ: mockStockData },
      isLoading: false,
      error: null,
      isError: false,
    } as any);

    renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

    await waitFor(() =>
      expect(screen.getByTestId('panel-symbol')).toBeInTheDocument()
    );

    expect(screen.queryByText('Range')).not.toBeInTheDocument();
  });

  it('still shows range tabs 1m/3m/6m on mobile', async () => {
    mockClosePrices.mockReturnValue({
      data: { QQQ: mockStockData },
      isLoading: false,
      error: null,
      isError: false,
    } as any);

    renderWithProviders(<ComprehensiveArea symbol="QQQ" />);

    await waitFor(() => {
      expect(screen.getByText('1m')).toBeInTheDocument();
      expect(screen.getByText('3m')).toBeInTheDocument();
      expect(screen.getByText('6m')).toBeInTheDocument();
    });
  });
});
