import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComprehensiveChart from '../comprehensiveChart';

// Mock dynamic import for react-apexcharts
jest.mock('next/dynamic', () => {
  return jest.fn(() => {
    return function MockChart({ options, series, type, height }: any) {
      return (
        <div data-testid="apex-chart">
          <div data-testid="chart-type">{type}</div>
          <div data-testid="chart-height">{height}</div>
          <div data-testid="chart-series">{JSON.stringify(series)}</div>
          <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
      );
    };
  });
});

// Mock responsive hooks
jest.mock('../../../hooks/use-responsive', () => ({
  useScreenSize: jest.fn(() => 'md'),
  useWindowSize: jest.fn(() => ({ width: 1024, height: 768 })),
}));

// Mock chart responsive hooks
jest.mock('../../../hooks/use-chart-responsive', () => ({
  useChartResponsive: jest.fn(() => ({
    screenSize: 'md',
    chartHeight: 300,
    showToolbar: true,
    windowSize: { width: 1024, height: 768 },
    getOptimalWidth: jest.fn(() => 800),
    getChartOptions: jest.fn((options) => options),
    getChartContainerClasses: jest.fn(() => 'w-full mx-auto'),
    getResponsiveChartProps: jest.fn((options, series) => ({
      options,
      series,
      height: 300,
      width: '100%',
    })),
  })),
}));

// Mock Zustand store
jest.mock('../../../utils/zustand', () => ({
  useStockPriceStyle: jest.fn(() => ({
    upColor: '#00FF00',
    downColor: '#FF0000',
  })),
}));

// Mock API calls
jest.mock('../../../utils/api', () => ({
  getRangeList: jest.fn(),
}));

// Mock translations
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

import { useScreenSize, useWindowSize } from '../../../hooks/use-responsive';
import { useChartResponsive } from '../../../hooks/use-chart-responsive';
import { getRangeList } from '../../../utils/api';

const mockUseScreenSize = useScreenSize as jest.MockedFunction<
  typeof useScreenSize
>;
const mockUseWindowSize = useWindowSize as jest.MockedFunction<
  typeof useWindowSize
>;
const mockUseChartResponsive = useChartResponsive as jest.MockedFunction<
  typeof useChartResponsive
>;
const mockGetRangeList = getRangeList as jest.MockedFunction<
  typeof getRangeList
>;

