# Sentiment News Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard timer block with a sentiment news summary component that displays per-ticker sentiment scores fetched from `/news/getNewsSummary`.

**Architecture:** Rename `closePrice.tsx` → `dataService.tsx` and add the `getNewsSummary` fetch function + React Query hook there. A new `sentimentNews.tsx` component consumes that hook and renders a ticker-by-ticker sentiment list. The main `data.tsx` layout file swaps out `<CountdownTimer />` for `<SentimentNews />` in the bottom-left cell — no other layout changes.

**Tech Stack:** Next.js 15, React Query (@tanstack/react-query), TypeScript, Tailwind CSS, Luxon (for "last updated" timestamp)

---

## File Map

| Action               | Path                                                                                  | Responsibility                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Rename + modify      | `src/app/components/dashboard/closePrice.tsx` → `dataService.tsx`                     | All backend fetch functions + React Query hooks, including new `getNewsSummary` |
| Add type             | `src/app/utils/dto.tsx`                                                               | `NewsSummaryDTO` type                                                           |
| Update import        | `src/app/components/dashboard/list.tsx:2`                                             | Point to `./dataService`                                                        |
| Update import        | `src/app/components/dashboard/comprehensive.tsx:3`                                    | Point to `./dataService`                                                        |
| Update + add mock    | `src/app/components/dashboard/data.tsx`                                               | Swap timer → SentimentNews                                                      |
| Create               | `src/app/components/dashboard/sentimentNews.tsx`                                      | Sentiment display component                                                     |
| Rename + update      | `src/app/components/dashboard/__tests__/closePrice.test.tsx` → `dataService.test.tsx` | Tests for data-fetching hooks including new `NewsSummary` hook                  |
| Update mock path     | `src/app/components/dashboard/__tests__/comprehensive.test.tsx:21`                    | `jest.mock('../dataService', ...)`                                              |
| Update mock path     | `src/app/components/dashboard/__tests__/comprehensive-fixed.test.tsx:21`              | `jest.mock('../dataService', ...)`                                              |
| Update mock path     | `src/app/components/dashboard/__tests__/comprehensive-edge-cases.test.tsx:38`         | `jest.mock('../dataService', ...)`                                              |
| Update import + refs | `src/app/components/dashboard/__tests__/list.test.tsx`                                | `import * as dataService` + all `dataService.` call-sites                       |
| Update mock          | `src/app/components/dashboard/__tests__/data.test.tsx`                                | Mock `../sentimentNews` instead of `../timer`                                   |
| Create               | `src/app/components/dashboard/__tests__/sentimentNews.test.tsx`                       | Tests for SentimentNews component                                               |

---

## Task 1: Add `NewsSummaryDTO` to dto.tsx

**Files:**

- Modify: `src/app/utils/dto.tsx` (append after line 158)

- [ ] **Step 1: Add the type**

Open `src/app/utils/dto.tsx` and append at the bottom:

```typescript
export type NewsSummaryDTO = {
  ticker: string;
  hasData: boolean;
  score: number;
  label: string;
  confidence: 'high' | 'medium' | 'low';
  article_count: number;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or same errors as before this change).

- [ ] **Step 3: Commit**

```bash
git add src/app/utils/dto.tsx
git commit -m "feat: add NewsSummaryDTO type for news sentiment endpoint"
```

---

## Task 2: Rename closePrice.tsx → dataService.tsx and add getNewsSummary

**Files:**

- Delete: `src/app/components/dashboard/closePrice.tsx`
- Create: `src/app/components/dashboard/dataService.tsx`

- [ ] **Step 1: Write the new dataService.tsx**

Create `src/app/components/dashboard/dataService.tsx` with all existing exports intact plus the new `NewsSummary` hook:

```typescript
import {
  StockClosePriceList,
  StockDTO,
  PreviousPriceDTO,
  PreviousPriceList,
  NewsSummaryDTO,
} from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';

