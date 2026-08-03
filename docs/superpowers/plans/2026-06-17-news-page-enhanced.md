# News Page Enhanced Implementation Plan

Before implementing, read the existing news page component files carefully, especially `data.tsx`, to understand the current structure.

Then implement the following plan task by task. One important adjustment before starting:

**isLoading logic adjustment (applies to Task 8):**
Split the loading state into two separate concerns instead of combining them:
- Show the full skeleton grid ONLY when `summaryQuery.isLoading` is true (first page load)
- When `tickerNewsQuery` is loading (after a ticker is selected), keep the `TickerFilter` visible and show a loading indicator only in the content area below it — do not replace the entire page with skeletons

This prevents the ticker filter from disappearing while news articles are being fetched after a ticker selection.

**image field (applies to Task 8, `toDisplayArticles`):**
The `getNews` API response does not include a banner image. Set `image: ''` and confirm that `NewsCard` gracefully shows the existing image-error fallback state when image is empty — no changes needed to the card image logic, just verify the fallback renders correctly.

**`handleError` path:**
Before writing Task 8, verify that `@/utils/error` exists and exports `handleError`. If it does not exist, replace the `handleError` calls with `console.error` instead — do not create the utility from scratch.

---

Now implement the plan below exactly as written, task by task:

[PASTE THE FULL PLAN DOCUMENT HERE]

**Important constraint:** The news page requires a ticker parameter to fetch data.
There is no "all articles" view. The page should:
1. Start with no data and no ticker selected
2. Show a "Select a ticker to view news" prompt until a ticker is chosen
3. Remove the "All" pill from TickerFilter, or mark it as disabled/hidden
4. Only call the getNews API when a ticker is selected (enabled: !!ticker in useQuery)
5. Selecting a different ticker replaces the current articles

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the news page with a ticker pill filter bar (Phase 1), an aggregate sentiment bar (Phase 2), and per-article sentiment scores with source/time in a card bottom row (Phase 3).

**Architecture:** Lift state (`selectedTicker`, initially `null`) into `data.tsx` which orchestrates two React Query hooks — `NewsSummary()` for pills (always on) and `TickerNews(ticker)` for filtered articles (`enabled: !!ticker` — never fetches until a ticker is picked). Two new pure components (`TickerFilter`, `SentimentBar`) receive data as props; `TickerFilter` has no "All" option since there is no all-articles view. Until a ticker is selected, `data.tsx` renders a "select a ticker" prompt instead of the grid. `NewsCard` is extended with optional bottom-row fields via a unified `DisplayArticle` type that replaces the direct `NewsDTO` usage. Relative time lives in `formatters.ts` for isolated testability.

**Tech Stack:** Next.js 15, React Query (@tanstack/react-query), TypeScript, Tailwind CSS, Luxon (relative time), shadcn/ui

---

## Existing Structure (read before touching any file)

```
src/app/components/news/
  data.tsx          ← NewsData component: fetches getNews(), paginates, renders NewsGrid
  NewsCard.tsx      ← Card: image + headline (uses NewsDTO)
  NewsCardSkeleton.tsx ← Loading skeleton
  NewsGrid.tsx      ← Grid of NewsCard, receives NewsDTO[]

src/app/news/page.page.tsx   ← Thin wrapper: <NewsData />
src/app/utils/api.tsx        ← getNews() fetches /news/getNews → NewsDTO[]
src/app/utils/dto.tsx        ← NewsDTO (no sentiment fields)
src/app/components/dashboard/dataService.tsx ← NewsSummary() hook already present
```

**What changes:**
- `dto.tsx` — add 4 new types
- `dataService.tsx` — add `getTickerNews` (ticker required) + `TickerNews` hook with `enabled: !!ticker`
- `formatters.ts` — add `getRelativeTime`
- `NewsCard.tsx` — accept `DisplayArticle` instead of `NewsDTO`, add bottom row
- `NewsGrid.tsx` — use `DisplayArticle[]`
- `data.tsx` — add `selectedTicker` state (starts `null`), `NewsSummary` + `TickerNews` queries, render `TickerFilter` + a "select a ticker" prompt or (`SentimentBar` + `NewsGrid`)
- New: `TickerFilter.tsx` (no "All" pill), `SentimentBar.tsx`
- New tests: `news/__tests__/TickerFilter.test.tsx`, `SentimentBar.test.tsx`, `NewsCard.test.tsx`, `data.test.tsx`
- `public/locales/en/translation.json`, `public/locales/zh/translation.json` — add `news_select_ticker_prompt` key

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/utils/dto.tsx` | Add `NewsArticleDTO`, `TickerNewsAggregateDTO`, `TickerNewsResponseDTO`, `DisplayArticle` |
| Modify | `src/app/components/dashboard/dataService.tsx` | Add `getTickerNews` fetch + `TickerNews` hook |
| Modify | `src/app/utils/formatters.ts` | Add `getRelativeTime(publishedAt, now?)` |
| Modify | `src/app/utils/__tests__/formatters.test.ts` | Tests for `getRelativeTime` |
| Create | `src/app/components/news/TickerFilter.tsx` | Pill filter bar (pure component) |
| Create | `src/app/components/news/SentimentBar.tsx` | Aggregate sentiment bar (pure component) |
| Modify | `src/app/components/news/NewsCard.tsx` | Accept `DisplayArticle`, add optional bottom row |
| Modify | `src/app/components/news/NewsGrid.tsx` | Accept `DisplayArticle[]` |
| Modify | `src/app/components/news/data.tsx` | Wire state + both hooks + conditional rendering (prompt vs. grid) |
| Modify | `public/locales/en/translation.json` | Add `news_select_ticker_prompt` |
| Modify | `public/locales/zh/translation.json` | Add `news_select_ticker_prompt` |
| Create | `src/app/components/news/__tests__/TickerFilter.test.tsx` | |
| Create | `src/app/components/news/__tests__/SentimentBar.test.tsx` | |
| Create | `src/app/components/news/__tests__/NewsCard.test.tsx` | |
| Create | `src/app/components/news/__tests__/data.test.tsx` | |

---

## Task 1: Add new DTO types to dto.tsx

**Files:**
- Modify: `src/app/utils/dto.tsx` (append after `NewsSummaryDTO`)

- [ ] **Step 1: Append the four new types**

Add to the bottom of `src/app/utils/dto.tsx`:

```typescript
export type NewsArticleDTO = {
  title: string;
  url: string;
  source: string;
  source_domain: string;
  publishedAt: string;
  sentiment_score: number;
  relevance_score: number;
};

