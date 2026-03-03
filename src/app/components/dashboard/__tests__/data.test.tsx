import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock child components so we only test the layout wiring
jest.mock('../list', () => () => <div data-testid="list" />);
jest.mock('../comprehensive', () => () => <div data-testid="chart" />);
jest.mock('../IndicatorSummary', () => () => <div data-testid="indicators" />);
jest.mock('../timer', () => () => <div data-testid="timer" />);

import DashboardPage from '../data';

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('DashboardPage layout', () => {
  it('renders the list panel with responsive classes', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const list = getByTestId('list').parentElement!;
    // On mobile this panel should be full-width (no col-span or grid placement)
    // On desktop it participates in grid — test that md: prefix classes are present
    expect(list.className).toContain('md:row-span-1');
  });

  it('renders the right panel with md:col-span-2 and md:row-span-2', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const right = getByTestId('right-panel');
    expect(right.className).toContain('md:col-span-2');
    expect(right.className).toContain('md:row-span-2');
  });

  it('renders the timer panel with md:row-start-2', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const timer = getByTestId('timer').parentElement!;
    expect(timer.className).toContain('md:row-start-2');
  });
});
