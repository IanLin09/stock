import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AnalysisList from '../list';

// Mock the responsive hooks
jest.mock('../../../hooks/use-analysis-responsive', () => ({
  useAnalysisBreakpoints: jest.fn(),
  useAnalysisLayout: jest.fn(),
}));

// Mock the API and translation
jest.mock('../../../utils/api', () => ({
  getSymbolDetail: jest.fn(),
}));

// Mock the analysis responsive utility functions
jest.mock('../../../utils/analysis-responsive', () => ({
  getAnalysisTextSize: jest.fn((size, screenSize) => `text-${size}`),
  getAnalysisSpacing: jest.fn((size, screenSize, type) => `${type || 'p'}-${size}`),
  getAnalysisGridClasses: jest.fn((screenSize, columns) => `grid grid-cols-${columns} gap-4`),
  getLayoutTransitionClasses: jest.fn(() => 'transition-all duration-300 ease-in-out'),
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
      const { useAnalysisBreakpoints, useAnalysisLayout } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: true,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: false,
        currentScreenSize: 'xs',
      });
      useAnalysisLayout.mockReturnValue('mobile');
    });

    it('should render accordion cards for mobile', async () => {
      // Mock successful query
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that component renders with expected content
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument();
      expect(screen.getByText('Close Price: 123.45')).toBeInTheDocument();
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Next Report Date')).toBeInTheDocument();
    });

    it('should show responsive layout for mobile', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check mobile specific styling is applied
      const container = screen.getByRole('heading', { name: 'QQQ' }).closest('div[class*="h-full"]');
      expect(container).toHaveClass('h-full', 'flex', 'flex-col');

      // Verify content is displayed
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
      expect(screen.getByText('Compare MA20: 2.45 %')).toBeInTheDocument();
    });
  });

  describe('Tablet Layout (Horizontal Scroll)', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints, useAnalysisLayout } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: true,
        shouldUseHorizontalLayout: false,
        currentScreenSize: 'md',
      });
      useAnalysisLayout.mockReturnValue('tablet');
    });

    it('should render horizontal scrolling cards for tablet', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that content is rendered for tablet layout
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument();
      expect(screen.getByText('Close Price: 123.45')).toBeInTheDocument();
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
      expect(screen.getByText('Compare MA20: 2.45 %')).toBeInTheDocument();
    });

    it('should show all report items in tablet layout', async () => {
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

      // Should show all report items in tablet layout
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument();  
      expect(screen.getByText('AAPL')).toBeInTheDocument();  
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('AMZN')).toBeInTheDocument();
    });
  });

  describe('Desktop Layout (Vertical)', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints, useAnalysisLayout } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: true,
        currentScreenSize: 'lg',
      });
      useAnalysisLayout.mockReturnValue('desktop');
    });

    it('should render vertical layout for desktop', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Check that all sections are rendered
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument();
      expect(screen.getByText('Close Price: 123.45')).toBeInTheDocument();

      // Check that content is visible
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Next Report Date')).toBeInTheDocument();
    });

    it('should show all report items in grid layout', async () => {
      queryClient.setQueryData(['analysisList', 'QQQ'], mockData);

      renderWithProvider(<AnalysisList />);

      // Should show all report items in desktop layout
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument(); // In title
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('2024-01-20')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    beforeEach(() => {
      const { useAnalysisBreakpoints, useAnalysisLayout } = require('../../../hooks/use-analysis-responsive');
      useAnalysisBreakpoints.mockReturnValue({
        shouldUseTabLayout: false,
        shouldUseVerticalLayout: false,
        shouldUseHorizontalLayout: true,
        currentScreenSize: 'lg',
      });
      useAnalysisLayout.mockReturnValue('desktop');
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
      
      // Component should still render other sections
      expect(screen.getByRole('heading', { name: 'QQQ' })).toBeInTheDocument();
      expect(screen.getByText('Close Price: 123.45')).toBeInTheDocument();
      expect(screen.getByText('RSI: 65.32')).toBeInTheDocument();
    });
  });
});