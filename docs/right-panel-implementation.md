# Right Panel Implementation Plan

Layout: **Plan B** — Chart section owns its header (price info + time range tabs), indicators section is a separate flat list below.

```
┌──────────────────────────────────────────────────────┐
│  QQQ   607.87  +1.07%           [1M]  [3M]  [6M]    │  ← chart section header
│                                                      │
│                    CHART                             │  ← chart body
│                                                      │
├──────────────────────────────────────────────────────┤
│  RSI      58.2                             neutral   │
│  MACD     DIF 0.4 / DEA -0.1 / Hist 0.8   bullish   │
│  MA       MA20 601.2                       bullish   │
│  KDJ      K 72 / D 68 / J 78              neutral   │
│  Bollinger  Upper 615 / Mid 605 / Lower 595          │
│  EMA      EMA5 604.1                                 │
└──────────────────────────────────────────────────────┘
```

The right panel spans `row-span-2 col-span-2` in the dashboard grid and currently renders `ComprehensiveArea`. This component will be refactored to implement the two-section layout.

**Implementation order:** Section 0 must be completed first. Sections 1, 2, and 3 all depend on the selected symbol being available and wired correctly before any data fetching or rendering work begins.

---

## Section 0 — Symbol Selection (Prerequisite)

### Display

No visual change in this section — it is purely state wiring. When the user clicks a symbol row in `DashboardList` (left panel), the right panel re-renders to show the chart and indicators for that symbol. The right panel displays an empty state when no symbol is selected.

### How the State Is Currently Triggered

`DashboardList` already accepts a `setSymbol: React.Dispatch<React.SetStateAction<string>>` prop. Each rendered row has an `onClick` handler that calls `setSymbol(stock.symbol)`. This propagates the selected symbol up to `DashboardPage` (`src/app/components/dashboard/data.tsx`), which holds the state as `const [symbol, setSymbol] = useState<string>('')`.

`ComprehensiveArea` already receives `symbol` as a prop and returns `<></>` when it is an empty string.

### How the State Is Shared to the Right Panel

**Current approach (props):** `DashboardPage` owns `symbol` state and threads it as a prop to `ComprehensiveArea`. This already works for the chart. The new `IndicatorSummary` component (Section 3) will need the same `symbol` prop and must be rendered at the same level — inside `DashboardPage`'s right panel `div`, alongside `ComprehensiveArea`.

**Alternative: Zustand `useAnalysisStore`** — A `currentSymbol` / `setCurrentSymbol` store already exists in `src/app/utils/zustand.tsx` and is used by the `/analysis` page. Migrating `DashboardList` to call `setCurrentSymbol` instead of the `setSymbol` prop would remove the prop chain and let any deeply nested component read the selected symbol without threading. However, it couples the dashboard and analysis pages to the same symbol state, which could cause unintended cross-page effects (e.g. navigating to `/analysis` would show the last dashboard-selected symbol). **Recommendation: keep the local `useState` in `DashboardPage` and pass `symbol` as a prop.** The prop chain is shallow (two levels: `DashboardPage` → `ComprehensiveArea` → children), and this avoids shared-state side effects.

### Steps to Implement

1. Confirm `DashboardList`'s `onClick` row handler is calling `setSymbol(stock.symbol)` correctly — this is already implemented and requires no changes.
2. In `DashboardPage` (`data.tsx`), verify the `symbol` state is passed to `ComprehensiveArea` as a prop — this is also already in place.
3. When wiring in `IndicatorSummary` (Section 3), pass the same `symbol` prop from `DashboardPage` directly to `IndicatorSummary`. Do not introduce an additional state layer.
4. Add a guard to `IndicatorSummary` matching the pattern already in `ComprehensiveArea`: return an empty/placeholder element when `symbol` is an empty string.
5. Optionally, add a visible empty state to the right panel (e.g. "Select a symbol" prompt) so the panel is not a blank box on initial load. This can be a simple centred text string inside the right panel `div` in `data.tsx`, conditionally rendered when `!symbol`.

