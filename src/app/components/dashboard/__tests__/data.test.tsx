import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock child components so we only test the layout wiring
jest.mock('../list', () => () => <div data-testid="list" />);
jest.mock('../comprehensive', () => () => <div data-testid="chart" />);
jest.mock('../IndicatorSummary', () => () => <div data-testid="indicators" />);
jest.mock('../sentimentNews', () => () => <div data-testid="sentiment-news" />);

import DashboardPage from '../data';

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('DashboardPage layout', () => {
  it('renders the list panel with responsive classes', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const list = getByTestId('list').parentElement!;
    expect(list.className).toContain('md:row-span-1');
  });

  it('renders the right panel with md:col-span-2 and md:row-span-2', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const right = getByTestId('right-panel');
    expect(right.className).toContain('md:col-span-2');
    expect(right.className).toContain('md:row-span-2');
  });

  it('renders the sentiment-news panel with md:row-start-2', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const sentimentPanel = getByTestId('sentiment-news').parentElement!;
    expect(sentimentPanel.className).toContain('md:row-start-2');
  });
});