export type TickerNewsAggregateDTO = {
  score: number;
  label: string;
  confidence: 'high' | 'medium' | 'low';
  article_count: number;
};

export type TickerNewsResponseDTO = {
  ticker: string;
  period: string;
  aggregate: TickerNewsAggregateDTO;
  articles: NewsArticleDTO[];
};

export type DisplayArticle = {
  id: string;
  headline: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
  sentimentScore?: number;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | grep -v "test\|strategyEngine"
```

Expected: no output (no new errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/utils/dto.tsx
git commit -m "feat: add NewsArticleDTO, TickerNewsResponseDTO, DisplayArticle types"
```

---

## Task 2: Add `getTickerNews` hook to dataService.tsx

**Files:**
- Modify: `src/app/components/dashboard/dataService.tsx` (append after `NewsSummary`)

- [ ] **Step 1: Append the fetch function and hook**

Add to the bottom of `src/app/components/dashboard/dataService.tsx`:

```typescript
import { TickerNewsResponseDTO } from '@/utils/dto';

const getTickerNews = async (ticker: string): Promise<TickerNewsResponseDTO> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/news?ticker=${ticker}`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const TickerNews = (ticker: string | null) => {
  return useQuery<TickerNewsResponseDTO, Error>({
    queryKey: ['tickerNews', ticker],
    queryFn: () => getTickerNews(ticker as string),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });
};
```

There is no "all articles" fetch path — `getTickerNews` always takes a real ticker, and the query above never runs until `ticker` is truthy (constraint #4: only call the API once a ticker is selected).

Also update the import at the top of `dataService.tsx` to include the new type. The existing import line is:

```typescript
import {
  StockClosePriceList,
  StockDTO,
  PreviousPriceDTO,
  PreviousPriceList,
  NewsSummaryDTO,
} from '@/utils/dto';
```

Change it to:

```typescript
import {
  StockClosePriceList,
  StockDTO,
  PreviousPriceDTO,
  PreviousPriceList,
  NewsSummaryDTO,
  TickerNewsResponseDTO,
} from '@/utils/dto';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | grep -v "test\|strategyEngine"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/dashboard/dataService.tsx
git commit -m "feat: add getTickerNews fetch and TickerNews hook to dataService"
```

---

## Task 3: Add `getRelativeTime` to formatters.ts (TDD)

**Files:**
- Modify: `src/app/utils/formatters.ts`
- Modify: `src/app/utils/__tests__/formatters.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to the bottom of `src/app/utils/__tests__/formatters.test.ts`:

```typescript
import { DateTime } from 'luxon';
import { getRelativeTime } from '../formatters';

describe('getRelativeTime', () => {
  const baseNow = DateTime.fromISO('2026-06-17T12:00:00Z');

  it('returns minutes for timestamps less than 1 hour ago', () => {
    const publishedAt = '2026-06-17T11:30:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('30m');
  });

  it('returns hours for timestamps 1-23 hours ago', () => {
    const publishedAt = '2026-06-17T10:00:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('2h');
  });

  it('returns days for timestamps 24+ hours ago', () => {
    const publishedAt = '2026-06-16T12:00:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('1d');
  });

  it('returns multiple days correctly', () => {
    const publishedAt = '2026-06-14T12:00:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('3d');
  });

  it('floors hours (not rounds)', () => {
    const publishedAt = '2026-06-17T09:31:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('2h');
  });

  it('floors minutes (not rounds)', () => {
    const publishedAt = '2026-06-17T11:31:00Z';
    expect(getRelativeTime(publishedAt, baseNow)).toBe('28m');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="formatters" --forceExit 2>&1 | tail -15
```

Expected: FAIL — `getRelativeTime is not a function`

- [ ] **Step 3: Implement `getRelativeTime` in formatters.ts**

Add to the bottom of `src/app/utils/formatters.ts`:

```typescript
import { DateTime } from 'luxon';

export function getRelativeTime(publishedAt: string, now: DateTime = DateTime.now()): string {
  const dt = DateTime.fromISO(publishedAt);
  const diff = now.diff(dt, ['days', 'hours', 'minutes']).toObject();

  const days = Math.floor(diff.days ?? 0);
  const hours = Math.floor(diff.hours ?? 0);
  const minutes = Math.floor(diff.minutes ?? 0);

  if (days >= 1) return `${days}d`;
  if (hours >= 1) return `${hours}h`;
  return `${minutes}m`;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="formatters" --forceExit 2>&1 | tail -15
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/formatters.ts src/app/utils/__tests__/formatters.test.ts
git commit -m "feat: add getRelativeTime utility to formatters"
```

---

## Task 4: Create `TickerFilter` component (Phase 1, TDD)

**Files:**
- Create: `src/app/components/news/TickerFilter.tsx`
- Create: `src/app/components/news/__tests__/TickerFilter.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/app/components/news/__tests__/TickerFilter.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TickerFilter from '../TickerFilter';
import type { NewsSummaryDTO } from '@/utils/dto';

const tickers: NewsSummaryDTO[] = [
  { ticker: 'NVDA', hasData: true, score: 0.29, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
  { ticker: 'TSLA', hasData: true, score: 0.11, label: 'Neutral', confidence: 'medium', article_count: 22 },
  { ticker: 'PLTR', hasData: false, score: 0, label: '', confidence: 'low', article_count: 0 },
];

describe('TickerFilter', () => {
  it('renders a pill per ticker', () => {
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={() => {}} articleCount={0} period="7d" />);
    expect(screen.getByTestId('pill-NVDA')).toBeInTheDocument();
    expect(screen.getByTestId('pill-TSLA')).toBeInTheDocument();
    expect(screen.getByTestId('pill-PLTR')).toBeInTheDocument();
  });

  it('does not render an All pill', () => {
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={() => {}} articleCount={0} period="7d" />);
    expect(screen.queryByTestId('pill-all')).not.toBeInTheDocument();
  });

  it('marks no pill as active when selectedTicker is null', () => {
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={() => {}} articleCount={0} period="7d" />);
    expect(screen.getByTestId('pill-NVDA')).toHaveAttribute('data-active', 'false');
    expect(screen.getByTestId('pill-TSLA')).toHaveAttribute('data-active', 'false');
  });

  it('marks ticker pill as active when that ticker is selected', () => {
    render(<TickerFilter tickers={tickers} selectedTicker="NVDA" onSelect={() => {}} articleCount={11} period="7d" />);
    expect(screen.getByTestId('pill-NVDA')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('pill-TSLA')).toHaveAttribute('data-active', 'false');
  });

  it('marks pill with hasData false as disabled', () => {
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={() => {}} articleCount={0} period="7d" />);
    expect(screen.getByTestId('pill-PLTR')).toHaveAttribute('data-disabled', 'true');
  });

  it('calls onSelect with ticker when a ticker pill is clicked', () => {
    const onSelect = jest.fn();
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={onSelect} articleCount={0} period="7d" />);
    fireEvent.click(screen.getByTestId('pill-NVDA'));
    expect(onSelect).toHaveBeenCalledWith('NVDA');
  });

  it('does not call onSelect when disabled pill is clicked', () => {
    const onSelect = jest.fn();
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={onSelect} articleCount={0} period="7d" />);
    fireEvent.click(screen.getByTestId('pill-PLTR'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not show article count when no ticker is selected', () => {
    render(<TickerFilter tickers={tickers} selectedTicker={null} onSelect={() => {}} articleCount={0} period="7d" />);
    expect(screen.queryByTestId('article-count')).not.toBeInTheDocument();
  });

  it('shows article count and period once a ticker is selected', () => {
    render(<TickerFilter tickers={tickers} selectedTicker="NVDA" onSelect={() => {}} articleCount={11} period="7d" />);
    expect(screen.getByTestId('article-count')).toHaveTextContent('11 articles · 7d');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="TickerFilter" --forceExit 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '../TickerFilter'`

- [ ] **Step 3: Create TickerFilter.tsx**

Create `src/app/components/news/TickerFilter.tsx`:

```typescript
'use client';

import type { NewsSummaryDTO } from '@/utils/dto';

interface TickerFilterProps {
  tickers: NewsSummaryDTO[];
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  articleCount: number;
  period: string;
}

const TickerFilter = ({
  tickers,
  selectedTicker,
  onSelect,
  articleCount,
  period,
}: TickerFilterProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-3 font-mono">
      <div className="flex items-center gap-2 flex-wrap">
        {tickers.map((t) => (
          <button
            key={t.ticker}
            data-testid={`pill-${t.ticker}`}
            data-active={selectedTicker === t.ticker}
            data-disabled={!t.hasData}
            onClick={() => t.hasData && onSelect(t.ticker)}
            disabled={!t.hasData}
            className={`px-3 py-1 rounded-full border text-xs font-mono transition-colors ${
              !t.hasData
                ? 'border-gray-700 text-gray-600 cursor-not-allowed opacity-40'
                : selectedTicker === t.ticker
                ? 'border-green-400 text-green-400 bg-green-400/10'
                : 'border-gray-600 text-gray-400 hover:border-gray-400 cursor-pointer'
            }`}
          >
            {t.ticker}
          </button>
        ))}
      </div>

      {selectedTicker !== null && (
        <span
          data-testid="article-count"
          className="text-xs text-gray-500 font-mono whitespace-nowrap"
        >
          {articleCount} articles · {period}
        </span>
      )}
    </div>
  );
};

export default TickerFilter;
```

There is no "All" pill — per constraint #3, the only way to view news is to pick a real ticker. `selectedTicker` stays `string | null` so the parent can represent "nothing chosen yet" (no pill highlighted, no article-count shown), but `onSelect` only ever receives a concrete ticker string.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="TickerFilter" --forceExit 2>&1 | tail -15
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/news/TickerFilter.tsx src/app/components/news/__tests__/TickerFilter.test.tsx
git commit -m "feat: add TickerFilter pill component for news page (Phase 1)"
```

---

## Task 5: Create `SentimentBar` component (Phase 2, TDD)

**Files:**
- Create: `src/app/components/news/SentimentBar.tsx`
- Create: `src/app/components/news/__tests__/SentimentBar.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/app/components/news/__tests__/SentimentBar.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import SentimentBar from '../SentimentBar';
import type { TickerNewsAggregateDTO } from '@/utils/dto';

const aggregate: TickerNewsAggregateDTO = {
  score: 0.2905,
  label: 'Somewhat Bullish',
  confidence: 'medium',
  article_count: 11,
};

describe('SentimentBar', () => {
  it('renders nothing when aggregate is null', () => {
    const { container } = render(<SentimentBar ticker="NVDA" aggregate={null} period="7d" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows ticker name and weighted sentiment label', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-label')).toHaveTextContent('NVDA weighted sentiment');
  });

  it('shows score formatted with sign and 2 decimal places', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-score')).toHaveTextContent('+0.29');
  });

  it('shows negative score with minus sign', () => {
    render(<SentimentBar ticker="TSLA" aggregate={{ ...aggregate, score: -0.22 }} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-score')).toHaveTextContent('-0.22');
  });

  it('shows label badge', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-badge')).toHaveTextContent('Somewhat Bullish');
  });

  it('shows confidence level', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-confidence')).toHaveTextContent('confidence: medium');
  });

  it('shows article count and period', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-meta')).toHaveTextContent('11 articles');
    expect(screen.getByTestId('sentiment-bar-meta')).toHaveTextContent('past 7d');
  });

  it('applies green color class for positive score (> 0.15)', () => {
    render(<SentimentBar ticker="NVDA" aggregate={aggregate} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-score')).toHaveClass('text-[#4ade80]');
  });

  it('applies red color class for negative score (< -0.15)', () => {
    render(<SentimentBar ticker="TSLA" aggregate={{ ...aggregate, score: -0.3 }} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-score')).toHaveClass('text-[#f87171]');
  });

  it('applies gray color class for neutral score (-0.15 to 0.15)', () => {
    render(<SentimentBar ticker="TSLA" aggregate={{ ...aggregate, score: 0.05 }} period="7d" />);
    expect(screen.getByTestId('sentiment-bar-score')).toHaveClass('text-[#8b949e]');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="SentimentBar" --forceExit 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '../SentimentBar'`

- [ ] **Step 3: Create SentimentBar.tsx**

Create `src/app/components/news/SentimentBar.tsx`:

```typescript
'use client';

import type { TickerNewsAggregateDTO } from '@/utils/dto';

interface SentimentBarProps {
  ticker: string;
  aggregate: TickerNewsAggregateDTO | null;
  period: string;
}

function scoreColor(score: number): string {
  if (score > 0.15) return 'text-[#4ade80]';
  if (score < -0.15) return 'text-[#f87171]';
  return 'text-[#8b949e]';
}

function formatScore(score: number): string {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(2)}`;
}

const SentimentBar = ({ ticker, aggregate, period }: SentimentBarProps) => {
  if (!aggregate) return null;

  return (
    <div className="mx-2 mb-3 px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 font-mono flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <div
            data-testid="sentiment-bar-label"
            className="text-[10px] text-gray-500 uppercase tracking-widest mb-1"
          >
            {ticker} weighted sentiment
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="sentiment-bar-score"
              className={`text-3xl font-bold ${scoreColor(aggregate.score)}`}
            >
              {formatScore(aggregate.score)}
            </span>
            <span
              data-testid="sentiment-bar-badge"
              className="text-xs px-2 py-0.5 rounded border border-green-700 text-green-400 bg-green-900/30"
            >
              {aggregate.label}
            </span>
            <span
              data-testid="sentiment-bar-confidence"
              className="text-xs text-gray-500"
            >
              confidence: {aggregate.confidence}
            </span>
          </div>
        </div>
      </div>

      <div
        data-testid="sentiment-bar-meta"
        className="text-xs text-gray-500 text-right"
      >
        <div>{aggregate.article_count} articles</div>
        <div>past {period}</div>
      </div>
    </div>
  );
};

export default SentimentBar;
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="SentimentBar" --forceExit 2>&1 | tail -15
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/news/SentimentBar.tsx src/app/components/news/__tests__/SentimentBar.test.tsx
git commit -m "feat: add SentimentBar aggregate sentiment component (Phase 2)"
```

---

## Task 6: Update `NewsCard` to accept `DisplayArticle` and render bottom row (Phase 3, TDD)

**Files:**
- Modify: `src/app/components/news/NewsCard.tsx`
- Create: `src/app/components/news/__tests__/NewsCard.test.tsx`

The card currently uses `news: NewsDTO`. We switch to `article: DisplayArticle`. The only visual additions are the optional bottom row with source, relative time, and sentiment score. No other layout changes.

- [ ] **Step 1: Write the failing tests**

Create `src/app/components/news/__tests__/NewsCard.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsCard from '../NewsCard';
import type { DisplayArticle } from '@/utils/dto';

jest.mock('@/hooks/useNewsLayout', () => ({
  useNewsLayout: () => ({
    getImageClasses: () => 'w-full h-40 object-cover rounded-lg',
    getCardClasses: () => 'rounded-xl shadow-md p-4',
    getTitleClasses: () => 'text-base leading-6 line-clamp-3 font-medium',
    fixedCardHeight: '360px',
    truncateText: (t: string) => t,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const baseArticle: DisplayArticle = {
  id: 'abc',
  headline: 'NVIDIA Partners With LG Group',
  url: 'https://example.com',
  image: 'https://example.com/img.jpg',
  source: 'Yahoo Finance',
  publishedAt: '2026-06-17T10:00:00Z',
};

describe('NewsCard', () => {
  it('renders the headline', () => {
    render(<NewsCard article={baseArticle} />);
    expect(screen.getByRole('heading')).toHaveTextContent('NVIDIA Partners With LG Group');
  });

  it('links to the article url', () => {
    render(<NewsCard article={baseArticle} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
  });

  it('does not render bottom row when sentimentScore is undefined', () => {
    render(<NewsCard article={baseArticle} />);
    expect(screen.queryByTestId('card-bottom-row')).not.toBeInTheDocument();
  });

  it('renders bottom row when sentimentScore is defined', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: 0.796 }} />);
    expect(screen.getByTestId('card-bottom-row')).toBeInTheDocument();
  });

  it('shows source name in bottom row', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: 0.796 }} />);
    expect(screen.getByTestId('card-bottom-row')).toHaveTextContent('Yahoo Finance');
  });

  it('formats positive sentiment score with + sign and 3 decimals', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: 0.796 }} />);
    expect(screen.getByTestId('card-sentiment-score')).toHaveTextContent('+0.796');
  });

  it('formats negative sentiment score with - sign and 3 decimals', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: -0.225 }} />);
    expect(screen.getByTestId('card-sentiment-score')).toHaveTextContent('-0.225');
  });

  it('applies green class for positive score (> 0.15)', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: 0.796 }} />);
    expect(screen.getByTestId('card-sentiment-score')).toHaveClass('text-[#4ade80]');
  });

  it('applies red class for negative score (< -0.15)', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: -0.225 }} />);
    expect(screen.getByTestId('card-sentiment-score')).toHaveClass('text-[#f87171]');
  });

  it('applies gray class for neutral score', () => {
    render(<NewsCard article={{ ...baseArticle, sentimentScore: 0.05 }} />);
    expect(screen.getByTestId('card-sentiment-score')).toHaveClass('text-[#8b949e]');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="news/__tests__/NewsCard" --forceExit 2>&1 | tail -10
```

Expected: FAIL — tests reference `article` prop but component uses `news: NewsDTO`

- [ ] **Step 3: Update NewsCard.tsx**

Replace the full content of `src/app/components/news/NewsCard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { DisplayArticle } from '@/utils/dto';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';
import { getRelativeTime } from '@/utils/formatters';

interface NewsCardProps {
  article: DisplayArticle;
  minHeight?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

function sentimentColor(score: number): string {
  if (score > 0.15) return 'text-[#4ade80]';
  if (score < -0.15) return 'text-[#f87171]';
  return 'text-[#8b949e]';
}

function formatSentimentScore(score: number): string {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(3)}`;
}

const NewsCard = ({
  article,
  minHeight,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
}: NewsCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(!article.image);
  const { t } = useTranslation();
  const {
    getImageClasses,
    getCardClasses,
    getTitleClasses,
    fixedCardHeight,
    truncateText,
  } = useNewsLayout();

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const cardStyle = {
    height: minHeight || fixedCardHeight,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const truncatedHeadline = truncateText(article.headline);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl transition-all duration-200"
      onKeyDown={handleKeyDown}
      aria-label={`${t('news_read_article')}: ${truncatedHeadline}`}
      role="article"
      tabIndex={0}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
    >
      <Card className={getCardClasses()} style={cardStyle}>
        <CardHeader className="p-0 mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
          <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg overflow-hidden">
            {!imageError ? (
              <>
                {!imageLoaded && (
                  <div
                    className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center"
                    aria-label={t('news_image_loading')}
                    role="progressbar"
                    aria-busy="true"
                  >
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="sr-only">{t('news_image_loading_detail')}</span>
                  </div>
                )}
                <img
                  src={article.image}
                  alt={article.headline}
                  className={`${getImageClasses()} transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              </>
            ) : (
              <div
                className="w-full h-full bg-gray-300 flex flex-col items-center justify-center text-gray-500"
                role="img"
                aria-label={t('news_image_error')}
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-center" aria-hidden="true">
                  {t('news_image_error')}
                </span>
                <span className="sr-only">{t('news_image_error_detail')}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-grow flex flex-col justify-between">
          <h3
            className={getTitleClasses()}
            role="heading"
            aria-level={3}
            title={article.headline}
          >
            {truncatedHeadline}
          </h3>

          {article.sentimentScore !== undefined && (
            <div
              data-testid="card-bottom-row"
              className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50 text-[10px] font-mono"
            >
              <span className="text-gray-500">
                {article.source} · {getRelativeTime(article.publishedAt)}
              </span>
              <span
                data-testid="card-sentiment-score"
                className={sentimentColor(article.sentimentScore)}
              >
                {formatSentimentScore(article.sentimentScore)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
};

export default NewsCard;
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="news/__tests__/NewsCard" --forceExit 2>&1 | tail -15
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/news/NewsCard.tsx src/app/components/news/__tests__/NewsCard.test.tsx
git commit -m "feat: update NewsCard to DisplayArticle type, add sentiment bottom row (Phase 3)"
```

---

## Task 7: Update `NewsGrid` to use `DisplayArticle[]`

**Files:**
- Modify: `src/app/components/news/NewsGrid.tsx`

This is a type-only change — `NewsDTO[]` → `DisplayArticle[]`, and the prop passed to `NewsCard` changes from `news=` to `article=`.

- [ ] **Step 1: Update NewsGrid.tsx**

Replace the full content of `src/app/components/news/NewsGrid.tsx`:

```typescript
'use client';

import type { DisplayArticle } from '@/utils/dto';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';
import NewsCard from './NewsCard';

interface NewsGridProps {
  articles: DisplayArticle[];
}

const NewsGrid = ({ articles }: NewsGridProps) => {
  const { t } = useTranslation();
  const { getContainerClasses, fixedCardHeight } = useNewsLayout();

  return (
    <div
      className={getContainerClasses()}
      role="list"
      aria-label={t('news_list_aria_label', { count: articles.length })}
    >
      {articles.map((item, index) => (
        <div key={item.id} role="listitem">
          <NewsCard
            article={item}
            minHeight={fixedCardHeight}
            aria-posinset={index + 1}
            aria-setsize={articles.length}
          />
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | grep -v "test\|strategyEngine"
```

Expected: no output (note: `data.tsx` still imports old `NewsDTO` — that's fixed in Task 8).

- [ ] **Step 3: Commit**

```bash
git add src/app/components/news/NewsGrid.tsx
git commit -m "refactor: update NewsGrid to DisplayArticle[] prop"
```

---

## Task 8: Rewire `data.tsx` — state, hooks, conditional rendering (TDD)

**Files:**
- Modify: `src/app/components/news/data.tsx`
- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/zh/translation.json`
- Create: `src/app/components/news/__tests__/data.test.tsx`

This is the integration task. `data.tsx` orchestrates:
1. `NewsSummary()` from `dataService` — always runs, provides ticker list
2. `TickerNews(selectedTicker)` — `selectedTicker` starts `null`; the hook's `enabled: !!ticker` means it never fetches until a ticker is picked (constraint #1, #4)
3. Maps response articles → `DisplayArticle[]`
4. Resets `limit` to `loadMoreIncrement` when `selectedTicker` changes
5. Renders `<TickerFilter>` always; while `selectedTicker` is `null` renders a "select a ticker" prompt instead of the grid (constraint #2); once a ticker is chosen, renders `<SentimentBar>` + `<NewsGrid>` for that ticker's articles only (constraint #5 — switching tickers replaces them, it never merges)

- [ ] **Step 1: Write the failing tests**

Create `src/app/components/news/__tests__/data.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/components/dashboard/dataService', () => ({
  NewsSummary: jest.fn(),
  TickerNews: jest.fn(),
}));
jest.mock('../TickerFilter', () => (props: any) => (
  <div data-testid="ticker-filter" onClick={() => props.onSelect('NVDA')} />
));
jest.mock('../SentimentBar', () => (props: any) => (
  props.aggregate ? <div data-testid="sentiment-bar" /> : null
));
jest.mock('../NewsGrid', () => (props: any) => (
  <div data-testid="news-grid" data-count={props.articles.length} />
));
jest.mock('../NewsCardSkeleton', () => () => <div data-testid="skeleton" />);
jest.mock('@/hooks/useNewsLayout', () => ({
  useNewsLayout: () => ({
    loadMoreIncrement: 9,
    getContainerClasses: () => 'grid',
    fixedCardHeight: '360px',
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: any) => k }),
}));

import { NewsSummary, TickerNews } from '@/components/dashboard/dataService';
import NewsData from '../data';

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const mockSummary = [
  { ticker: 'NVDA', hasData: true, score: 0.29, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
];

const mockTickerResponse = {
  ticker: 'NVDA',
  period: '7d',
  aggregate: { score: 0.29, label: 'Somewhat Bullish', confidence: 'medium', article_count: 11 },
  articles: [
    { title: 'NVIDIA news', url: 'https://x.com', source: 'Yahoo', source_domain: 'yahoo.com', publishedAt: '2026-06-17T10:00:00Z', sentiment_score: 0.796, relevance_score: 0.9 },
  ],
};

describe('NewsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeletons while loading', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });
    (TickerNews as jest.Mock).mockReturnValue({ isLoading: false, data: undefined });
    renderWithQuery(<NewsData />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders TickerFilter once summary loads, calling TickerNews with null (no ticker selected yet)', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: false, data: mockSummary });
    (TickerNews as jest.Mock).mockReturnValue({ isLoading: false, data: undefined });
    renderWithQuery(<NewsData />);
    expect(screen.getByTestId('ticker-filter')).toBeInTheDocument();
    expect(TickerNews).toHaveBeenCalledWith(null);
  });

  it('shows the select-ticker prompt and hides the grid when no ticker is selected', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: false, data: mockSummary });
    (TickerNews as jest.Mock).mockReturnValue({ isLoading: false, data: undefined });
    renderWithQuery(<NewsData />);
    expect(screen.getByTestId('select-ticker-prompt')).toBeInTheDocument();
    expect(screen.queryByTestId('news-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sentiment-bar')).not.toBeInTheDocument();
  });

  it('hides the prompt and renders NewsGrid + SentimentBar once a ticker is selected', () => {
    (NewsSummary as jest.Mock).mockReturnValue({ isLoading: false, data: mockSummary });
    (TickerNews as jest.Mock).mockReturnValue({ isLoading: false, data: mockTickerResponse });
    renderWithQuery(<NewsData />);
    fireEvent.click(screen.getByTestId('ticker-filter')); // mock TickerFilter calls onSelect('NVDA')
    expect(screen.queryByTestId('select-ticker-prompt')).not.toBeInTheDocument();
    expect(screen.getByTestId('news-grid')).toBeInTheDocument();
    expect(screen.getByTestId('sentiment-bar')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="news/__tests__/data" --forceExit 2>&1 | tail -15
```

Expected: FAIL — `data.tsx` doesn't yet render `TickerFilter`, the select-ticker prompt, or `SentimentBar`

- [ ] **Step 3: Add the select-ticker prompt translation key**

In `public/locales/en/translation.json`, add this line directly after `"news_list_aria_label": "News list, {{count}} articles total",`:

```json
  "news_select_ticker_prompt": "Select a ticker to view news",
```

In `public/locales/zh/translation.json`, add this line directly after `"news_list_aria_label": "新聞列表，共 {{count}} 則新聞",`:

```json
  "news_select_ticker_prompt": "請選擇一個股票代號以查看新聞",
```

- [ ] **Step 4: Rewrite data.tsx**

Replace the full content of `src/app/components/news/data.tsx`:

```typescript
'use client';
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { handleError } from '@/utils/error';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';
import { NewsSummary, TickerNews } from '@/components/dashboard/dataService';
import type { DisplayArticle, TickerNewsResponseDTO } from '@/utils/dto';
import NewsGrid from './NewsGrid';
import NewsCardSkeleton from './NewsCardSkeleton';
import TickerFilter from './TickerFilter';
import SentimentBar from './SentimentBar';

function toDisplayArticles(response: TickerNewsResponseDTO | undefined): DisplayArticle[] {
  if (!response) return [];
  return response.articles.map((a) => ({
    id: a.url,
    headline: a.title,
    url: a.url,
    image: '',
    source: a.source,
    publishedAt: a.publishedAt,
    sentimentScore: a.sentiment_score,
  }));
}

const NewsData = () => {
  const { t } = useTranslation();
  const { loadMoreIncrement, getContainerClasses, fixedCardHeight } = useNewsLayout();

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [limit, setLimit] = useState(loadMoreIncrement);

  const summaryQuery = NewsSummary();
  const tickerNewsQuery = TickerNews(selectedTicker);

  useEffect(() => {
    setLimit(loadMoreIncrement);
  }, [selectedTicker, loadMoreIncrement]);

  useEffect(() => {
    if (summaryQuery.error) handleError(summaryQuery.error, { context: 'Data Fetch' });
  }, [summaryQuery.error]);

  useEffect(() => {
    if (tickerNewsQuery.error) handleError(tickerNewsQuery.error, { context: 'Data Fetch' });
  }, [tickerNewsQuery.error]);

  const isLoading = summaryQuery.isLoading || tickerNewsQuery.isLoading;

  const allArticles = useMemo(
    () => toDisplayArticles(tickerNewsQuery.data),
    [tickerNewsQuery.data]
  );

  const tickers = summaryQuery.data ?? [];
  const aggregate = tickerNewsQuery.data?.aggregate ?? null;
  const period = tickerNewsQuery.data?.period ?? '7d';
  const articleCount = allArticles.length;

  if (isLoading) {
    return (
      <div className={getContainerClasses()}>
        {Array.from({ length: loadMoreIncrement }).map((_, i) => (
          <NewsCardSkeleton key={i} minHeight={fixedCardHeight} />
        ))}
      </div>
    );
  }

  const visibleArticles = allArticles.slice(0, limit);

  return (
    <>
      <TickerFilter
        tickers={tickers}
        selectedTicker={selectedTicker}
        onSelect={setSelectedTicker}
        articleCount={articleCount}
        period={period}
      />

      {selectedTicker === null ? (
        <div
          data-testid="select-ticker-prompt"
          className="flex items-center justify-center py-16 text-sm text-gray-500 font-mono"
        >
          {t('news_select_ticker_prompt')}
        </div>
      ) : (
        <>
          <SentimentBar ticker={selectedTicker} aggregate={aggregate} period={period} />

          {visibleArticles.length > 0 && <NewsGrid articles={visibleArticles} />}

          {allArticles.length > limit && (
            <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
              <Button
                size="sm"
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base min-h-[44px] touch-manipulation active:scale-95 transition-transform duration-150"
                onClick={() => setLimit((prev) => prev + loadMoreIncrement)}
                aria-label={t('load_more_detail', { current: limit, total: allArticles.length })}
              >
                {t('load_more_remaining', { remaining: allArticles.length - limit })}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default NewsData;
```

- [ ] **Step 5: Run the data tests**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="news/__tests__/data" --forceExit 2>&1 | tail -15
```

Expected: all 4 tests PASS.

- [ ] **Step 6: Run all news tests together**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npm test -- --testPathPattern="components/news" --forceExit 2>&1 | tail -20
```

Expected: all suites pass (TickerFilter, SentimentBar, NewsCard, data).

- [ ] **Step 7: Verify TypeScript compiles clean**

```bash
cd /Users/ian/App/side_project/stock_monitoring/frontend && npx tsc --noEmit 2>&1 | grep -v "test\|strategyEngine"
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/news/data.tsx src/app/components/news/__tests__/data.test.tsx public/locales/en/translation.json public/locales/zh/translation.json
git commit -m "feat: require ticker selection in news page; wire TickerFilter, prompt, SentimentBar"
```

---

## Self-Review Against Spec

### Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Ticker pill filter bar above card grid | Task 4 (`TickerFilter`) |
| No "all articles" view — page starts with no ticker selected, no data | Task 8 — `useState<string \| null>(null)`, `TickerNews` not yet fetched |
| "Select a ticker to view news" prompt until a ticker is chosen | Task 8 — `data-testid="select-ticker-prompt"`, translation key `news_select_ticker_prompt` |
| No "All" pill in `TickerFilter` | Task 4 — pill bar renders one button per ticker only, no all-pill |
| `getNews` API only called once a ticker is selected | Task 2 — `enabled: !!ticker` on `TickerNews`'s `useQuery` |
| Selecting a different ticker replaces the current articles | Task 8 — `queryKey: ['tickerNews', ticker]` keyed per ticker, `allArticles` derives solely from the current `tickerNewsQuery.data` (no merge with prior selection) |
| Active pill visually highlighted (green accent) | Task 4 — `border-green-400 text-green-400 bg-green-400/10` |
| Ticker list from `getNewsSummary` | Task 8 — `summaryQuery = NewsSummary()` |
| Tickers with `hasData: false` — disabled/muted | Task 4 — `disabled={!t.hasData}`, `opacity-40` |
| Article count on right of filter bar (`12 articles · 7d`) | Task 4 — `data-testid="article-count"`, hidden until a ticker is selected |
| Dark theme, monospace, pill shape | Task 4 — `font-mono`, `rounded-full`, `border` |
| Aggregate bar shown only once a ticker is selected | Task 8 — gated behind `selectedTicker === null ? prompt : (<SentimentBar .../> ...)` |
| Ticker symbol + label in aggregate bar | Task 5 — `{ticker} weighted sentiment` |
| Score large monospace, color-coded | Task 5 — `text-3xl font-bold`, `scoreColor()` |
| Sentiment label badge | Task 5 — `data-testid="sentiment-bar-badge"` |
| Confidence level | Task 5 — `confidence: {aggregate.confidence}` |
| Article count + period right-aligned | Task 5 — `data-testid="sentiment-bar-meta"` |
| Aggregate data from `getNews` response `aggregate` field | Task 2 — `TickerNews` hook, Task 8 — `tickerNewsQuery.data.aggregate` |
| Color: positive > 0.15 = #4ade80 | Tasks 5, 6 — `scoreColor()` / `sentimentColor()` |
| Color: negative < -0.15 = #f87171 | Tasks 5, 6 |
| Color: neutral = #8b949e | Tasks 5, 6 |
| Card: banner image kept | Task 6 — `article.image` with fallback |
| Card: title kept | Task 6 — `article.headline` |
| Card: bottom row (source · time + score) | Task 6 — `data-testid="card-bottom-row"` |
| Score format: `+0.796` / `-0.225` (3 dp, always sign) | Task 6 — `formatSentimentScore()` |
| Relative time from `publishedAt` | Task 3 (`getRelativeTime`) + Task 6 (call in card) |
| Do not change card dimensions/grid/image | Task 6 — only adds bottom row inside existing `CardContent` |
| `getNews?ticker=` fetch + hook in `dataService.tsx`, ticker required | Task 2 |
| `getNewsSummary` on page load | Task 8 — `NewsSummary()` always active |
| `getNews?ticker=NVDA` on ticker select | Task 2 — `TickerNews(selectedTicker)` |
| `DisplayArticle` type | Task 1 |

### Placeholder Scan

No TBDs, TODOs, "handle edge cases" stubs, or "similar to Task N" references found.

### Type Consistency

- `DisplayArticle` defined in Task 1, used in Tasks 6, 7, 8. ✓
- `TickerNewsResponseDTO` defined in Task 1, returned by `TickerNews()` in Task 2, consumed in Task 8. ✓
- `TickerNewsAggregateDTO` defined in Task 1, used in `SentimentBar` props (Task 5), extracted from `TickerNewsResponseDTO` in Task 8. ✓
- `NewsSummaryDTO` — already exists in `dto.tsx`, used as `tickers: NewsSummaryDTO[]` in `TickerFilter` (Task 4). ✓
- `toDisplayArticles(response: TickerNewsResponseDTO)` defined and used in Task 8 — maps `a.title → headline`, `a.url → id`, `a.sentiment_score → sentimentScore`. ✓
- `TickerNews` exported from `dataService.tsx` (Task 2), imported in Task 8 from `@/components/dashboard/dataService`. ✓
- `NewsSummary` already exported from `dataService.tsx`, imported in Task 8 from `@/components/dashboard/dataService`. ✓
- `getRelativeTime` exported from `formatters.ts` (Task 3), imported in `NewsCard.tsx` (Task 6) as `@/utils/formatters`. ✓
- `NewsGrid` prop changed from `news: NewsDTO[]` to `articles: DisplayArticle[]` in Task 7, matching what Task 8 passes. ✓
- `TickerFilter`'s `onSelect: (ticker: string) => void` (Task 4) is assigned `setSelectedTicker` (a `Dispatch<SetStateAction<string | null>>`) in Task 8 — assignable since the setter accepts a strictly wider parameter type. ✓
- `getTickerNews(ticker: string)` (Task 2) takes a required ticker; `TickerNews`'s `enabled: !!ticker` guarantees it is never invoked with `null`/`undefined`. ✓