### Frontend API Calls

None. This section involves only React state management and component wiring. No new endpoints or data fetches are required.

### Data Source in MongoDB

None. Symbol selection is a client-side state change that triggers the data fetches defined in Sections 1, 2, and 3.

---

## Section 1 — Header

### Display

- Symbol name (e.g. `QQQ`)
- Last close price (e.g. `607.87`)
- Percentage change vs. previous close (e.g. `+1.07%`), colour-coded green/red using the existing `upColor`/`downColor` from Zustand

The header is the top strip of the chart section (2/3 of the panel), sitting above the chart canvas itself.

### Steps to Implement

1. Refactor `ComprehensiveArea` (`src/app/components/dashboard/comprehensive.tsx`) — keep the header row but restructure it:
   - Left: symbol name + last close price
   - Right: percentage change + time range tabs (move tabs here from `ComprehensiveChart`)
2. Compute percentage change in the parent component using the current close price and the 1D previous close price already fetched by `PreviousPrices('1D')` in `DashboardList`. Lift or share this data via a prop or React Query cache hit rather than a duplicate fetch.
3. Apply `upColor` / `downColor` from `useStockPriceStyle()` to the percentage change text.
4. Remove the existing high/low/open/volume stats grid from `ComprehensiveArea` (these are superseded by the indicators section).

### Frontend API Calls

| Purpose | Hook / function | Endpoint | Method | Params |
|---|---|---|---|---|
| Latest close price (all symbols) | `ClosePrices()` | `GET /daily` | GET | none |
| Previous close for % change | `PreviousPrices('1D')` | `GET /daily/previousDayPrices` | GET | `range=1D` |

> `PreviousPrices('1D')` is already called in `DashboardList` and its result is cached by React Query under key `['previousPrices', '1D']`. `ComprehensiveArea` can call the same hook and receive the cached response at zero extra network cost.

### Data Source in MongoDB

**Collection:** `daily_price`

| Field | Description |
|---|---|
| `symbol` | Ticker symbol |
| `datetime` | Trading date (YYYY-MM-DD string) |
| `close` | Close price (stored as string, converted to double in projection) |

The `getDaily` handler aggregates by symbol, sorts by `datetime` descending, and returns the single most recent document per symbol. The `previousDayPrice` / `previousDayPrices` handlers return the last record before the target date boundary (1D = yesterday, 1W = start of current week, 1M = start of current month).

---

## Section 2 — Chart

### Display

- Area chart of daily close prices for the selected time range
- Time range switcher: **1M / 3M / 6M** (tabs, one active at a time)
- The chart already uses ApexCharts with a gradient area fill and a horizontal annotation line for the previous reference price
- A previous-price baseline annotation updates when the range changes

> **Note on 1D / 1W:** The backend `RangeData` handler does not support intraday or weekly ranges — `1D` and `1W` throw in the frontend `getRangeList` utility. Intraday data exists in the `intra_day_price` collection but no read API is currently exposed. The switcher should show **1M / 3M / 6M** to match what is available, or a new endpoint would need to be added for shorter ranges.

### Steps to Implement

1. Move the `Tabs` (range switcher) from inside `ComprehensiveChart` up to the chart section header row in `ComprehensiveArea`, placed on the right side of the header.
2. Pass the active `range` state down as a prop to `ComprehensiveChart`, removing the internal `useState` for range.
3. Ensure the chart container fills the remaining height of the 2/3 section after the header row. Replace fixed `min-h-[220px]` with `flex-1` so the chart scales with the panel.
4. The `Strategy` tab that currently exists in `ComprehensiveChart` can be kept or removed — confirm with the user before removing.
5. Keep `ComprehensiveChartGenerator` and its ApexCharts configuration unchanged.

### Frontend API Calls

| Purpose | Hook / function | Endpoint | Method | Params |
|---|---|---|---|---|
| Price series for chart | `getRangeList(symbol, range)` | `GET /daily/RangeData` | GET | `symbol`, `range` (1, 3, or 6) |
| Previous reference price for annotation | `getPreviousPrice(symbol, range)` | `GET /daily/previousDayPrice` | GET | `symbol`, `range` (1D, 1W, 1M, 3M) |

