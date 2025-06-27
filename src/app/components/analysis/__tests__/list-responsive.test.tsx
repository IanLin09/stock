import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AnalysisList from '../list';

// Mock the responsive hooks
jest.mock('../../../hooks/use-analysis-responsive', () => ({
  useAnalysisBreakpoints: jest.fn(),
}));

// Mock the API and translation
jest.mock('../../../utils/api', () => ({
  getSymbolDetail: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockTranslation = {
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      close_price: 'Close Price',
      compare_MA20: 'Compare MA20',
      symbol: 'Symbol',
      next_rd: 'Next Report Date',
    };
    return translations[key] || key;
  },
};

const mockData = {
  indicators: {
    close: 123.45,
    rsi: { 14: 65.32 },
    ma: { 20: 120.50 },
  },
  report: [
    { symbol: 'QQQ', reportDate: '2024-01-15' },
    { symbol: 'AAPL', reportDate: '2024-01-20' },
  ],
};

describe('AnalysisList Responsive Behavior', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Mobile Layout (Accordion)', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: true,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: false,
        currentScreenSize: 'xs',
      });
    });

    it('should render accordion cards for mobile', async () => {
      // Mock successful query
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that all accordion cards are rendered
      expect(screen.getByText('價格資訊')).toBeInTheDocument();
      expect(screen.getByText('技術指標')).toBeInTheDocument();
      expect(screen.getByText('報告日期')).toBeInTheDocument();

      // Check that price section is expanded by default
      expect(screen.getByText('QQQ')).toBeInTheDocument();
      expect(screen.getByText('Close Price:')).toBeInTheDocument();
    });

    it('should toggle accordion sections on click', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Initially, indicators section should be collapsed
      expect(screen.queryByText('RSI:')).not.toBeInTheDocument();

      // Click to expand indicators section
      const indicatorsHeader = screen.getByText('技術指標').closest('[class*="cursor-pointer"]');
      fireEvent.click(indicatorsHeader!);

      // Now indicators should be visible
      expect(screen.getByText('RSI:')).toBeInTheDocument();
      expect(screen.getByText('65.32')).toBeInTheDocument();
    });
  });

  describe('Tablet Layout (Horizontal Scroll)', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: true,
        shouldUseHorizontalLayout: false,
        currentScreenSize: 'md',
      });
    });

    it('should render horizontal scrolling cards for tablet', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that all cards are rendered
      expect(screen.getByText('價格資訊')).toBeInTheDocument();
      expect(screen.getByText('技術指標')).toBeInTheDocument();
      expect(screen.getByText('報告日期')).toBeInTheDocument();

      // Check that content is visible (no accordion behavior)
      expect(screen.getAllByText('QQQ')).toHaveLength(2); // One in price card, one in reports
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
    });

    it('should limit report items to 3 in tablet layout', async () => {
      const dataWithManyReports = {
        ...mockData,
        report: [
          { symbol: 'QQQ', reportDate: '2024-01-15' },
          { symbol: 'AAPL', reportDate: '2024-01-20' },
          { symbol: 'MSFT', reportDate: '2024-01-25' },
          { symbol: 'GOOGL', reportDate: '2024-01-30' },
          { symbol: 'AMZN', reportDate: '2024-02-05' },
        ],
      };

      queryClient.setQueryData(['analysisList', 'QQQ'], dataWithManyReports);

      renderWithProvider(<AnalysisList />);

      // Should only show first 3 items in reports card
      expect(screen.getAllByText('QQQ')).toHaveLength(2); // One in price card, one in reports  
      expect(screen.getByText('AAPL')).toBeInTheDocument();  
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
      expect(screen.queryByText('AMZN')).not.toBeInTheDocument();
    });
  });

  describe('Desktop Layout (Vertical)', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: true,
        currentScreenSize: 'lg',
      });
    });

    it('should render vertical layout for desktop', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that all sections are rendered
      expect(screen.getAllByText('QQQ')).toHaveLength(2); // One as header, one as data
      expect(screen.getByText('技術指標')).toBeInTheDocument();
      expect(screen.getByText('報告日期')).toBeInTheDocument();

      // Check that content is visible
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Next Report Date')).toBeInTheDocument();
    });

    it('should show all report items in grid layout', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Should show all report items
      expect(screen.getAllByText('QQQ')).toHaveLength(2); // One as header, one as data
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('2024-01-20')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: true,
        currentScreenSize: 'lg',
      });
    });

    it('should show loading state', () => {
      renderWithProvider(<AnalysisList />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], null);

      const { container } = renderWithProvider(<AnalysisList />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing report data', async () => {
      const dataWithoutReports = {
        ...mockData,
        report: null,
      };

      queryClient.setQueryData(['analysisList', 'QQQ'], dataWithoutReports);

      renderWithProvider(<AnalysisList />);
      expect(screen.getByText('暫無報告資料')).toBeInTheDocument();
    });
  });
});