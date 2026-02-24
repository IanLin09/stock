# Bulk Previous Price Endpoint Design

**Date:** 2026-02-24

## Problem

The dashboard fetches previous day prices to calculate price change and percentage for each symbol. Currently this requires one API call per symbol (e.g. 3 calls for QQQ, TQQQ, NVDL), which is wasteful and doesn't scale.

## Goal

Create a new bulk endpoint that returns previous prices for all symbols in a single API call, while keeping the existing single-symbol endpoint unchanged.

## API Design

### Existing (unchanged)
```
GET /daily/previousDayPrice?symbol=QQQ&range=1D
→ { datetime, close, volume }
```

### New endpoint
```
GET /daily/previousDayPrices?range=1D
→ {
    QQQ:  { datetime, close, volume },
    TQQQ: { datetime, close, volume },
    NVDL: { datetime, close, volume },
    ...
  }
```

**Supported range values:** `1D`, `1W`, `1M`, `3M` (same logic as existing endpoint)

## Backend Changes (`/stock/handlers/daily.js`)

- Add `exports.previousDayPrices` handler
- Read symbols from `process.env.SYMBOLS`
- Run a single MongoDB aggregation using `$match` with `$in` on all symbols, same date logic as existing handler
- Group results by symbol and return as a keyed map

Add route in `serverless.yml`:
```
GET /daily/previousDayPrices  →  handlers/daily.previousDayPrices  (auth required)
```

## Frontend Changes

### `closePrice.tsx`
- Add `PreviousPrices(range)` hook calling `GET /daily/previousDayPrices?range={range}`
- Returns `Record<string, PreviousPriceDTO>`

### `list.tsx`
- Replace the 3 individual `PreviousPrice(symbol1/2/3)` hook calls with a single `PreviousPrices('1D')` call
- Remove hardcoded `symbol1`, `symbol2`, `symbol3` slots
- Look up each symbol's previous price from the returned map by key

## Trade-offs

- **N calls → 1 call**: reduces network overhead and Lambda cold starts
- **Clean separation**: existing single-symbol endpoint stays untouched for other uses
- **Flexible**: `range` param keeps multi-range support for future dashboard views
