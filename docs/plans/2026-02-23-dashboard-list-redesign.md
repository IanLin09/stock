# DashboardList Component Redesign

**Date:** 2026-02-23
**Status:** Approved
**Component:** `src/app/components/dashboard/list.tsx`

## Context

Due to API data issues with intra-day data, we need to redesign the DashboardList component to remove all dependencies on intra-day price data. The component currently displays mini line charts based on intra-day prices, which will be replaced with a cleaner summary view.

## Objectives

1. Remove all intra-day data dependencies
2. Display essential stock information: symbol, daily close price, day-over-day percentage change, and volume
3. Maintain existing interactive features (click-to-select functionality)
4. Keep responsive design patterns (mobile vs desktop layouts)
5. Use only daily price data from existing backend endpoints

## Design Overview

### Selected Approach: Dual API Calls

**Decision:** Use existing backend endpoints without modification, making dual API calls to fetch current and previous day prices.

**Rationale:**
- Zero backend changes required
- Can implement immediately
- Uses proven, existing endpoints
- Good performance for 3-5 symbols (our current use case)
- Easy to optimize later if needed

**Alternatives Considered:**
- Backend enhancement (modify `/daily` to return 2 days of data) - rejected due to requiring Lambda redeployment
- New dashboard endpoint (pre-calculated data) - rejected as overkill for current needs

## Architecture

### Component Structure

**File:** `src/app/components/dashboard/list.tsx`

**Props:** Same as current implementation
```typescript
type DashboardListProps = {
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
};
```

**Dependencies:**
- `@tanstack/react-query` for data fetching
- `ClosePrices()` hook for latest daily prices
- Direct API calls to `/daily/previous` for previous day prices
- Existing hooks: `useStockPriceStyle()`, `useIsMobile()`

### Data Flow

```
1. Fetch latest prices using ClosePrices() hook
   ↓
2. Extract symbol list from latest prices
   ↓
3. Fetch previous prices in parallel using Promise.all()
   ↓
4. Calculate day-over-day percentage changes
   ↓
5. Sort alphabetically by symbol
   ↓
6. Render stock list with calculated data
```

### API Endpoints Used

1. **Latest Prices:** `/daily` (via `ClosePrices()` hook)
   - Returns: Latest daily price for each symbol
   - Query key: `['closePrice']`

2. **Previous Prices:** `/daily/previous?symbol=X&range=1D`
   - Returns: Previous trading day's close price
   - Called once per symbol in parallel
   - Query key: `['previousPrice', symbol]`

### Data Transformation

For each stock, calculate:
- **Day-over-day change:** `currentClose - previousClose`
- **Percentage change:** `((currentClose - previousClose) / previousClose) * 100`
- **Volume formatting:** Convert to compact format
  - Billions: 1,234,567,890 → "1.2B"
  - Millions: 1,234,567 → "1.2M"
  - Thousands: 543,500 → "543.5K"
  - Less than 1000: Display as-is

## UI/UX Design

### Display Fields

Each stock displays 4 fields:
1. **Symbol** - Stock ticker (e.g., QQQ, TQQQ, NVDL)
2. **Close Price** - Current day's closing price (e.g., 105.23)
3. **% Change** - Day-over-day percentage with +/- sign (e.g., +2.5%, -1.2%)
4. **Volume** - Compact formatted trading volume (e.g., 1.2M)

### Layout

**Desktop Layout (≥640px):**
- Horizontal row format
- Symbol (20% width) | Price (25% width) | % Change (30% width) | Volume (25% width)
- Small padding, compact spacing

**Mobile Layout (<640px):**
- Stacked card format with border
- Symbol: Centered, large, bold at top
- Price: Large, centered in middle
- % Change: Below price, centered
- Volume: Smaller text at bottom with "Vol:" label

### Visual Styling

- **Color coding:** Entire row colored based on price change
  - Positive change: `upColor` from `useStockPriceStyle()` (green)
  - Negative change: `downColor` from `useStockPriceStyle()` (red)
  - Zero change: Use `upColor` or neutral color

- **Typography:**
  - Symbol: Bold/medium weight
  - Price: Regular weight, prominent size
  - Percentage: Bold weight with explicit +/- prefix
  - Volume: Smaller text

- **Interactions:**
  - Hover: Light background color change (gray-50/gray-800)
  - Click: Call `setSymbol()` with clicked stock symbol
  - Cursor: Pointer on hover

- **Scrolling:**
  - Auto-scroll when > 4 stocks
  - Max height: 60vh (mobile), 55vh (desktop)
  - Custom scrollbar styling (thin, gray)

### Responsive Behavior

- Uses existing `useIsMobile()` hook (breakpoint: 640px)
- Desktop: Horizontal rows with minimal padding
- Mobile: Card-style layout with borders and more spacing

## Error Handling & Edge Cases

### Loading States

**Approach:** Wait for both queries (latest + previous) to complete before showing data
- Simpler implementation
- Prevents visual jumping
- Shows single "Loading..." message

**Alternative considered:** Sequential loading (show prices first, then percentages) - rejected to avoid layout shift

### Error Scenarios

1. **Latest price fetch fails:**
   - Display error message using `handleError()` utility
   - Show no stock data

2. **Individual previous price fetch fails:**
   - Show "N/A" for percentage
   - Still display symbol, current price, and volume
   - Log error but don't break component

3. **Partial failures:**
   - Gracefully degrade
   - Show complete data for stocks with all info
   - Show partial data for stocks missing previous prices

### Edge Cases

- **No data available:** Show "No stocks to display" message
- **Missing volume data:** Display "—" or "0"
- **Extreme percentages:** Handle changes >100% without layout breaking
- **Zero or null previous price:** Show "N/A" to avoid division by zero
- **Weekend/holiday data:** Display last available trading day data
- **Invalid numbers:** Validate all values before calculations