const getClosePrice = async (): Promise<StockClosePriceList> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/daily`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });
  const stocks: StockDTO[] = await res.json();
  const stocksBySymbol: StockClosePriceList = stocks.reduce<
    Record<string, StockDTO>
  >((acc, stock) => {
    acc[stock.symbol] = stock;
    return acc;
  }, {});
  return stocksBySymbol;
};

const getPreviousPrice = async (symbol: string): Promise<PreviousPriceDTO> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/daily/previousDayPrice?symbol=${symbol}&range=1D`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const ClosePrices = () => {
  return useQuery<StockClosePriceList, Error>({
    queryKey: ['closePrice'],
    queryFn: () => getClosePrice(),
  });
};

export const PreviousPrice = (symbol: string) => {
  return useQuery<PreviousPriceDTO, Error>({
    queryKey: ['previousPrice', symbol],
    queryFn: () => getPreviousPrice(symbol),
    enabled: !!symbol,
  });
};

const getPreviousPrices = async (range: string): Promise<PreviousPriceList> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/daily/previousDayPrices?range=${range}`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const PreviousPrices = (range: string) => {
  return useQuery<PreviousPriceList, Error>({
    queryKey: ['previousPrices', range],
    queryFn: () => getPreviousPrices(range),
    enabled: !!range,
  });
};

const getNewsSummary = async (): Promise<NewsSummaryDTO[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/news/getNewsSummary`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const NewsSummary = () => {
  return useQuery<NewsSummaryDTO[], Error>({
    queryKey: ['newsSummary'],
    queryFn: () => getNewsSummary(),
    staleTime: 5 * 60 * 1000,
  });
};
```

- [ ] **Step 2: Delete old file**

```bash
rm /Users/ian/App/side_project/stock_monitoring/frontend/src/app/components/dashboard/closePrice.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only for the files that still import from `./closePrice` — those get fixed in Task 3.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/dashboard/dataService.tsx src/app/components/dashboard/closePrice.tsx
git commit -m "feat: rename closePrice to dataService, add NewsSummary hook"
```

---

## Task 3: Update all non-test imports from closePrice → dataService

**Files:**

- Modify: `src/app/components/dashboard/list.tsx:2`
- Modify: `src/app/components/dashboard/comprehensive.tsx:3`

- [ ] **Step 1: Update list.tsx**

In `src/app/components/dashboard/list.tsx`, change line 2:

```typescript
// Before
import { ClosePrices, PreviousPrices } from './closePrice';

// After
import { ClosePrices, PreviousPrices } from './dataService';
```

- [ ] **Step 2: Update comprehensive.tsx**

In `src/app/components/dashboard/comprehensive.tsx`, change line 3:

```typescript
// Before
import { ClosePrices } from './closePrice';

// After
import { ClosePrices } from './dataService';
```

- [ ] **Step 3: Verify TypeScript compiles clean**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/dashboard/list.tsx src/app/components/dashboard/comprehensive.tsx
git commit -m "fix: update closePrice imports to dataService in list and comprehensive"
```

---

## Task 4: Update test files — rename closePrice.test.tsx and fix all test mock paths

**Files:**

- Delete: `src/app/components/dashboard/__tests__/closePrice.test.tsx`
- Create: `src/app/components/dashboard/__tests__/dataService.test.tsx`
- Modify: `src/app/components/dashboard/__tests__/comprehensive.test.tsx:21`
- Modify: `src/app/components/dashboard/__tests__/comprehensive-fixed.test.tsx:21`
- Modify: `src/app/components/dashboard/__tests__/comprehensive-edge-cases.test.tsx:38`
- Modify: `src/app/components/dashboard/__tests__/list.test.tsx:5,12` + all `closePrice.` references

- [ ] **Step 1: Rename closePrice.test.tsx → dataService.test.tsx**

Create `src/app/components/dashboard/__tests__/dataService.test.tsx` with the content of the old `closePrice.test.tsx`, updating the import on line 4:

