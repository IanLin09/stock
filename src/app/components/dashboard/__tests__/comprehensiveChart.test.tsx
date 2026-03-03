import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  getAnalysisList: jest.fn(),
}));

// Mock translations
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

// Mock StrategyDashboard
jest.mock('../StrategyDashboard', () => {
  return function MockStrategyDashboard({ symbol, analysis }: any) {
    return (
      <div data-testid="strategy-dashboard">
        <div>Strategy Dashboard for {symbol}</div>
        {analysis && <div>Analysis data loaded</div>}
      </div>
    );
  };
});

import { useScreenSize, useWindowSize } from '../../../hooks/use-responsive';
import { useChartResponsive } from '../../../hooks/use-chart-responsive';
import { getRangeList, getAnalysisList } from '../../../utils/api';

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
const mockGetAnalysisList = getAnalysisList as jest.MockedFunction<
  typeof getAnalysisList
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
      _id: 'chart1',
      close: 351.5,
      data: [
        {
          _id: 'id1',
          symbol: 'QQQ',
          datetime: new Date('2024-01-15T09:30:00.000Z'),
          close: 350.25,
          high: 355.75,
          low: 348.5,
          open: 352.0,
          volume: 25000000,
        },
        {
          _id: 'id2',
          symbol: 'QQQ',
          datetime: new Date('2024-01-16T09:30:00.000Z'),
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

    // Mock the analysis API response
    mockGetAnalysisList.mockResolvedValue([
      {
        symbol: 'QQQ',
        datetime: new Date('2024-01-16T09:30:00.000Z'),
        close: 351.5,
        macd: { dif: 1.2, dea: 0.8, histogram: 0.4, ema12: 349, ema26: 347 },
        rsi: { 14: 65, gain: 1.2, loss: 0.8 },
        kdj: {
          k: 70,
          d: 65,
          j: 75,
          rsv: 72,
          datetime: new Date('2024-01-16T09:30:00.000Z'),
        },
        bollinger: {
          upper: 360,
          middle: 350,
          lower: 340,
          datetime: new Date('2024-01-16T09:30:00.000Z'),
        },
        ma: { 20: 348 },
        ema: { 5: 350 },
      },
    ] as any);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render chart with 1M range prop', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('apex-chart')).toBeInTheDocument();
        expect(screen.getByTestId('chart-type')).toHaveTextContent('area');
      });
    });
  });

  describe('Data Integration', () => {
    it('should fetch chart data on component mount', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '1M');
      });
    });

    it('should fetch 3M data when range prop is 3M', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="3M" />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '3M');
      });
    });

    it('should fetch 6M data when range prop is 6M', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="6M" />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('QQQ', '6M');
      });
    });

    it('should display chart with fetched data', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
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
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
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
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
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
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should handle API error gracefully', async () => {
      const mockError = new Error('API Error');
      mockGetRangeList.mockRejectedValue(mockError);

      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
      );

      // Chart container should still be present even after error
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chart Configuration', () => {
    it('should configure chart with area type', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('chart-type')).toHaveTextContent('area');
      });
    });

    it('should use responsive chart options', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="1M" />
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
        <ComprehensiveChart symbol="TQQQ" closePrice={150.5} range="1M" />
      );

      await waitFor(() => {
        expect(mockGetRangeList).toHaveBeenCalledWith('TQQQ', '1M');
      });
    });
  });

  describe('Strategy Range', () => {
    it('should render StrategyDashboard when range is Range', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="Range" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('strategy-dashboard')).toBeInTheDocument();
        expect(
          screen.getByText(/strategy dashboard for QQQ/i)
        ).toBeInTheDocument();
      });
    });

    it('should not call getRangeList when range is Range', async () => {
      renderWithProviders(
        <ComprehensiveChart symbol="QQQ" closePrice={350.25} range="Range" />
      );

      await waitFor(() => {
        expect(mockGetAnalysisList).toHaveBeenCalledWith('QQQ', '1M');
      });

      expect(mockGetRangeList).not.toHaveBeenCalled();
    });
  });
});
