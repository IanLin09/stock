# Dashboard RWD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the dashboard right-panel (chart + indicators) usable on mobile portrait and landscape by fixing the page grid, abbreviating indicator values, and handling short-screen (landscape) layout.

**Architecture:** Four independent layers of fixes applied bottom-up — page grid first (enables everything else), then the indicator row compactness, then the header tab cleanup, then landscape height guard. No new hooks or utilities needed; `useIsMobile` and `useScreenSize` are already available.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v3, `useIsMobile` / `useScreenSize` from `src/app/hooks/use-responsive.ts`, shadcn/ui Tabs

---

## What the screenshots show

| Viewport | Problem |
|---|---|
| Portrait mobile 390px | Fixed `grid-cols-3` squishes left panel to ~130px and right panel to ~260px; MACD / Bollinger / KDJ values wrap across 3–4 lines; "Range" label takes a full tab slot |
| Landscape mobile 844×390 | Right panel has insufficient vertical space; indicator rows render on top of the chart because there is no minimum chart height and the right panel's `flex-col` overflows |

---

## Task 1 — Responsive page grid

**Files:**
- Modify: `src/app/page.page.tsx`
- Modify: `src/app/components/dashboard/data.tsx`
- Test: `src/app/components/dashboard/__tests__/data.test.tsx` (new)

### Step 1: Write the failing test

Create `src/app/components/dashboard/__tests__/data.test.tsx`:

```tsx
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
    const right = getByTestId('chart').closest('[class*="col-span"]') ??
      getByTestId('chart').parentElement!;
    expect(right.className).toContain('md:col-span-2');
    expect(right.className).toContain('md:row-span-2');
  });

  it('renders the timer panel with md:row-start-2', () => {
    const { getByTestId } = renderWithQuery(<DashboardPage />);
    const timer = getByTestId('timer').parentElement!;
    expect(timer.className).toContain('md:row-start-2');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=dashboard/__tests__/data --no-coverage
```

Expected: FAIL — `md:row-span-1` / `md:col-span-2` / `md:row-start-2` not present

### Step 3: Update page.page.tsx — responsive grid

Replace the single class string:

```tsx
// BEFORE
<div className="h-screen grid grid-rows-[calc(60.67%-12px)_calc(30.33%-12px)] grid-cols-3 gap-3 text-black dark:text-white p-3 overflow-hidden">

// AFTER
<div className="h-screen flex flex-col md:grid md:grid-rows-[calc(60.67%-12px)_calc(30.33%-12px)] md:grid-cols-3 gap-3 text-black dark:text-white p-3 overflow-hidden">
```

### Step 4: Update data.tsx — prefix grid placement classes with md:

```tsx
const DashboardPage = () => {
  const [symbol, setSymbol] = useState<string>('');
  return (
    <>
      {/* Left panel — full width on mobile, col 1 row 1 on desktop */}
      <div className="md:row-span-1 border border-black dark:border-white h-[35%] md:h-full flex flex-col shrink-0">
        <DashboardList setSymbol={setSymbol} />
      </div>

      {/* Right panel — full width on mobile, col 2-3 rows 1-2 on desktop */}
      <div className="md:row-span-2 md:col-span-2 border border-black dark:border-white flex-1 md:h-full flex flex-col min-h-0">
        {symbol ? (
          <>
            <div className="flex-1 min-h-0">
              <ComprehensiveArea symbol={symbol} />
            </div>
            <div className="border-t border-white/10 py-2 shrink-0">
              <IndicatorSummary symbol={symbol} />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            Select a symbol
          </div>
        )}
      </div>

      {/* Timer — hidden on mobile, col 1 row 2 on desktop */}
      <div className="md:row-start-2 hidden md:flex border border-black dark:border-white items-center justify-center p-4">
        <CountdownTimer />
      </div>
    </>
  );
};
```

> **Note on timer visibility:** The timer is hidden on mobile to reclaim vertical space. If you want it visible, change `hidden md:flex` to `flex` and add `shrink-0 h-16` for a compact mobile strip.

### Step 5: Run tests to verify they pass

```bash
npm test -- --testPathPattern=dashboard/__tests__/data --no-coverage
```

Expected: PASS (3 tests)

### Step 6: Commit

```bash
git add src/app/page.page.tsx src/app/components/dashboard/data.tsx src/app/components/dashboard/__tests__/data.test.tsx
git commit -m "feat: responsive dashboard grid - stack vertically on mobile"
```

---

## Task 2 — Compact indicator rows on mobile

**Files:**
- Modify: `src/app/components/dashboard/IndicatorSummary.tsx`
- Test: `src/app/components/dashboard/__tests__/IndicatorSummary.test.tsx` (extend existing)

### Problem