```typescript
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreviousPrice } from '../dataService';
import type { PreviousPriceDTO } from '@/utils/dto';

describe('PreviousPrice Hook', () => {
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
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('fetches previous price for a symbol', async () => {
    const mockData: PreviousPriceDTO = {
      _id: '507f1f77bcf86cd799439011',
      datetime: '2026-02-21T00:00:00.000Z',
      close: 348.5,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => PreviousPrice('QQQ'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API}/daily/previousDayPrice?symbol=QQQ&range=1D`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
        },
      }
    );
  });

  test('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => PreviousPrice('TQQQ'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  test('does not fetch when symbol is empty', () => {
    const { result } = renderHook(() => PreviousPrice(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles HTTP 404 error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Symbol not found' }),
    });

    const { result } = renderHook(() => PreviousPrice('INVALID'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('404');
  });

  test('handles HTTP 401 authentication error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => PreviousPrice('QQQ'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('401');
  });
});
```

Then delete the old file:

```bash
rm /Users/ian/App/side_project/stock_monitoring/frontend/src/app/components/dashboard/__tests__/closePrice.test.tsx
```

- [ ] **Step 2: Update comprehensive.test.tsx mock path**

In `src/app/components/dashboard/__tests__/comprehensive.test.tsx`, change line 21:

```typescript
// Before
jest.mock('../closePrice', () => ({

// After
jest.mock('../dataService', () => ({
```

Also update line 70:

```typescript
// Before
import { ClosePrices } from '../closePrice';

// After
import { ClosePrices } from '../dataService';
```

- [ ] **Step 3: Update comprehensive-fixed.test.tsx mock path**

In `src/app/components/dashboard/__tests__/comprehensive-fixed.test.tsx`, change line 21:

```typescript
// Before
jest.mock('../closePrice', () => ({

// After
jest.mock('../dataService', () => ({
```

Also update line 69:

```typescript
// Before
import { ClosePrices } from '../closePrice';

// After
import { ClosePrices } from '../dataService';
```

- [ ] **Step 4: Update comprehensive-edge-cases.test.tsx mock path**

In `src/app/components/dashboard/__tests__/comprehensive-edge-cases.test.tsx`, change line 38:

```typescript
// Before
jest.mock('../closePrice', () => ({

// After
jest.mock('../dataService', () => ({
```

Also update line 62:

```typescript
// Before
import { ClosePrices } from '../closePrice';

// After
import { ClosePrices } from '../dataService';
```

- [ ] **Step 5: Update list.test.tsx — import and all call-site references**

In `src/app/components/dashboard/__tests__/list.test.tsx`:

Line 5:

```typescript
// Before
import * as closePrice from '../closePrice';

// After
import * as dataService from '../dataService';
```

Line 12:

```typescript
// Before
jest.mock('../closePrice');

// After
jest.mock('../dataService');
```

For every `closePrice.ClosePrices` and `closePrice.PreviousPrices` reference in the file, replace with `dataService.ClosePrices` and `dataService.PreviousPrices` respectively. There are ~20 such references — use a global find-replace on the string `closePrice.` → `dataService.` within that file only.

- [ ] **Step 6: Run all tests to verify nothing broken**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="dashboard" 2>&1 | tail -30
```

Expected: all previously-passing tests still pass. The `dataService.test.tsx` suite should now pass in place of the old `closePrice.test.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/dashboard/__tests__/
git commit -m "fix: update all test files from closePrice to dataService mock paths"
```

---

## Task 5: Create SentimentNews component

**Files:**

- Create: `src/app/components/dashboard/sentimentNews.tsx`

- [ ] **Step 1: Write the failing test first**

Create `src/app/components/dashboard/__tests__/sentimentNews.test.tsx`:

```typescript
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
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: true, isError: false, data: undefined });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-loading')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: false, isError: true, data: undefined });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-error')).toBeInTheDocument();
  });

  it('shows empty state when data is empty array', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: [] });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-empty')).toBeInTheDocument();
  });

  it('renders a row for each ticker with data', () => {
    (NewsSummary as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { ticker: 'NVDA', hasData: true, score: 0.2905, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
        { ticker: 'TSLA', hasData: true, score: 0.107, label: 'Neutral', confidence: 'medium', article_count: 22 },
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
        { ticker: 'NVDA', hasData: true, score: 0.2905, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
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
        { ticker: 'NVDA', hasData: true, score: 0.29, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
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
        { ticker: 'NVDA', hasData: false, score: 0, label: '', confidence: 'low', article_count: 0 },
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
        { ticker: 'NVDA', hasData: true, score: 0.29, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
      ],
    });
    renderWithQuery(<SentimentNews />);
    expect(screen.getByTestId('sentiment-updated')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="sentimentNews" 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '../sentimentNews'`

- [ ] **Step 3: Create sentimentNews.tsx**

Create `src/app/components/dashboard/sentimentNews.tsx`:

```typescript
'use client';

import { NewsSummary } from './dataService';
import { DateTime } from 'luxon';
import type { NewsSummaryDTO } from '@/utils/dto';

const LABEL_COLORS: Record<string, string> = {
  Bullish: 'text-green-400',
  'Somewhat Bullish': 'text-emerald-400',
  Neutral: 'text-gray-400',
  'Somewhat Bearish': 'text-amber-400',
  Bearish: 'text-red-400',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green-300',
  medium: 'text-gray-300',
  low: 'text-gray-500',
};

function labelColor(label: string): string {
  return LABEL_COLORS[label] ?? 'text-gray-400';
}

function confidenceColor(confidence: string): string {
  return CONFIDENCE_COLORS[confidence] ?? 'text-gray-400';
}

function TickerRow({ item }: { item: NewsSummaryDTO }) {
  if (!item.hasData) {
    return (
      <div
        data-testid={`sentiment-no-data-${item.ticker}`}
        className="flex items-center justify-between py-1 px-1 text-xs font-mono"
      >
        <span className="w-14 font-bold text-gray-300">{item.ticker}</span>
        <span className="text-gray-600 italic">no data</span>
      </div>
    );
  }

  return (
    <div
      data-testid={`sentiment-row-${item.ticker}`}
      className="flex items-center justify-between py-1 px-1 text-xs font-mono"
    >
      <span className="w-14 font-bold text-gray-200">{item.ticker}</span>
      <span className={`w-10 text-right ${labelColor(item.label)}`}>
        {item.score.toFixed(2)}
      </span>
      <span className={`flex-1 text-center text-[10px] ${labelColor(item.label)}`}>
        {item.label}
      </span>
      <span className={`w-12 text-right text-[10px] ${confidenceColor(item.confidence)}`}>
        {item.confidence}
      </span>
      <span className="w-8 text-right text-gray-500">{item.article_count}</span>
    </div>
  );
}

const SentimentNews = () => {
  const { isLoading, isError, data } = NewsSummary();
  const updatedAt = DateTime.now().toFormat('HH:mm:ss');

  if (isLoading) {
    return (
      <div
        data-testid="sentiment-loading"
        className="flex items-center justify-center h-full text-xs font-mono text-gray-500"
      >
        Loading sentiment…
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="sentiment-error"
        className="flex items-center justify-center h-full text-xs font-mono text-red-500"
      >
        Failed to load sentiment
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        data-testid="sentiment-empty"
        className="flex items-center justify-center h-full text-xs font-mono text-gray-600"
      >
        No sentiment data
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-2 py-2 font-mono">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 px-1">
        News Sentiment
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {data.map((item) => (
          <TickerRow key={item.ticker} item={item} />
        ))}
      </div>
      <div
        data-testid="sentiment-updated"
        className="text-[9px] text-gray-600 text-right pt-1 border-t border-gray-800 mt-1"
      >
        updated {updatedAt}
      </div>
    </div>
  );
};

export default SentimentNews;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="sentimentNews" 2>&1 | tail -20
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/dashboard/sentimentNews.tsx src/app/components/dashboard/__tests__/sentimentNews.test.tsx
git commit -m "feat: add SentimentNews component with loading/error/empty states and color-coded labels"
```

---

## Task 6: Integrate SentimentNews into dashboard layout

**Files:**

- Modify: `src/app/components/dashboard/data.tsx`
- Modify: `src/app/components/dashboard/__tests__/data.test.tsx`

- [ ] **Step 1: Write the updated test first**

In `src/app/components/dashboard/__tests__/data.test.tsx`, change line 9 to mock `sentimentNews` instead of `timer`, and update the assertion:

```typescript
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
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="dashboard/__tests__/data" 2>&1 | tail -20
```

Expected: FAIL — the third test looks for `sentiment-news` testid but `data.tsx` still renders the timer.

- [ ] **Step 3: Update data.tsx**

In `src/app/components/dashboard/data.tsx`, make two changes:

Replace the timer import:

```typescript
// Before
import CountdownTimer from '@/components/dashboard/timer';

// After
import SentimentNews from '@/components/dashboard/sentimentNews';
```

Replace the timer JSX block (the third `<div>` starting at the `{/* Timer */}` comment):

```tsx
// Before
{
  /* Timer — hidden on mobile, col 1 row 2 on desktop */
}
<div className="md:row-start-2 hidden md:flex border border-black dark:border-white items-center justify-center p-4">
  <CountdownTimer />
</div>;

// After
{
  /* Sentiment News — hidden on mobile, col 1 row 2 on desktop */
}
<div className="md:row-start-2 hidden md:flex border border-black dark:border-white overflow-hidden">
  <SentimentNews />
</div>;
```

- [ ] **Step 4: Run the layout test suite**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="dashboard/__tests__/data" 2>&1 | tail -20
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Run all dashboard tests**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="dashboard" 2>&1 | tail -30
```

Expected: all suites pass. No regressions in comprehensive, list, timer, or IndicatorSummary tests.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/dashboard/data.tsx src/app/components/dashboard/__tests__/data.test.tsx
git commit -m "feat: replace timer block with SentimentNews in dashboard layout"
```

---

## Self-Review Against Spec

### Spec Coverage Check

| Requirement                                                   | Covered By                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Create branch `feature/sentiment-news`                        | Done before plan (already on branch)                            |
| Rename `closePrice` → `dataService`                           | Task 2                                                          |
| Add `getNewsSummary` function to dataService                  | Task 2, Step 1                                                  |
| `GET /news/getNewsSummary` endpoint                           | Task 2, Step 1                                                  |
| `NewsSummaryDTO` response type                                | Task 1                                                          |
| Update all imports across codebase (non-test)                 | Task 3                                                          |
| Update all imports across codebase (test files)               | Task 4                                                          |
| Create `sentimentNews.tsx` component                          | Task 5                                                          |
| Display ticker, score (2dp), label, confidence, article_count | Task 5, Step 3                                                  |
| Green tones for bullish labels                                | Task 5, Step 3 — `text-green-400` / `text-emerald-400`          |
| Neutral gray                                                  | Task 5, Step 3 — `text-gray-400`                                |
| Red/amber for bearish                                         | Task 5, Step 3 — `text-amber-400` / `text-red-400`              |
| `hasData: false` → muted "no data" row                        | Task 5, Step 3 (`TickerRow` no-data branch)                     |
| "Last updated" timestamp                                      | Task 5, Step 3 (`sentiment-updated` testid)                     |
| Only occupies timer block space                               | Task 6 — same wrapping `div` classes, no other changes          |
| No other layout/grid changes                                  | Task 6 — only the inner content of the bottom-left cell changes |
| Dark/monospace aesthetic                                      | Task 5 — `font-mono`, dark grays, green accents                 |
| Replace `<CountdownTimer />` in data.tsx                      | Task 6, Step 3                                                  |
| Integration test verifies panel placement                     | Task 6, Step 1 — `md:row-start-2` assertion                     |

### Placeholder Scan

No TBDs, TODOs, or "handle edge cases" stubs found. All code blocks are complete.

### Type Consistency

- `NewsSummaryDTO` defined in Task 1, imported in Task 2 (`dataService.tsx`), imported in Task 5 (`sentimentNews.tsx`). ✓
- `NewsSummary` hook exported in Task 2, imported in Task 5. ✓
- `data-testid` values used in tests match those in component: `sentiment-loading`, `sentiment-error`, `sentiment-empty`, `sentiment-row-${ticker}`, `sentiment-no-data-${ticker}`, `sentiment-updated`. ✓
- `ClosePrices`, `PreviousPrices`, `PreviousPrice`, `PreviousPrices` — all exported from `dataService.tsx` with same signatures as original `closePrice.tsx`. ✓