// Mock fetch for previous price API call
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('ComprehensiveChart', () => {
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

    // Set default mock return values
    mockUseScreenSize.mockReturnValue('md');
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    mockUseChartResponsive.mockReturnValue({
      screenSize: 'md',
      chartHeight: 300,
      showToolbar: true,
      windowSize: { width: 1024, height: 768 },
      getOptimalWidth: jest.fn(() => 800),
      getChartOptions: jest.fn((options) => options),
      getChartContainerClasses: jest.fn(() => 'w-full mx-auto'),
      getResponsiveChartProps: jest.fn((options, series) => ({
        options,
        series,
        height: 300,
        width: '100%',
      })),
    });

    // Mock the API responses
    mockGetRangeList.mockResolvedValue({
      data: [
        {
          symbol: 'QQQ',
          datetime: '2024-01-15T09:30:00.000Z',
          close: 350.25,
          high: 355.75,
          low: 348.5,
          open: 352.0,
          volume: 25000000,
        },
        {
          symbol: 'QQQ',
          datetime: '2024-01-16T09:30:00.000Z',
          close: 351.5,
          high: 356.0,
          low: 349.75,
          open: 350.25,
          volume: 28000000,
        },
      ],
    });

    // Mock fetch for previous price
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ close: 349.0 }),
    } as any);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render chart with default 1D timeframe', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('apex-chart')).toBeInTheDocument();
        expect(screen.getByTestId('chart-type')).toHaveTextContent('area');
      });
    });

    it('should render time range selector tabs', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('1d')).toBeInTheDocument();
        expect(screen.getByText('1w')).toBeInTheDocument();
        expect(screen.getByText('1m')).toBeInTheDocument();
        expect(screen.getByText('3m')).toBeInTheDocument();
      });
    });
  });

  describe('Time Range Selection', () => {
    it('should handle 1D tab selection', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('1d')).toBeInTheDocument();
      });

      const oneDayTab = screen.getByText('1d');
      fireEvent.click(oneDayTab);

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1D');
      });
    });

    it('should handle 1W tab selection', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('1w')).toBeInTheDocument();
      });

      const oneWeekTab = screen.getByText('1w');
      fireEvent.click(oneWeekTab);

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1W');
      });
    });

    it('should handle 1M tab selection', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('1m')).toBeInTheDocument();
      });

      const oneMonthTab = screen.getByText('1m');
      fireEvent.click(oneMonthTab);

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1M');
      });
    });

    it('should handle 3M tab selection', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('3m')).toBeInTheDocument();
      });

      const threeMonthTab = screen.getByText('3m');
      fireEvent.click(threeMonthTab);

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '3M');
      });
    });
  });

  describe('Data Integration', () => {
    it('should fetch chart data on component mount', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1D');
      });
    });

    it('should display chart with fetched data', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        const seriesData = screen.getByTestId('chart-series');
        expect(seriesData).toBeInTheDocument();
        expect(seriesData.textContent).toContain('350.25');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile screen size', async () => {
      mockUseScreenSize.mockReturnValue('xs');
      mockUseChartResponsive.mockReturnValue({
        screenSize: 'xs',
        chartHeight: 200,
        showToolbar: false,
        windowSize: { width: 350, height: 600 },
        getOptimalWidth: jest.fn(() => 350),
        getChartOptions: jest.fn((options) => options),
        getChartContainerClasses: jest.fn(() => 'w-full mx-auto'),
        getResponsiveChartProps: jest.fn((options, series) => ({
          options,
          series,
          height: 200,
          width: '100%',
        })),
      });

      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('apex-chart')).toBeInTheDocument();
      });
    });

    it('should handle desktop screen size', async () => {
      mockUseScreenSize.mockReturnValue('lg');
      mockUseChartResponsive.mockReturnValue({
        screenSize: 'lg',
        chartHeight: 400,
        showToolbar: true,
        windowSize: { width: 1200, height: 800 },
        getOptimalWidth: jest.fn(() => 1200),
        getChartOptions: jest.fn((options) => options),
        getChartContainerClasses: jest.fn(() => 'w-full mx-auto'),
        getResponsiveChartProps: jest.fn((options, series) => ({
          options,
          series,
          height: 400,
          width: '100%',
        })),
      });

      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('apex-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state', async () => {
      // Mock a pending promise to simulate loading
      mockGetRangeList.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should handle API error gracefully', async () => {
      const mockError = new Error('API Error');
      mockGetRangeList.mockRejectedValue(mockError);

      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      // Component should still render tabs even with API error
      await waitFor(() => {
        expect(screen.getByText('1d')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Configuration', () => {
    it('should configure chart with area type', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('chart-type')).toHaveTextContent('area');
      });
    });

    it('should use responsive chart options', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(mockUseChartResponsive).toHaveBeenCalled();
        const chartResponsive = mockUseChartResponsive.mock.results[0].value;
        expect(chartResponsive.getChartOptions).toHaveBeenCalled();
      });
    });
  });

  describe('Symbol Handling', () => {
    it('should handle different symbols correctly', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="TQQQ" closePrice={150.5} />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('TQQQ', '1D');
      });
    });
  });

  describe('Tab State Management', () => {
    it('should maintain active tab state', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} />
      );

      await waitFor(() => {
        expect(screen.getByText('1w')).toBeInTheDocument();
      });

      const oneWeekTab = screen.getByText('1w');
      fireEvent.click(oneWeekTab);

      await waitFor(() => {
        // Check that the new range was called
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1W');
      });
    });
  });
});