### Data Validation

- Ensure all price values are numbers before calculations
- Round percentages to 2 decimal places (e.g., 2.47%)
- Round prices to 2 decimal places (e.g., 105.23)
- Handle negative volumes (treat as 0 or flag error)
- Validate division operations (check denominator ≠ 0)

## Testing Strategy

### Test File
`src/app/components/dashboard/__tests__/list.test.tsx`

### Test Cases

1. **Data fetching & display**
   - Renders loading state initially
   - Displays stock data after successful fetch
   - Shows correct symbol, price, percentage, volume

2. **Percentage calculations**
   - Correctly calculates positive percentage change
   - Correctly calculates negative percentage change
   - Handles zero change (0.00%)
   - Shows "N/A" when previous price unavailable

3. **Volume formatting**
   - Formats millions correctly (1,234,567 → "1.2M")
   - Formats thousands correctly (543,500 → "543.5K")
   - Formats billions correctly (1,234,567,890 → "1.2B")
   - Handles small numbers (<1000 → display as-is)

4. **Color coding**
   - Applies upColor for positive changes
   - Applies downColor for negative changes
   - Handles zero change appropriately

5. **Click interaction**
   - Calls setSymbol() with correct symbol when row clicked

6. **Error handling**
   - Shows error message when latest prices fail to load
   - Handles partial data gracefully (some previous prices missing)

7. **Responsive behavior**
   - Renders desktop layout on large screens
   - Renders mobile layout on small screens

### Mock Strategy

- Mock `@tanstack/react-query` for both queries
- Mock `ClosePrices()` hook
- Mock `fetch` for previous price API calls
- Mock `useIsMobile()` hook for responsive tests
- Mock `useStockPriceStyle()` for color values

### Coverage Goal

- Aim for 80%+ test coverage
- Focus on business logic (calculations, formatting)
- Ensure all error paths are tested

## Implementation Notes

### Volume Formatting Helper

Create a utility function for compact number formatting:
```typescript
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}
```

### Percentage Formatting

```typescript
function formatPercentage(current: number, previous: number): string {
  if (!previous || previous === 0) return "N/A";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}
```

### Previous Price Fetching

Use `Promise.all()` to fetch in parallel:
```typescript
const symbols = Object.keys(latestPrices);
const previousPricePromises = symbols.map(symbol =>
  fetchPreviousPrice(symbol)
);
const previousPrices = await Promise.all(previousPricePromises);
```

## Migration Path

1. **Backup current implementation** - Keep old code commented for reference
2. **Remove intraday dependencies** - Delete `/intraday/latest` API call
3. **Implement new data fetching** - Add previous price queries
4. **Add calculation logic** - Percentage and volume formatting
5. **Update UI layout** - Modify JSX to show new fields
6. **Add tests** - Comprehensive test coverage
7. **Manual testing** - Verify on both mobile and desktop
8. **Clean up** - Remove old code and imports

## Success Criteria

- [x] No intra-day data dependencies
- [x] Displays: symbol, close price, day-over-day %, volume
- [x] Click-to-select functionality works
- [x] Color coding based on price change
- [x] Responsive layouts (mobile/desktop)
- [x] Alphabetically sorted by symbol
- [x] Graceful error handling
- [x] 80%+ test coverage
- [x] No console errors or warnings
- [x] Performance acceptable (< 2s initial load)

## Future Enhancements

Potential improvements for later iterations:
- Batch API for previous prices (single call instead of N calls)
- Backend pre-calculation of percentages
- Add sparkline mini-charts using daily data instead of intraday
- Caching strategy for previous prices
- Real-time updates during market hours
- Additional metrics (P/E ratio, market cap, etc.)

## Risks & Mitigations

**Risk:** N+1 API calls could slow down initial load
**Mitigation:** Promise.all() for parallel fetching; acceptable for 3-5 symbols; can optimize later with batch endpoint

**Risk:** Missing previous price data (new stock, holiday gaps)
**Mitigation:** Show "N/A" for percentage, component still functional

**Risk:** Breaking existing functionality
**Mitigation:** Comprehensive test coverage before deployment

## Approval

- [x] Architecture approved
- [x] UI/UX design approved
- [x] Error handling approved
- [x] Testing strategy approved

## Implementation Notes

**Completed:** 2026-02-24

### Key Decisions Made During Implementation

1. **React Hooks Array Usage**: Used fixed-count hooks (`symbol1`, `symbol2`, `symbol3`) instead of hooks in a loop to maintain React Hooks rules compliance. This caps the component at 3 symbols, which matches the current use case (QQQ, TQQQ, NVDL).
2. **Formatting Utilities**: Created dedicated `src/app/utils/formatters.ts` module for reusability across the app.
3. **Test Coverage**: Achieved >90% coverage with 10 comprehensive unit tests.
4. **Click Interaction**: Used `fireEvent` from `@testing-library/react` (no `@testing-library/user-event` needed).

### Files Modified

- `src/app/components/dashboard/list.tsx` - Complete refactor
- `src/app/components/dashboard/closePrice.tsx` - Added PreviousPrice hook

### Files Created

- `src/app/utils/formatters.ts` - formatVolume and formatPercentage utilities
- `src/app/utils/__tests__/formatters.test.ts` - 39 unit tests for formatters
- `src/app/components/dashboard/__tests__/closePrice.test.tsx` - 5 tests for PreviousPrice hook
- `src/app/components/dashboard/__tests__/list.test.tsx` - 10 tests for DashboardList component

### Removed Dependencies

- `/intraday/latest` endpoint
- `StockChart` component usage in DashboardList
- `StockChartDTO` import