Both are already wired in `ComprehensiveChart` via `useQuery`.

### Data Source in MongoDB

**Collection:** `daily_price`

| Field | Description |
|---|---|
| `symbol` | Ticker symbol |
| `datetime` | Trading date string |
| `open` / `close` / `high` / `low` | OHLC prices (string → double in projection) |
| `volume` | Trade volume |

The `RangeData` handler fetches `range + 3` months of data (the extra 3 months provide the warm-up window for indicator calculations). It returns `{ data: StockDTO[], extra: StockDTO[], close: number }` where `data` is the display range and `extra` is the warm-up slice.

---

## Section 3 — Indicators

### Display

One row per indicator, spanning the full width of the 1/3 section:

| Indicator | Values shown | Signal badge |
|---|---|---|
| RSI | RSI-14 value | bullish / bearish / neutral / extreme |
| MACD | DIF / DEA / Histogram | bullish / bearish / neutral / extreme |
| MA | MA20 value | bullish / bearish / neutral |
| KDJ | K / D / J | bullish / bearish / neutral / extreme |
| Bollinger | Upper / Middle / Lower | bullish / bearish / neutral / extreme |
| EMA | EMA5 value | (no badge — directional context only) |

Signal badges reuse `calculateIndicatorStatuses()` from `src/app/utils/indicatorCalculations.ts`, which is already used on the `/analysis` page.

### Steps to Implement

1. Create a new component `src/app/components/dashboard/IndicatorSummary.tsx`.
2. Accept `symbol: string` as a prop. Call `getSymbolDetail(symbol)` via `useQuery` (same query key `['analysisList', symbol]` as the `/analysis` page — React Query will deduplicate the request if both pages are mounted simultaneously).
3. From the returned `AnalysisListDTO`, extract `indicators: StockAnalysisDTO` and call `calculateIndicatorStatuses(indicators)` to get the signal map.
4. Render one row per indicator using the layout:
   - Left column: indicator name (fixed width)
   - Middle column: formatted values using `formatIndicatorValue()` from `indicatorCalculations.ts`
   - Right column: signal badge (colour-coded pill — green for bullish, red for bearish, yellow for extreme, gray for neutral)
5. Wrap the row list in `overflow-y-auto` in case the section height is too small to fit all six rows.
6. Wire `IndicatorSummary` into `data.tsx` below the chart section, passing the selected `symbol` prop. The `symbol` state is already managed in `DashboardPage`.

### Frontend API Calls

| Purpose | Function | Endpoint | Method | Params |
|---|---|---|---|---|
| Latest indicator values | `getSymbolDetail(symbol)` | `GET /indicators/financial` | GET | `symbol` |

### Data Source in MongoDB

**Collection:** `technical_indicators`

The `multiFinancialIndicators` handler (`GET /indicators/financial`) queries the collection for the most recent document for the given symbol (`sort datetime desc, limit 1`) and returns it alongside the next earnings dates from `report_day`.

| Field | Sub-fields | Description |
|---|---|---|
| `symbol` | — | Ticker |
| `datetime` | — | Date of the indicator snapshot |
| `close` | — | Close price at the time of calculation |
| `rsi` | `14`, `gain`, `loss` | RSI-14 and Wilder smoothing state |
| `macd` | `dif`, `dea`, `histogram`, `ema12`, `ema26` | MACD components |
| `ma` | `20` | 20-period simple moving average |
| `ema` | `5` | 5-period exponential moving average |
| `bollinger` | `upper`, `middle`, `lower` | Bollinger Band values |
| `kdj` | `k`, `d`, `j`, `rsv` | KDJ stochastic oscillator |

Indicators are calculated server-side by the `indicators` Lambda handler and written to `technical_indicators` via `bulkWrite` (upsert on `symbol + datetime`). The `indicatorsLatest` handler updates today's record incrementally between scheduled full recalculations.
