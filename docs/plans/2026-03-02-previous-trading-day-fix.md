# Previous Trading Day Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the `1D` previous-price calculation in the backend so that Saturdays and Sundays are explicitly skipped and Friday is always returned as the previous trading day for Monday/weekend calls.

**Architecture:** Extract the date arithmetic into a pure utility function `getPreviousTradingDayCutoff(date)` in `stock/libs/tradingDay.js`. Apply it in both `previousDayPrice` and `previousDayPrices` handlers. No API contract changes — the query still uses `$lt`, just with a correctly computed cutoff. Holidays need no special handling: the existing `sort: { datetime: -1 }, group: { $first }` pattern already skips them automatically.

**Tech Stack:** Node.js, Jest 29 (testEnvironment: node), MongoDB aggregation pipeline in `stock/handlers/daily.js`

---

## Task 1 — Pure utility: `getPreviousTradingDayCutoff`

**Files:**
- Create: `stock/libs/tradingDay.js`
- Test: `stock/libs/__tests__/tradingDay.test.js` (new)

### Step 1: Write the failing tests

Create `stock/libs/__tests__/tradingDay.test.js`:

```js
const { getPreviousTradingDayCutoff } = require('../tradingDay');

// Helper: create a UTC-midnight Date from a YYYY-MM-DD string
const d = (str) => new Date(str + 'T12:00:00Z'); // use noon UTC to avoid DST edge cases

describe('getPreviousTradingDayCutoff', () => {
  it('Monday → Saturday (so $lt:Sat returns Friday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-06')); // Mon
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-04'); // Sat
  });

  it('Tuesday → Tuesday (so $lt:Tue returns Monday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-07')); // Tue
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-07');
  });

  it('Wednesday → Wednesday (so $lt:Wed returns Tuesday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-08')); // Wed
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-08');
  });

  it('Friday → Friday (so $lt:Fri returns Thursday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-10')); // Fri
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-10');
  });

  it('Saturday → Saturday (so $lt:Sat returns Friday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-11')); // Sat
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-11'); // Sat
  });

  it('Sunday → Saturday (so $lt:Sat returns Friday)', () => {
    const result = getPreviousTradingDayCutoff(d('2025-01-12')); // Sun
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-11'); // Sat
  });
});
```

### Step 2: Run tests to verify they fail

```bash
cd /Users/ian/App/side_project/stock_monitoring/stock
npm test -- --testPathPattern=tradingDay --no-coverage
```

Expected: FAIL — `Cannot find module '../tradingDay'`

### Step 3: Implement the utility

Create `stock/libs/tradingDay.js`:

```js
/**
 * Returns the cutoff date for a MongoDB $lt query that finds
 * "the most recent trading day before today".
 *
 * Algorithm:
 *   1. Go back 1 day from `now`
 *   2. If that lands on Sunday, roll back 2 more days → Friday
 *   3. If that lands on Saturday, roll back 1 more day → Friday
 *   4. Add 1 day: the result is used with $lt, so +1 makes it inclusive
 *      of the target trading day (equivalent to $lte on that day)
 *
 * Holidays are NOT handled here — the MongoDB query's sort+$first
 * pattern already returns the last available row automatically.
 *
 * @param {Date} now - current date/time (default: new Date())
 * @returns {Date}
 */
function getPreviousTradingDayCutoff(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);          // step back 1 day

  const dow = d.getDay();              // 0 = Sun, 6 = Sat
  if (dow === 0) d.setDate(d.getDate() - 2); // Sun → Fri
  if (dow === 6) d.setDate(d.getDate() - 1); // Sat → Fri

  d.setDate(d.getDate() + 1);          // +1 for $lt semantics

  return d;
}

module.exports = { getPreviousTradingDayCutoff };
```

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=tradingDay --no-coverage
```

Expected: PASS (6 tests)

### Step 5: Commit

```bash
cd /Users/ian/App/side_project/stock_monitoring/stock
git add libs/tradingDay.js libs/__tests__/tradingDay.test.js
git commit -m "feat: add getPreviousTradingDayCutoff utility — explicit weekend skip for $lt queries"
```

---

## Task 2 — Apply utility to `previousDayPrice` and `previousDayPrices`

**Files:**
- Modify: `stock/handlers/daily.js` (two `case '1D':` blocks)

### Step 1: No new test needed

The unit test in Task 1 covers the date logic. The handlers themselves cannot be easily unit-tested without a full MongoDB mock setup; the utility test is sufficient.

### Step 2: Update `daily.js`

Add the require at the top of the file:

```js
// Add near the top, after existing requires:
const { getPreviousTradingDayCutoff } = require('../libs/tradingDay');
```

In `exports.previousDayPrice` — replace:

```js
// BEFORE
case "1D":
  timeRange.setDate(timeRange.getDate() - 1);
  break;
```

```js
// AFTER
case "1D":
  timeRange = getPreviousTradingDayCutoff(timeRange);
  break;
```

In `exports.previousDayPrices` — replace:

```js
// BEFORE
case '1D':
  timeRange.setDate(timeRange.getDate() - 1);
  break;
```

```js
// AFTER
case '1D':
  timeRange = getPreviousTradingDayCutoff(timeRange);
  break;
```

> **Note:** Both functions already use `$lt: timeRange.toISOString().slice(0, 10)`. The utility returns a Date whose `slice(0, 10)` produces the correct cutoff string. No other query changes needed.

### Step 3: Verify all backend tests still pass

```bash
cd /Users/ian/App/side_project/stock_monitoring/stock
npm test -- --no-coverage
```

Expected: all existing tests pass, new tradingDay tests pass.

### Step 4: Commit

```bash
git add handlers/daily.js
git commit -m "fix: use getPreviousTradingDayCutoff in previousDayPrice handlers — skip weekends explicitly"
```

---

## Manual Verification

After deploying (or running `serverless dev`), confirm:

| Day to test | Expected `previousDayPrices` result |
|---|---|
| Call on a Monday | Returns Friday's close |
| Call on a Tuesday | Returns Monday's close |
| Call on a Saturday | Returns Friday's close |
| Call on a Sunday | Returns Friday's close |
| Week with a holiday (e.g. Thu is holiday) | Returns Wednesday's close when called on Friday |

The last row is handled automatically by the DB sort — no code change needed.
