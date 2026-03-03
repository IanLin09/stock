# Strategy Engine — Mission A: Correctness Fixes

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix four silent bugs in the strategy engine so every existing signal path actually fires.

**Architecture:** Surgical edits to `strategyEngine.ts` and `strategyRuleEngine.ts`. No new files, no new features. Each fix is independently testable. Order matters: Fix 4 → Fix 3 → Fix 1 → Fix 2.

**Tech Stack:** TypeScript, Jest (run tests with `npm test -- --testPathPattern=<filename>`)

---

## Task 1: Fix 4 — Typed `direction` field replaces string matching

**Files:**
- Modify: `src/app/utils/strategyEngine.ts`
- Create: `src/app/utils/__tests__/strategyEngine.test.ts`

### Step 1: Write the failing test

```typescript
// src/app/utils/__tests__/strategyEngine.test.ts
import { RSIAnalyzer, StrategyEngine } from '../strategyEngine';
import type { StockAnalysisDTO } from '../dto';

describe('RSIAnalyzer.analyze — direction field', () => {
  it('sets direction=oversold for RSI <= 20', () => {
    const result = RSIAnalyzer.analyze(15);
    expect(result.direction).toBe('oversold');
  });

  it('sets direction=overbought for RSI >= 80', () => {
    const result = RSIAnalyzer.analyze(85);
    expect(result.direction).toBe('overbought');
  });

  it('sets direction=oversold for RSI 21-30', () => {
    const result = RSIAnalyzer.analyze(28);
    expect(result.direction).toBe('oversold');
  });

  it('sets direction=overbought for RSI 70-79', () => {
    const result = RSIAnalyzer.analyze(72);
    expect(result.direction).toBe('overbought');
  });

  it('leaves direction undefined for RSI in neutral zone', () => {
    const result = RSIAnalyzer.analyze(55);
    expect(result.direction).toBeUndefined();
  });
});

describe('StrategyEngine — mean reversion direction check', () => {
  const makeData = (rsiValue: number): StockAnalysisDTO => ({
    _id: '1',
    symbol: 'QQQ',
    datetime: new Date(),
    open: 100,
    close: 100,
    macd: { dif: 0, dea: 0, histogram: 0, ema12: 0, ema26: 0 },
    ma: { 20: 100 },
    ema: { 5: 100 },
    rsi: { 14: rsiValue, gain: 0, loss: 0 },
    bollinger: { datetime: new Date(), middle: 100, upper: 110, lower: 90 },
    kdj: { datetime: new Date(), k: 50, d: 50, j: 50, rsv: 50 },
  });

  it('returns buy action for extreme oversold RSI (<=20)', () => {
    const data = makeData(15);
    const judgments = StrategyEngine.analyzeIndicators(data);
    const signals = StrategyEngine.generateStrategySignals(judgments);
    const meanReversion = signals.find(s => s.type === 'mean_reversion');
    expect(meanReversion?.action).toBe('buy');
  });

  it('returns sell action for extreme overbought RSI (>=80)', () => {
    const data = makeData(88);
    const judgments = StrategyEngine.analyzeIndicators(data);
    const signals = StrategyEngine.generateStrategySignals(judgments);
    const meanReversion = signals.find(s => s.type === 'mean_reversion');
    expect(meanReversion?.action).toBe('sell');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: FAIL — `direction` property does not exist on `IndicatorJudgment`

### Step 3: Add `direction` field to `IndicatorJudgment` interface

In `src/app/utils/strategyEngine.ts`, update the interface (around line 16):

```typescript
export interface IndicatorJudgment {
  indicator: string;
  signal: IndicatorSignal;
  strength: number;
  confidence: ConfidenceLevel;
  message: string;
  reasons: string[];
  direction?: 'oversold' | 'overbought'; // ADD THIS
}
```

### Step 4: Populate `direction` in `RSIAnalyzer.analyze`

Update `RSIAnalyzer.analyze` return statements (around lines 68–113):

```typescript
// In the rsi >= 80 block — add direction: 'overbought'
return {
  indicator: 'RSI',
  signal,
  strength,
  confidence,
  message,
  reasons,
  direction: 'overbought' as const,
};

