import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../dataService', () => ({
  NewsSummary: jest.fn(),
}));

import { NewsSummary } from '../dataService';
import SentimentNews from '../sentimentNews';

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SentimentNews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-loading')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-error')).toBeInTheDocument();
  });

  it('shows empty state when data is empty array', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-empty')).toBeInTheDocument();
  });

  it('renders a row for each ticker with data', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          ticker: 'NVDA',
          hasData: true,
          score: 0.2905,
          label: 'Somewhat Bullish',
          confidence: 'medium',
          article_count: 11,
        },
        {
          ticker: 'TSLA',
          hasData: true,
          score: 0.107,
          label: 'Neutral',
          confidence: 'medium',
          article_count: 22,
        },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-row-NVDA')).toBeInTheDocument();
    expect(screen.getByTestId('sentiment-row-TSLA')).toBeInTheDocument();
  });

  it('displays score to 2 decimal places', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          ticker: 'NVDA',
          hasData: true,
          score: 0.2905,
          label: 'Somewhat Bullish',
          confidence: 'medium',
          article_count: 11,
        },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-row-NVDA')).toHaveTextContent('0.29');
  });

  it('shows article count', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          ticker: 'NVDA',
          hasData: true,
          score: 0.29,
          label: 'Somewhat Bullish',
          confidence: 'medium',
          article_count: 11,
        },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-row-NVDA')).toHaveTextContent('11');
  });

  it('shows no-data indicator when hasData is false', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          ticker: 'NVDA',
          hasData: false,
          score: 0,
          label: '',
          confidence: 'low',
          article_count: 0,
        },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-no-data-NVDA')).toBeInTheDocument();
  });

  it('renders last-updated timestamp', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          ticker: 'NVDA',
          hasData: true,
          score: 0.29,
          label: 'Somewhat Bullish',
          confidence: 'medium',
          article_count: 11,
        },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-updated')).toBeInTheDocument();
  });
});
