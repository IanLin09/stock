# Bulk Previous Price Endpoint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace N per-symbol API calls with a single `GET /daily/previousDayPrices?range=1D` call that returns all symbols at once.

**Architecture:** Add a new handler `previousDayPrices` in the backend that runs one MongoDB aggregation with `$in` across all symbols, then update the frontend hook and dashboard component to consume the new endpoint.

**Tech Stack:** Node.js Lambda (Serverless Framework), MongoDB aggregation, React Query (`useQuery`), Next.js 15, TypeScript

---

### Task 1: Add `previousDayPrices` handler to backend

**Files:**
- Modify: `stock/handlers/daily.js`

**Step 1: Add the new export after `exports.previousDayPrice`**

Add this function to `stock/handlers/daily.js` (after line 223, before `exports.RangeData`):

```javascript
exports.previousDayPrices = async (event) => {
  try {
    const { range } = event.queryStringParameters || {};
    const stocks = process.env.SYMBOLS
      ? process.env.SYMBOLS.split(',').filter((item) => item !== '')
      : ['QQQ', 'TQQQ', 'NVDL', 'TSLA', 'IBIT'];

    const client = await connectToDatabase();
    const db = client.db('LazyP');

    let timeRange = new Date();
    switch (range) {
      case '1D':
        timeRange.setDate(timeRange.getDate() - 1);
        break;
      case '1W':
        let weekDay = timeRange.getDay() === 0 ? 6 : timeRange.getDay() - 1;
        timeRange.setDate(timeRange.getDate() - weekDay);
        break;
      case '1M':
        timeRange = new Date(timeRange.getFullYear(), timeRange.getMonth(), 1);
        break;
      case '3M':
        timeRange.setMonth(timeRange.getMonth() - 3);
        timeRange = new Date(timeRange.getFullYear(), timeRange.getMonth(), 1);
        break;
    }

    const rows = await db.collection('daily_price').aggregate([
      {
        $match: {
          datetime: { $lt: timeRange.toISOString().slice(0, 10) },
          symbol: { $in: stocks },
        },
      },
      { $sort: { datetime: -1 } },
      {
        $group: {
          _id: '$symbol',
          symbol: { $first: '$symbol' },
          datetime: { $first: '$datetime' },
          close: { $first: { $round: [{ $toDouble: '$close' }, 2] } },
          volume: { $first: '$volume' },
        },
      },
    ]).toArray();

    const result = rows.reduce((acc, row) => {
      acc[row.symbol] = { datetime: row.datetime, close: row.close, volume: row.volume };
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (e) {
    console.log(e);
    return { statusCode: 500 };
  }
};
```

**Step 2: Test locally with serverless offline**

```bash
cd stock
serverless offline
curl "http://localhost:3000/daily/previousDayPrices?range=1D" \
  -H "Authorization: Bearer <your-token>"
```

Expected: `{ "QQQ": { "datetime": "...", "close": 123.45, "volume": "..." }, "TQQQ": {...}, ... }`

**Step 3: Commit**

```bash
cd stock
git add handlers/daily.js
git commit -m "feat: add previousDayPrices bulk endpoint"
```

---

### Task 2: Register the new route in serverless.yml

**Files:**
- Modify: `stock/serverless.yml`

**Step 1: Add the new function entry**

In `stock/serverless.yml`, after the `previousDayPrice` block (after line 119), add:

```yaml
  previousDayPrices:
    handler: handlers/daily.previousDayPrices
    events:
      - httpApi:
          path: /daily/previousDayPrices
          method: get
          authorizer:
            name: customAuthorizer
            type: request
```

**Step 2: Restart serverless offline and re-verify**

```bash
serverless offline
curl "http://localhost:3000/daily/previousDayPrices?range=1D" \
  -H "Authorization: Bearer <your-token>"
```

Expected: same JSON map as Task 1 Step 2.

**Step 3: Commit**

```bash
git add serverless.yml
git commit -m "feat: register previousDayPrices route in serverless.yml"
```

---

### Task 3: Deploy backend to AWS

**Step 1: Deploy**

```bash
cd stock
serverless deploy
```

Expected output includes the new endpoint URL, e.g.:
`GET - https://<id>.execute-api.ap-southeast-2.amazonaws.com/daily/previousDayPrices`

**Step 2: Smoke test against production**

```bash
curl "https://<your-api-id>.execute-api.ap-southeast-2.amazonaws.com/daily/previousDayPrices?range=1D" \
  -H "Authorization: Bearer <NEXT_PUBLIC_AWSTOKEN>"
```

Expected: valid JSON map with all symbols.

---

### Task 4: Add frontend type and hook

**Files:**
- Modify: `frontend/src/app/utils/dto.tsx`
- Modify: `frontend/src/app/components/dashboard/closePrice.tsx`

**Step 1: Add `PreviousPriceList` type to `dto.tsx`**

In `src/app/utils/dto.tsx`, after the `PreviousPriceDTO` type (after line 79), add:

```typescript
export type PreviousPriceList = Record<string, PreviousPriceDTO>;
```

**Step 2: Add `getPreviousPrices` fetch and `PreviousPrices` hook to `closePrice.tsx`**