MACD value string `"DIF -3.99 / DEA -3.69 / Hist -0.30"` is ~36 characters. At 390px width with a 80px label and 80px badge, the middle column gets ~230px — the string wraps to 3 lines.

### Step 1: Add failing tests for mobile compact format

Append to `src/app/components/dashboard/__tests__/IndicatorSummary.test.tsx`:

```tsx
// At top of file, add mobile mock control:
let mockIsMobile = false;
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

// New describe block:
describe('IndicatorSummary mobile compact', () => {
  beforeEach(() => {
    mockIsMobile = true;
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockIsMobile = false;
  });

  it('uses abbreviated MACD labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-macd')).toBeInTheDocument()
    );
    const macdRow = screen.getByTestId('indicator-row-macd');
    // Mobile shows "D: / A: / H:" instead of "DIF / DEA / Hist"
    expect(macdRow).toHaveTextContent('D:');
    expect(macdRow).toHaveTextContent('A:');
    expect(macdRow).toHaveTextContent('H:');
  });

  it('uses abbreviated KDJ labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-kdj')).toBeInTheDocument()
    );
    const kdjRow = screen.getByTestId('indicator-row-kdj');
    // Mobile: "K: / D: / J:" instead of "K / D / J"
    expect(kdjRow).toHaveTextContent('K:');
  });

  it('uses abbreviated Bollinger labels on mobile', async () => {
    mockGetSymbolDetail.mockResolvedValue(mockIndicatorData);
    renderWithQuery(<IndicatorSummary symbol="QQQ" />);
    await waitFor(() =>
      expect(screen.getByTestId('indicator-row-bollinger')).toBeInTheDocument()
    );
    const bbandsRow = screen.getByTestId('indicator-row-bollinger');
    // Mobile: "U: / M: / L:" instead of "Upper / Mid / Lower"
    expect(bbandsRow).toHaveTextContent('U:');
    expect(bbandsRow).toHaveTextContent('M:');
    expect(bbandsRow).toHaveTextContent('L:');
  });
});
```

### Step 2: Run tests to verify they fail

```bash
npm test -- --testPathPattern=IndicatorSummary --no-coverage
```

Expected: FAIL — `D:` / `A:` / `H:` not found

### Step 3: Update IndicatorSummary.tsx

Add `useIsMobile` import and conditional value strings:

```tsx
import { useIsMobile } from '@/hooks/use-responsive';

export default function IndicatorSummary({ symbol }: IndicatorSummaryProps) {
  const isMobile = useIsMobile();
  // ... existing query ...

  return (
    <div data-testid="indicator-summary" className="overflow-y-auto px-4 py-2 space-y-1">

      {/* MACD */}
      <div data-testid="indicator-row-macd" className="flex items-center text-sm gap-2">
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">MACD</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `D:${fmt(indicators.macd?.dif)} A:${fmt(indicators.macd?.dea)} H:${fmt(indicators.macd?.histogram)}`
            : `DIF ${fmt(indicators.macd?.dif)} / DEA ${fmt(indicators.macd?.dea)} / Hist ${fmt(indicators.macd?.histogram)}`}
        </span>
        <span data-testid="signal-badge-macd" className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.macd]}`}>
          {statuses.macd}
        </span>
      </div>

      {/* KDJ */}
      <div data-testid="indicator-row-kdj" className="flex items-center text-sm gap-2">
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">KDJ</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `K:${fmt(indicators.kdj?.k)} D:${fmt(indicators.kdj?.d)} J:${fmt(indicators.kdj?.j)}`
            : `K ${fmt(indicators.kdj?.k)} / D ${fmt(indicators.kdj?.d)} / J ${fmt(indicators.kdj?.j)}`}
        </span>
        <span data-testid="signal-badge-kdj" className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.kdj]}`}>
          {statuses.kdj}
        </span>
      </div>

      {/* Bollinger */}
      <div data-testid="indicator-row-bollinger" className="flex items-center text-sm gap-2">
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">Bollinger</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `U:${fmt(indicators.bollinger?.upper)} M:${fmt(indicators.bollinger?.middle)} L:${fmt(indicators.bollinger?.lower)}`
            : `Upper ${fmt(indicators.bollinger?.upper)} / Mid ${fmt(indicators.bollinger?.middle)} / Lower ${fmt(indicators.bollinger?.lower)}`}
        </span>
        <span data-testid="signal-badge-bollinger" className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.bollinger]}`}>
          {statuses.bollinger}
        </span>
      </div>

      {/* RSI, MA, EMA rows: only need text-xs md:text-sm on label+value, rest unchanged */}
    </div>
  );
}
```

> Apply the same `text-xs md:text-sm` sizing to all rows (RSI, MA, EMA). Only MACD/KDJ/Bollinger need abbreviated value strings.

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=IndicatorSummary --no-coverage
```

