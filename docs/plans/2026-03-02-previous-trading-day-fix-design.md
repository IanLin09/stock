# Design: Previous Trading Day Fix

**Date:** 2026-03-02
**Status:** Approved

---

## Problem

The percentage change shown in the watchlist (`DashboardList`) is wrong on Mondays. The backend naively subtracts 1 day from "today" to get "yesterday", landing on Sunday. The query then uses `$lt: Sunday` which accidentally returns Friday's data only because the DB has no weekend rows. This is an implicit, fragile dependency — not intentional logic.

---

## Root Cause

`stock/handlers/daily.js` — both `previousDayPrice` and `previousDayPrices` handlers:

```js
case '1D':
  timeRange.setDate(timeRange.getDate() - 1); // naively subtracts 1 day
  break;
```

No explicit weekend check. Works by accident today; breaks if any non-trading-day data ever enters the collection.

---

## Solution: Approach A — Backend explicit weekend skip

In both `previousDayPrice` and `previousDayPrices`, after subtracting 1 day, roll the date back to Friday if it lands on Saturday or Sunday. Then advance by 1 day so the existing `$lt` query semantics remain consistent with all other range cases.

```js
case '1D':
  timeRange.setDate(timeRange.getDate() - 1); // go back 1 day
  const dow = timeRange.getDay(); // 0=Sun, 6=Sat
  if (dow === 0) timeRange.setDate(timeRange.getDate() - 2); // Sun → Fri
  if (dow === 6) timeRange.setDate(timeRange.getDate() - 1); // Sat → Fri
  timeRange.setDate(timeRange.getDate() + 1); // shift +1 to preserve $lt semantics
  break;
```

On Monday Jan 6:
1. subtract 1 → Sunday Jan 5
2. Sunday → advance -2 → Friday Jan 3
3. +1 → Saturday Jan 4
4. Query: `datetime < "2025-01-04"` → most recent before Saturday = Friday Jan 3 ✓

On a normal Tuesday Jan 7:
1. subtract 1 → Monday Jan 6 (weekday, no change)
2. +1 → Tuesday Jan 7
3. Query: `datetime < "2025-01-07"` → most recent before Tuesday = Monday Jan 6 ✓

---

## Holiday Handling

**No changes needed.** The existing `sort: { datetime: -1 }, limit: 1` aggregate pattern already skips holidays automatically — if there's a gap in data (e.g. Thanksgiving), the query returns the last available row before the target date.

---

## Files Changed

| File | Change |
|---|---|
| `stock/handlers/daily.js` | Add weekend-skip logic to `case '1D'` in `previousDayPrice` and `previousDayPrices` |

No frontend changes required. No API contract changes.

---

## Testing

- Unit tests for the `1D` date calculation logic (Jest or Node assert)
- Manual verification: check that Monday returns Friday's close, Tuesday returns Monday's, Friday returns Thursday's
- Edge cases: Saturday call → Friday, Sunday call → Friday