// In the rsi >= 70 block — add direction: 'overbought'
return {
  indicator: 'RSI',
  signal,
  strength,
  confidence,
  message,
  reasons,
  direction: 'overbought' as const,
};

// In the rsi <= 20 block — add direction: 'oversold'
return {
  indicator: 'RSI',
  signal,
  strength,
  confidence,
  message,
  reasons,
  direction: 'oversold' as const,
};

// In the rsi <= 30 block — add direction: 'oversold'
return {
  indicator: 'RSI',
  signal,
  strength,
  confidence,
  message,
  reasons,
  direction: 'oversold' as const,
};

// neutral zone — no direction field (leave as-is, TypeScript omits undefined)
```

### Step 5: Fix `generateMeanReversionStrategy` to use typed field

In `StrategyEngine.generateMeanReversionStrategy` (around line 456):

```typescript
// BEFORE:
action = rsiJudgment.reasons.some(
  (r) => r.includes('oversold') || r.includes('超賣')
)
  ? 'buy'
  : 'sell';

// AFTER:
action = rsiJudgment.direction === 'oversold' ? 'buy' : 'sell';
```

### Step 6: Run tests to verify they pass

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: All direction + mean reversion tests PASS

### Step 7: Commit

```bash
git add src/app/utils/strategyEngine.ts src/app/utils/__tests__/strategyEngine.test.ts
git commit -m "fix: add typed direction field to IndicatorJudgment, replace fragile string matching in mean reversion"
```

---

## Task 2: Fix 3 — Remove dead volume code

**Files:**
- Modify: `src/app/utils/strategyRuleEngine.ts`
- Modify: `src/app/utils/__tests__/strategyEngine.test.ts` (add test)

### Step 1: Add test to verify no rule silently fails due to volume

Append to `strategyEngine.test.ts`:

```typescript
import { RuleEngine, STRATEGY_RULES } from '../strategyRuleEngine';