Expected: PASS (all 12 tests including new mobile ones)

### Step 5: Commit

```bash
git add src/app/components/dashboard/IndicatorSummary.tsx src/app/components/dashboard/__tests__/IndicatorSummary.test.tsx
git commit -m "feat: compact indicator values and smaller text on mobile"
```

---

## Task 3 — Remove redundant "Range" tab label on mobile

**Files:**
- Modify: `src/app/components/dashboard/comprehensive.tsx`
- Test: `src/app/components/dashboard/__tests__/comprehensive.test.tsx` (extend)

### Problem

The `<TabsTrigger value="Range">Range</TabsTrigger>` occupies ~75px on a 390px screen, crowding the actual range tabs.

### Step 1: Add failing test

Append to `src/app/components/dashboard/__tests__/comprehensive.test.tsx`:

```tsx
// Add at top alongside existing mobile mock:
let mockIsMobile = false;
// Update existing mock:
jest.mock('../../../hooks/use-responsive', () => ({
  useIsMobile: () => mockIsMobile,
  useIsTablet: jest.fn(() => false),
}));

it('hides the Range tab trigger on mobile', () => {
  mockIsMobile = true;
  // ... render ComprehensiveArea with data ...
  expect(screen.queryByText('Range')).not.toBeInTheDocument();
  mockIsMobile = false;
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=dashboard/__tests__/comprehensive --no-coverage
```

Expected: FAIL — "Range" is still present

### Step 3: Update comprehensive.tsx — conditionally hide Range trigger

```tsx
// In the Tabs JSX:
<Tabs value={range} onValueChange={setRange}>
  <TabsList>
    {!isMobile && <TabsTrigger value="Range">Range</TabsTrigger>}
    <TabsTrigger value="1M">{t('1m')}</TabsTrigger>
    <TabsTrigger value="3M">{t('3m')}</TabsTrigger>
    <TabsTrigger value="6M">{t('6m')}</TabsTrigger>
  </TabsList>
</Tabs>
```

Also add `flex-wrap` to the header row so symbol/price don't overflow on narrow screens:

```tsx
// Header row:
<div className={`... ${isMobile ? 'flex flex-wrap gap-2 items-baseline' : 'flex items-center justify-between'}`}>
```

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=dashboard/__tests__/comprehensive --no-coverage
```

Expected: PASS

### Step 5: Commit

```bash
git add src/app/components/dashboard/comprehensive.tsx src/app/components/dashboard/__tests__/comprehensive.test.tsx
git commit -m "feat: hide Range tab label on mobile, flex-wrap header"
```

---

## Task 4 — Landscape guard: minimum chart height on short screens

**Files:**
- Modify: `src/app/components/dashboard/data.tsx`

### Problem

On landscape mobile (height ~390px), the right panel's `flex-1` chart section gets squeezed to ~150px before the indicator list starts, then overflows. The indicator section has no `max-height`, so it can eat all remaining space.

### Step 1: No test needed (pure CSS constraint, no behavior change)

### Step 2: Update data.tsx — cap indicator section height

```tsx
{/* Right panel flex layout */}
{symbol ? (
  <>
    <div className="flex-1 min-h-0" style={{ minHeight: '120px' }}>
      <ComprehensiveArea symbol={symbol} />
    </div>
    <div className="border-t border-white/10 py-1 shrink-0 overflow-y-auto max-h-[45%]">
      <IndicatorSummary symbol={symbol} />
    </div>
  </>
) : ...}
```

The `max-h-[45%]` cap ensures the indicator section never takes more than 45% of the right panel, leaving at least 55% for the chart.

### Step 3: Visual check

Open browser DevTools → toggle iPhone 12 Pro landscape (844×390) → select a symbol → verify:
- Chart is visible with meaningful height (≥120px)
- Indicator rows are visible and scrollable
- No overflow bleeding into chart area

### Step 4: Commit

```bash
git add src/app/components/dashboard/data.tsx
git commit -m "fix: cap indicator panel height on landscape mobile, min chart height 120px"
```

---

## Visual Acceptance Checklist

After all tasks complete, verify at these viewports in Chrome DevTools:

| Viewport | Check |
|---|---|
| iPhone SE (375×667 portrait) | Stock list → click symbol → chart + indicators visible, no overlap |
| iPhone 12 Pro (390×844 portrait) | MACD/KDJ/Bollinger abbreviated, no text wrapping |
| iPhone 12 Pro landscape (844×390) | Chart ≥120px tall, indicators scrollable below |
| iPad (768×1024) | Desktop grid kicks in (md: breakpoint), timer visible |
| Desktop 1440×900 | Unchanged from current design |