In `src/app/components/dashboard/closePrice.tsx`, add after the existing imports:

```typescript
import { StockClosePriceList, StockDTO, PreviousPriceDTO, PreviousPriceList } from '@/utils/dto';
```

Then add after the `PreviousPrice` export (after line 54):

```typescript
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
```

**Step 3: Write a test for the hook**

In `src/app/components/dashboard/__tests__/closePrice.test.tsx` (create if not exists):

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreviousPrices } from '../closePrice';
import React from 'react';

const mockData = {
  QQQ: { _id: '1', datetime: '2026-02-21', close: 490.5 },
  TQQQ: { _id: '2', datetime: '2026-02-21', close: 72.3 },
};

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => mockData,
} as Response);

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('PreviousPrices', () => {
  it('fetches all symbols at once and returns keyed map', async () => {
    const { result } = renderHook(() => PreviousPrices('1D'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/daily/previousDayPrices?range=1D'),
      expect.any(Object)
    );
  });
});
```

**Step 4: Run the test**

```bash
cd frontend
npm test -- --testPathPattern=closePrice.test
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/utils/dto.tsx src/app/components/dashboard/closePrice.tsx \
        src/app/components/dashboard/__tests__/closePrice.test.tsx
git commit -m "feat: add PreviousPrices bulk hook and PreviousPriceList type"
```

---

### Task 5: Refactor `list.tsx` to use the bulk hook

**Files:**
- Modify: `frontend/src/app/components/dashboard/list.tsx`

**Step 1: Replace the 3 hardcoded symbol slots with a single `PreviousPrices` call**

In `src/app/components/dashboard/list.tsx`, replace the import line for `PreviousPrice`:

```typescript
// Before
import { ClosePrices, PreviousPrice } from './closePrice';

// After
import { ClosePrices, PreviousPrices } from './closePrice';
```

Then replace lines 38–46 (the hardcoded symbol slots and individual queries):

```typescript
// Remove:
const symbol1 = symbols[0] || '';
const symbol2 = symbols[1] || '';
const symbol3 = symbols[2] || '';

const prev1 = PreviousPrice(symbol1);
const prev2 = PreviousPrice(symbol2);
const prev3 = PreviousPrice(symbol3);

const previousPriceQueries = [prev1, prev2, prev3];

// Replace with:
const previousPricesQuery = PreviousPrices('1D');
```

Update the `displayData` useMemo to use the map (replace lines 49–68):

```typescript
const displayData = useMemo<StockDisplayData[]>(() => {
  if (!latestClosePriceQuery.data) return [];

  return symbols.map((symbol) => {
    const current = latestClosePriceQuery.data[symbol];
    const previous = previousPricesQuery.data?.[symbol]?.close;

    const change = previous ? current.close - previous : 0;
    const percentage = formatPercentage(current.close, previous);

    return {
      symbol,
      close: current.close,
      volume: current.volume,
      percentage,
      change,
    };
  });
}, [latestClosePriceQuery.data, symbols, previousPricesQuery.data]);
```

Update the loading state (replace lines 78–80):

```typescript
const isLoading =
  latestClosePriceQuery.isLoading || previousPricesQuery.isLoading;
```

**Step 2: Run existing tests**

```bash
cd frontend
npm test -- --testPathPattern=list.test
```

Expected: all existing tests PASS (update mocks if needed — see Step 3)

**Step 3: If tests fail, update mocks in `list.test.tsx`**

The tests that previously mocked `PreviousPrice` need to mock `PreviousPrices` instead.
Find all occurrences of `PreviousPrice` in the test file and update to return the new shape:

```typescript
// Old mock pattern
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
  PreviousPrice: jest.fn(),
}));

// New mock pattern
jest.mock('../closePrice', () => ({
  ClosePrices: jest.fn(),
  PreviousPrices: jest.fn(),
}));

// Old return value
(PreviousPrice as jest.Mock).mockReturnValue({ data: { close: 480 }, isLoading: false });

// New return value — keyed by symbol
(PreviousPrices as jest.Mock).mockReturnValue({
  data: { QQQ: { close: 480 }, TQQQ: { close: 60 }, NVDL: { close: 20 } },
  isLoading: false,
  error: null,
});
```

**Step 4: Run all frontend tests**

```bash
cd frontend
npm test
```

Expected: all tests PASS

**Step 5: Commit**

```bash
git add src/app/components/dashboard/list.tsx \
        src/app/components/dashboard/__tests__/list.test.tsx
git commit -m "refactor: use PreviousPrices bulk hook in DashboardList"
```

---

### Task 6: Manual end-to-end verification

**Step 1: Start the dev server**

```bash
cd frontend
npm run dev
```

**Step 2: Open browser at `http://localhost:3001`**

Check:
- Dashboard loads without errors
- All symbols (QQQ, TQQQ, NVDL, etc.) show correct price, percentage change, and volume
- Network tab shows a single call to `/daily/previousDayPrices?range=1D` (not multiple calls to `/daily/previousDayPrice`)
- No console errors

**Step 3: Commit if any final cleanup was needed, then push**

```bash
git push origin feature/strategy-dashboard
```