describe('RuleEngine — no dead volume conditions', () => {
  it('STRATEGY_RULES contains no volume conditions', () => {
    const volumeConditions = STRATEGY_RULES.flatMap(r => r.conditions)
      .filter(c => c.indicator === 'volume');
    expect(volumeConditions).toHaveLength(0);
  });

  it('evaluateCondition does not accept volume indicator type', () => {
    // TypeScript will enforce this at compile time — confirm at runtime
    // by verifying no rule references it
    const ruleIds = STRATEGY_RULES.map(r => r.id);
    expect(ruleIds).toContain('breakout_macd_surge'); // renamed from breakout_volume_surge
    expect(ruleIds).not.toContain('breakout_volume_surge');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: FAIL — rule id is still `breakout_volume_surge`

### Step 3: Remove volume from `RuleCondition` type

In `strategyRuleEngine.ts` around line 24:

```typescript
// BEFORE:
indicator: 'RSI' | 'MACD' | 'MA' | 'KDJ' | 'price' | 'volume';

// AFTER:
indicator: 'RSI' | 'MACD' | 'MA' | 'KDJ' | 'price';
```

### Step 4: Remove volume case from `evaluateCondition`

Remove these lines from `RuleEngine.evaluateCondition` (around line 344):

```typescript
// DELETE THIS ENTIRE CASE:
case 'volume':
  // 這裡需要成交量數據，暫時跳過
  return false;
```

### Step 5: Rename `breakout_volume_surge` rule

In `STRATEGY_RULES` array (around line 194):

```typescript
// BEFORE:
{
  id: 'breakout_volume_surge',
  name: '放量突破',

// AFTER:
{
  id: 'breakout_macd_surge',
  name: 'MACD強勢突破',
```

### Step 6: Run tests to verify they pass

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: All volume tests PASS, no TypeScript errors

### Step 7: Commit

```bash
git add src/app/utils/strategyRuleEngine.ts src/app/utils/__tests__/strategyEngine.test.ts
git commit -m "fix: remove dead volume conditions from RuleEngine, rename breakout rule"
```

---

## Task 3: Fix 1 — Thread `currentPrice`, re-enable MA analysis

**Files:**
- Modify: `src/app/utils/strategyEngine.ts`
- Modify: `src/app/utils/strategyIntegrator.ts`
- Modify: `src/app/hooks/useStrategyEngine.ts`
- Modify: `src/app/utils/__tests__/strategyEngine.test.ts` (add test)

### Step 1: Add MA test

Append to `strategyEngine.test.ts`:

```typescript
describe('StrategyEngine — MA analysis fires when price is provided', () => {
  const makeDataWithPrice = (close: number, ma20: number): StockAnalysisDTO => ({
    _id: '1',
    symbol: 'QQQ',
    datetime: new Date(),
    open: close,
    close,
    macd: { dif: 0, dea: 0, histogram: 0, ema12: 0, ema26: 0 },
    ma: { 20: ma20 },
    ema: { 5: close },
    rsi: { 14: 50, gain: 0, loss: 0 },
    bollinger: { datetime: new Date(), middle: ma20, upper: ma20 * 1.1, lower: ma20 * 0.9 },
    kdj: { datetime: new Date(), k: 50, d: 50, j: 50, rsv: 50 },
  });

  it('includes MA judgment when currentPrice is provided', () => {
    const data = makeDataWithPrice(110, 100); // price 10% above MA20
    const judgments = StrategyEngine.analyzeIndicators(data, 110);
    const maJudgment = judgments.find(j => j.indicator === 'MA');
    expect(maJudgment).toBeDefined();
    expect(maJudgment?.signal).toBe('bullish');
  });

  it('excludes MA judgment when currentPrice is not provided', () => {
    const data = makeDataWithPrice(110, 100);
    const judgments = StrategyEngine.analyzeIndicators(data);
    const maJudgment = judgments.find(j => j.indicator === 'MA');
    expect(maJudgment).toBeUndefined();
  });

  it('returns bearish MA when price is 5% below MA20', () => {
    const data = makeDataWithPrice(95, 100);
    const judgments = StrategyEngine.analyzeIndicators(data, 95);
    const maJudgment = judgments.find(j => j.indicator === 'MA');
    expect(maJudgment?.signal).toBe('bearish');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: FAIL — `analyzeIndicators` doesn't accept second param

### Step 3: Update `StrategyEngine.analyzeIndicators` signature

In `strategyEngine.ts` around line 334:

```typescript
// BEFORE:
static analyzeIndicators(data: StockAnalysisDTO): IndicatorJudgment[] {

// AFTER:
static analyzeIndicators(data: StockAnalysisDTO, currentPrice?: number): IndicatorJudgment[] {
```

### Step 4: Uncomment and fix the MA block

In `analyzeIndicators` around lines 347–351, replace the commented block:

```typescript
// BEFORE (commented out):
// MA 分析 (假設我們有當前價格)
if (data.ma && data.ma[20] && data.ema && data.ema[5]) {
  // 這裡需要當前價格，可能需要從其他地方獲取
  // judgments.push(MAAnalyzer.analyze(currentPrice, data.ma[20], data.ema[5]));
}

// AFTER:
if (currentPrice && data.ma && data.ma[20]) {
  judgments.push(MAAnalyzer.analyze(currentPrice, data.ma[20], data.ema?.[5]));
}
```

### Step 5: Update `performCompleteAnalysis` to thread `currentPrice`

In `strategyEngine.ts` around line 531:

```typescript
// BEFORE:
static performCompleteAnalysis(data: StockAnalysisDTO, symbol: string): StrategyAnalysis {
  const indicatorJudgments = this.analyzeIndicators(data);

// AFTER:
static performCompleteAnalysis(data: StockAnalysisDTO, symbol: string, currentPrice?: number): StrategyAnalysis {
  const indicatorJudgments = this.analyzeIndicators(data, currentPrice);
```

### Step 6: Update `strategyIntegrator.ts` to thread `currentPrice`

In `strategyIntegrator.ts` around line 89:

```typescript
// BEFORE:
const technicalAnalysis = StrategyEngine.performCompleteAnalysis(data, symbol);

// AFTER:
const technicalAnalysis = StrategyEngine.performCompleteAnalysis(data, symbol, currentPrice);
```

### Step 7: Update `useStrategyEngine.ts` to pass `close` price

In `useStrategyEngine.ts` around line 84:

```typescript
// BEFORE:
const latestData = rawData[rawData.length - 1];
return StrategyEngine.performCompleteAnalysis(latestData, symbol);

// AFTER:
const latestData = rawData[rawData.length - 1];
return StrategyEngine.performCompleteAnalysis(latestData, symbol, latestData.close);
```

Also update `useIndicatorTrend` around line 314:

```typescript
// BEFORE:
const analysis = StrategyEngine.analyzeIndicators(item);

// AFTER:
const analysis = StrategyEngine.analyzeIndicators(item, item.close);
```

### Step 8: Run tests to verify they pass

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: All MA threading tests PASS

### Step 9: Run full test suite to check for regressions

```bash
npm test
```

Expected: No new failures

### Step 10: Commit

```bash
git add src/app/utils/strategyEngine.ts src/app/utils/strategyIntegrator.ts src/app/hooks/useStrategyEngine.ts src/app/utils/__tests__/strategyEngine.test.ts
git commit -m "fix: thread currentPrice through analyzeIndicators, re-enable MA analysis"
```

---

## Task 4: Fix 2 — Real cross detection with `previousData`

**Files:**
- Modify: `src/app/utils/strategyRuleEngine.ts`
- Modify: `src/app/utils/strategyIntegrator.ts`
- Modify: `src/app/utils/__tests__/strategyEngine.test.ts` (add test)

### Step 1: Add cross detection test

Append to `strategyEngine.test.ts`:

```typescript
import type { StockAnalysisDTO } from '../dto';

const makeRuleData = (difOverDea: boolean, histValue: number): StockAnalysisDTO => ({
  _id: '1',
  symbol: 'QQQ',
  datetime: new Date(),
  open: 100,
  close: 103,
  macd: {
    dif: difOverDea ? 0.3 : -0.3,
    dea: 0,
    histogram: histValue,
    ema12: 0,
    ema26: 0,
  },
  ma: { 20: 100 },
  ema: { 5: 103 },
  rsi: { 14: 55, gain: 0, loss: 0 },
  bollinger: { datetime: new Date(), middle: 100, upper: 110, lower: 90 },
  kdj: { datetime: new Date(), k: 55, d: 50, j: 60, rsv: 50 },
});

describe('RuleEngine — cross_above only fires on actual crossover bar', () => {
  it('cross_above fires when prev histogram was negative, current is positive', () => {
    const current = makeRuleData(true, 0.4);   // DIF just crossed above DEA
    const previous = makeRuleData(false, -0.2); // DIF was below DEA

    const { RuleEngine } = require('../strategyRuleEngine');
    const result = RuleEngine.evaluateCondition(
      { indicator: 'MACD', operator: 'cross_above', value: 0, weight: 1, required: true },
      current,
      103,
      previous
    );
    expect(result).toBe(true);
  });

  it('cross_above does NOT fire when already above (continuation, no fresh cross)', () => {
    const current = makeRuleData(true, 0.4);    // DIF above DEA
    const previous = makeRuleData(true, 0.2);   // DIF was already above DEA

    const { RuleEngine } = require('../strategyRuleEngine');
    const result = RuleEngine.evaluateCondition(
      { indicator: 'MACD', operator: 'cross_above', value: 0, weight: 1, required: true },
      current,
      103,
      previous
    );
    expect(result).toBe(false);
  });

  it('cross_above gracefully falls back to > when no previousData', () => {
    const current = makeRuleData(true, 0.4);

    const { RuleEngine } = require('../strategyRuleEngine');
    const result = RuleEngine.evaluateCondition(
      { indicator: 'MACD', operator: 'cross_above', value: 0, weight: 1, required: true },
      current,
      103,
      undefined // no previous data
    );
    expect(result).toBe(true); // fallback: histogram > 0
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: FAIL — `evaluateCondition` doesn't accept `previousData`

### Step 3: Add `previousData` param to `evaluateCondition`

In `strategyRuleEngine.ts` around line 305:

```typescript
// BEFORE:
static evaluateCondition(
  condition: RuleCondition,
  data: StockAnalysisDTO,
  currentPrice?: number
): boolean {

// AFTER:
static evaluateCondition(
  condition: RuleCondition,
  data: StockAnalysisDTO,
  currentPrice?: number,
  previousData?: StockAnalysisDTO
): boolean {
```

### Step 4: Replace cross operator logic

In `evaluateCondition`, replace the cross_above/cross_below case (around line 372):

```typescript
case 'cross_above':
case 'cross_below': {
  if (!previousData) {
    // graceful degradation: no history, use simple comparison
    return operator === 'cross_above'
      ? actualValue > (value as number)
      : actualValue < (value as number);
  }

  // get previous indicator value using the same switch logic
  let prevValue: number | undefined;
  switch (indicator) {
    case 'MACD':
      prevValue = previousData.macd?.histogram;
      break;
    case 'MA':
      if (currentPrice && previousData.ma?.['20'] && previousData.close) {
        prevValue = (previousData.close - previousData.ma['20']) / previousData.ma['20'];
      }
      break;
    case 'KDJ':
      if (previousData.kdj) {
        prevValue = (previousData.kdj.k + previousData.kdj.d + previousData.kdj.j) / 3;
      }
      break;
    default:
      // unsupported cross indicator — fall back
      return operator === 'cross_above'
        ? actualValue > (value as number)
        : actualValue < (value as number);
  }

  if (prevValue === undefined) {
    return operator === 'cross_above'
      ? actualValue > (value as number)
      : actualValue < (value as number);
  }

  if (operator === 'cross_above') {
    return prevValue <= (value as number) && actualValue > (value as number);
  } else {
    return prevValue >= (value as number) && actualValue < (value as number);
  }
}
```

### Step 5: Thread `previousData` through `evaluateRule`, `evaluateAllRules`, `getBestStrategy`

In `strategyRuleEngine.ts`:

```typescript
// evaluateRule signature (around line 386):
static evaluateRule(
  rule: StrategyRule,
  data: StockAnalysisDTO,
  currentPrice?: number,
  previousData?: StockAnalysisDTO
): RuleMatchResult {
  // ...
  // update the evaluateCondition call inside:
  const isMatched = this.evaluateCondition(condition, data, currentPrice, previousData);
```

```typescript
// evaluateAllRules signature (around line 450):
static evaluateAllRules(
  data: StockAnalysisDTO,
  currentPrice?: number,
  previousData?: StockAnalysisDTO
): RuleMatchResult[] {
  return STRATEGY_RULES.map((rule) =>
    this.evaluateRule(rule, data, currentPrice, previousData)
  );
}
```

```typescript
// getBestStrategy signature (around line 462):
static getBestStrategy(
  data: StockAnalysisDTO,
  currentPrice?: number,
  previousData?: StockAnalysisDTO
): RuleMatchResult | null {
  const results = this.evaluateAllRules(data, currentPrice, previousData);
```

### Step 6: Thread `previousData` through `strategyIntegrator.ts`

```typescript
// performCompleteAnalysis signature (around line 78):
static async performCompleteAnalysis(
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  options?: { ... },
  previousData?: StockAnalysisDTO   // ADD
): Promise<IntegratedAnalysis> {
  // ...
  // update the RuleEngine call (around line 95):
  const ruleResults = RuleEngine.evaluateAllRules(data, currentPrice, previousData);
```

Also update `quickAnalyze` exported function at the bottom:

```typescript
export const quickAnalyze = (
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  previousData?: StockAnalysisDTO   // ADD
) => {
  return StrategyIntegrator.quickAnalysis(data, symbol, currentPrice, previousData);
};
```

And `StrategyIntegrator.quickAnalysis`:

```typescript
static quickAnalysis(
  data: StockAnalysisDTO,
  _symbol: string,
  currentPrice?: number,
  previousData?: StockAnalysisDTO   // ADD
): { ... } {
  const bestStrategy = RuleEngine.getBestStrategy(data, currentPrice, previousData);
```

### Step 7: Run tests

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: All cross detection tests PASS

### Step 8: Run full suite

```bash
npm test
```

Expected: No new failures

### Step 9: Commit

```bash
git add src/app/utils/strategyRuleEngine.ts src/app/utils/strategyIntegrator.ts src/app/utils/__tests__/strategyEngine.test.ts
git commit -m "fix: add real cross detection to RuleEngine using previousData, thread through integrator"
```

---

## Task 5: Final verification

### Step 1: Run full test suite

```bash
npm test
```

Expected: All tests pass

### Step 2: Run TypeScript check

```bash
npm run build
```

Expected: No TypeScript errors

### Step 3: Commit if any loose ends fixed

```bash
git add -A
git commit -m "fix: mission A complete — all four correctness fixes applied"
```
