# Strategy Engine — Mission B: Signal Accuracy Improvements

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add four net-new accuracy capabilities on top of the corrected Mission A foundation.

**Architecture:** New utility files (`instrumentProfiles.ts`, `crossoverDetector.ts`, `divergenceDetector.ts`) plus additions to `strategyEngine.ts` and `strategyRuleEngine.ts`. Nothing from Mission A is touched again. All new params are optional for backward compatibility.

**Prerequisites:** Mission A must be merged before starting Mission B.

**Tech Stack:** TypeScript, Jest (`npm test -- --testPathPattern=<filename>`)

---

## Task 1: Instrument-Aware Thresholds

**Files:**
- Create: `src/app/utils/constants/instrumentProfiles.ts`
- Modify: `src/app/utils/strategyEngine.ts`
- Create: `src/app/utils/__tests__/instrumentProfiles.test.ts`

### Step 1: Write failing tests

```typescript
// src/app/utils/__tests__/instrumentProfiles.test.ts
import { getInstrumentProfile, DEFAULT_PROFILE } from '../constants/instrumentProfiles';
import { RSIAnalyzer, MACDAnalyzer } from '../strategyEngine';

describe('getInstrumentProfile', () => {
  it('returns TQQQ profile with higher MACD threshold', () => {
    const profile = getInstrumentProfile('TQQQ');
    expect(profile.macdStrongThreshold).toBeGreaterThan(DEFAULT_PROFILE.macdStrongThreshold);
  });

  it('returns DEFAULT_PROFILE for unknown symbols', () => {
    const profile = getInstrumentProfile('UNKNOWN');
    expect(profile).toEqual(DEFAULT_PROFILE);
  });

  it('TQQQ rsiOversold is stricter (lower) than QQQ', () => {
    const tqqq = getInstrumentProfile('TQQQ');
    const qqq = getInstrumentProfile('QQQ');
    expect(tqqq.rsiOversold).toBeLessThan(qqq.rsiOversold);
  });
});

describe('RSIAnalyzer with instrument profile', () => {
  it('uses custom rsiOversold threshold from profile', () => {
    const tqqqProfile = getInstrumentProfile('TQQQ'); // oversold=25
    // RSI=28: oversold for QQQ (30), but NOT oversold for TQQQ (25)
    const withProfile = RSIAnalyzer.analyze(28, tqqqProfile);
    const withoutProfile = RSIAnalyzer.analyze(28);
    expect(withProfile.signal).toBe('neutral'); // 28 > 25 threshold
    expect(withoutProfile.signal).toBe('bullish'); // 28 < 30 default threshold
  });
});

describe('MACDAnalyzer with instrument profile', () => {
  it('TQQQ histogram=1.0 is NOT strong (below TQQQ threshold of 2.0)', () => {
    const tqqqProfile = getInstrumentProfile('TQQQ');
    const result = MACDAnalyzer.analyze(
      { dif: 1.0, dea: 0.5, histogram: 0.5 },
      tqqqProfile
    );
    expect(result.confidence).toBe('moderate'); // not strong
  });

  it('QQQ histogram=0.6 IS strong (above QQQ threshold of 0.5)', () => {
    const qqqProfile = getInstrumentProfile('QQQ');
    const result = MACDAnalyzer.analyze(
      { dif: 0.6, dea: 0.3, histogram: 0.3 },
      qqqProfile
    );
    expect(result.confidence).toBe('strong');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=instrumentProfiles
```

Expected: FAIL — module not found

### Step 3: Create `instrumentProfiles.ts`

```typescript
// src/app/utils/constants/instrumentProfiles.ts

export interface InstrumentProfile {
  macdStrongThreshold: number;  // histogram abs value = "strong" signal
  rsiOverbought: number;        // RSI level = overbought
  rsiOversold: number;          // RSI level = oversold
  rsiExtremeOverbought: number; // RSI level = extreme overbought
  rsiExtremeOversold: number;   // RSI level = extreme oversold
}

export const DEFAULT_PROFILE: InstrumentProfile = {
  macdStrongThreshold: 0.5,
  rsiOverbought: 70,
  rsiOversold: 30,
  rsiExtremeOverbought: 80,
  rsiExtremeOversold: 20,
};

const INSTRUMENT_PROFILES: Record<string, InstrumentProfile> = {
  QQQ: {
    macdStrongThreshold: 0.5,
    rsiOverbought: 70,
    rsiOversold: 30,
    rsiExtremeOverbought: 80,
    rsiExtremeOversold: 20,
  },
  TQQQ: {
    macdStrongThreshold: 2.0,
    rsiOverbought: 75,
    rsiOversold: 25,
    rsiExtremeOverbought: 82,
    rsiExtremeOversold: 18,
  },
  NVDL: {
    macdStrongThreshold: 1.2,
    rsiOverbought: 72,
    rsiOversold: 28,
    rsiExtremeOverbought: 80,
    rsiExtremeOversold: 20,
  },
};

export function getInstrumentProfile(symbol: string): InstrumentProfile {
  return INSTRUMENT_PROFILES[symbol.toUpperCase()] ?? DEFAULT_PROFILE;
}
```

### Step 4: Update `RSIAnalyzer.analyze` to accept optional profile

In `strategyEngine.ts`, update `RSIAnalyzer`:

```typescript
import type { InstrumentProfile } from './constants/instrumentProfiles';
import { DEFAULT_PROFILE } from './constants/instrumentProfiles';

export class RSIAnalyzer {
  static analyze(rsi: number, profile: InstrumentProfile = DEFAULT_PROFILE): IndicatorJudgment {
    const { rsiExtremeOverbought, rsiOverbought, rsiExtremeOversold, rsiOversold } = profile;

    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    if (rsi >= rsiExtremeOverbought) {
      signal = 'extreme';
      strength = Math.min(95, 60 + (rsi - rsiExtremeOverbought) * 2);
      confidence = 'strong';
      message = 'strategy_rsi_extreme_overbought';
      reasons = ['strategy_rsi_above_80', 'strategy_short_term_pullback_risk'];
      return { indicator: 'RSI', signal, strength, confidence, message, reasons, direction: 'overbought' };
    } else if (rsi >= rsiOverbought) {
      signal = 'bearish';
      strength = 60 + (rsi - rsiOverbought);
      confidence = rsi >= (rsiOverbought + 5) ? 'strong' : 'moderate';
      message = 'strategy_rsi_overbought_zone';
      reasons = ['strategy_rsi_entered_overbought', 'strategy_consider_reducing_position'];
      return { indicator: 'RSI', signal, strength, confidence, message, reasons, direction: 'overbought' };
    } else if (rsi <= rsiExtremeOversold) {
      signal = 'extreme';
      strength = Math.min(95, 60 + (rsiExtremeOversold - rsi) * 2);
      confidence = 'strong';
      message = 'strategy_rsi_extreme_oversold';
      reasons = ['strategy_rsi_below_20', 'strategy_rebound_opportunity'];
      return { indicator: 'RSI', signal, strength, confidence, message, reasons, direction: 'oversold' };
    } else if (rsi <= rsiOversold) {
      signal = 'bullish';
      strength = 60 + (rsiOversold - rsi);
      confidence = rsi <= (rsiOversold - 5) ? 'strong' : 'moderate';
      message = 'strategy_rsi_oversold_zone';
      reasons = ['strategy_rsi_entered_oversold', 'strategy_consider_gradual_buy'];
      return { indicator: 'RSI', signal, strength, confidence, message, reasons, direction: 'oversold' };
    } else {
      signal = 'neutral';
      strength = 50 - Math.abs(rsi - 50) / 2;
      confidence = 'weak';
      message = 'strategy_rsi_neutral_zone';
      reasons = ['strategy_rsi_in_neutral', 'strategy_wait_clear_signal'];
      return { indicator: 'RSI', signal, strength, confidence, message, reasons };
    }
  }
}
```

### Step 5: Update `MACDAnalyzer.analyze` to accept optional profile

```typescript
export class MACDAnalyzer {
  static analyze(
    macd: { dif: number; dea: number; histogram: number },
    profile: InstrumentProfile = DEFAULT_PROFILE
  ): IndicatorJudgment {
    const { dif, dea, histogram } = macd;
    const { macdStrongThreshold } = profile;

    const trendStrength = Math.abs(histogram) * 10;
    const isGoldenCross = dif > dea && histogram > 0;
    const isDeathCross = dif < dea && histogram < 0;
    const isStrong = Math.abs(histogram) > macdStrongThreshold; // was hardcoded 0.5

    // ... rest of existing logic unchanged ...
```

### Step 6: Update `StrategyEngine.analyzeIndicators` to accept and pass profile

```typescript
static analyzeIndicators(
  data: StockAnalysisDTO,
  currentPrice?: number,
  profile?: InstrumentProfile   // ADD
): IndicatorJudgment[] {
  const judgments: IndicatorJudgment[] = [];

  if (data.rsi && data.rsi[14]) {
    judgments.push(RSIAnalyzer.analyze(data.rsi[14], profile));   // pass profile
  }

  if (data.macd) {
    judgments.push(MACDAnalyzer.analyze(data.macd, profile));     // pass profile
  }

  // MA block (unchanged from Mission A)
  if (currentPrice && data.ma && data.ma[20]) {
    judgments.push(MAAnalyzer.analyze(currentPrice, data.ma[20], data.ema?.[5]));
  }

  if (data.kdj) {
    judgments.push(KDJAnalyzer.analyze(data.kdj));
  }

  return judgments;
}
```

Also update `performCompleteAnalysis`:

```typescript
static performCompleteAnalysis(
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  profile?: InstrumentProfile   // ADD
): StrategyAnalysis {
  const indicatorJudgments = this.analyzeIndicators(data, currentPrice, profile);
```

### Step 7: Update `useStrategyEngine.ts` to resolve and pass profile

```typescript
import { getInstrumentProfile } from '@/utils/constants/instrumentProfiles';

// In the analysis useMemo (around line 80):
const analysis = useMemo(() => {
  if (!rawData || rawData.length === 0) return null;
  const latestData = rawData[rawData.length - 1];
  const profile = getInstrumentProfile(symbol);
  return StrategyEngine.performCompleteAnalysis(latestData, symbol, latestData.close, profile);
}, [rawData, symbol]);
```

### Step 8: Run tests

```bash
npm test -- --testPathPattern=instrumentProfiles
npm test
```

Expected: All pass

### Step 9: Commit

```bash
git add src/app/utils/constants/instrumentProfiles.ts src/app/utils/strategyEngine.ts src/app/hooks/useStrategyEngine.ts src/app/utils/__tests__/instrumentProfiles.test.ts
git commit -m "feat: add instrument-aware thresholds for QQQ/TQQQ/NVDL"
```

---

## Task 2: Real Crossover Detection Utility

**Files:**
- Create: `src/app/utils/crossoverDetector.ts`
- Modify: `src/app/utils/strategyEngine.ts`
- Create: `src/app/utils/__tests__/crossoverDetector.test.ts`

### Step 1: Write failing tests

```typescript
// src/app/utils/__tests__/crossoverDetector.test.ts
import { detectMACDCross, detectKDJCross } from '../crossoverDetector';

describe('detectMACDCross', () => {
  it('returns golden when DIF crosses above DEA', () => {
    const prev = { dif: -0.1, dea: 0.2 };   // dif < dea
    const curr = { dif: 0.3, dea: 0.2 };    // dif > dea
    expect(detectMACDCross(prev, curr)).toBe('golden');
  });

  it('returns death when DIF crosses below DEA', () => {
    const prev = { dif: 0.3, dea: 0.2 };    // dif > dea
    const curr = { dif: 0.1, dea: 0.2 };    // dif < dea
    expect(detectMACDCross(prev, curr)).toBe('death');
  });

  it('returns null when DIF stays above DEA (no cross)', () => {
    const prev = { dif: 0.5, dea: 0.2 };
    const curr = { dif: 0.6, dea: 0.2 };
    expect(detectMACDCross(prev, curr)).toBeNull();
  });

  it('returns null when DIF stays below DEA (no cross)', () => {
    const prev = { dif: -0.2, dea: 0.2 };
    const curr = { dif: -0.1, dea: 0.2 };
    expect(detectMACDCross(prev, curr)).toBeNull();
  });
});

describe('detectKDJCross', () => {
  it('returns golden when K crosses above D', () => {
    const prev = { k: 40, d: 50 };   // k < d
    const curr = { k: 55, d: 50 };   // k > d
    expect(detectKDJCross(prev, curr)).toBe('golden');
  });

  it('returns death when K crosses below D', () => {
    const prev = { k: 60, d: 50 };
    const curr = { k: 45, d: 50 };
    expect(detectKDJCross(prev, curr)).toBe('death');
  });

  it('returns null when K stays above D', () => {
    const prev = { k: 60, d: 50 };
    const curr = { k: 65, d: 52 };
    expect(detectKDJCross(prev, curr)).toBeNull();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=crossoverDetector
```

Expected: FAIL — module not found

### Step 3: Create `crossoverDetector.ts`

```typescript
// src/app/utils/crossoverDetector.ts

export type CrossSignal = 'golden' | 'death' | null;

/**
 * Detects MACD golden/death cross between two consecutive data points.
 * Golden: DIF was below DEA, now above.
 * Death:  DIF was above DEA, now below.
 */
export function detectMACDCross(
  prev: { dif: number; dea: number },
  current: { dif: number; dea: number }
): CrossSignal {
  const prevAbove = prev.dif > prev.dea;
  const currAbove = current.dif > current.dea;

  if (!prevAbove && currAbove) return 'golden';
  if (prevAbove && !currAbove) return 'death';
  return null;
}

/**
 * Detects KDJ golden/death cross between two consecutive data points.
 * Golden: K was below D, now above.
 * Death:  K was above D, now below.
 */
export function detectKDJCross(
  prev: { k: number; d: number },
  current: { k: number; d: number }
): CrossSignal {
  const prevAbove = prev.k > prev.d;
  const currAbove = current.k > current.d;

  if (!prevAbove && currAbove) return 'golden';
  if (prevAbove && !currAbove) return 'death';
  return null;
}
```

### Step 4: Wire into `MACDAnalyzer` and `KDJAnalyzer`

Update `strategyEngine.ts` imports:

```typescript
import { detectMACDCross, detectKDJCross } from './crossoverDetector';
import type { StockAnalysisDTO } from './dto';
```

Update `MACDAnalyzer.analyze` signature and logic:

```typescript
export class MACDAnalyzer {
  static analyze(
    macd: { dif: number; dea: number; histogram: number },
    profile: InstrumentProfile = DEFAULT_PROFILE,
    previousMacd?: { dif: number; dea: number }   // ADD
  ): IndicatorJudgment {
    // ... existing logic ...
    const crossSignal = previousMacd ? detectMACDCross(previousMacd, macd) : null;

    if (isGoldenCross) {
      signal = 'bullish';
      strength = isStrong ? Math.min(90, 70 + trendStrength) : 60;
      // Fresh cross → upgrade confidence
      confidence = crossSignal === 'golden' ? 'strong' : (isStrong ? 'strong' : 'moderate');
      message = 'strategy_macd_golden_cross';
      reasons = [
        'strategy_dif_crosses_above_dea',
        'strategy_histogram_positive',
        isStrong ? 'strategy_signal_strength_high' : 'strategy_signal_strength_medium',
      ];
      if (crossSignal === 'golden') reasons.push('just_crossed'); // recency signal
    } else if (isDeathCross) {
      // same pattern for death cross
      confidence = crossSignal === 'death' ? 'strong' : (isStrong ? 'strong' : 'moderate');
      if (crossSignal === 'death') reasons.push('just_crossed');
    }
    // ...
```

Update `KDJAnalyzer.analyze` similarly:

```typescript
export class KDJAnalyzer {
  static analyze(
    kdj: { k: number; d: number; j: number },
    previousKdj?: { k: number; d: number }   // ADD
  ): IndicatorJudgment {
    // ... existing logic ...
    const crossSignal = previousKdj ? detectKDJCross(previousKdj, kdj) : null;

    // In the isGoldenCross branch:
    if (isGoldenCross && avgKDJ < 80) {
      signal = 'bullish';
      strength = crossSignal === 'golden' ? 80 : 70; // fresh cross = higher strength
      confidence = crossSignal === 'golden' ? 'strong' : 'moderate';
      message = 'strategy_kdj_golden_cross';
      reasons = ['strategy_k_crosses_above_d', 'strategy_j_confirms_upward'];
      if (crossSignal === 'golden') reasons.push('just_crossed');
    }
    // same for isDeathCross...
```

### Step 5: Thread `previousData` through `analyzeIndicators`

Update `StrategyEngine.analyzeIndicators`:

```typescript
static analyzeIndicators(
  data: StockAnalysisDTO,
  currentPrice?: number,
  profile?: InstrumentProfile,
  previousData?: StockAnalysisDTO   // ADD
): IndicatorJudgment[] {
  // ...
  if (data.macd) {
    judgments.push(MACDAnalyzer.analyze(data.macd, profile, previousData?.macd));
  }
  if (data.kdj) {
    judgments.push(KDJAnalyzer.analyze(data.kdj, previousData?.kdj ?? undefined));
  }
```

Update `performCompleteAnalysis`:

```typescript
static performCompleteAnalysis(
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  profile?: InstrumentProfile,
  previousData?: StockAnalysisDTO   // ADD
): StrategyAnalysis {
  const indicatorJudgments = this.analyzeIndicators(data, currentPrice, profile, previousData);
```

Update `useStrategyEngine.ts`:

```typescript
const analysis = useMemo(() => {
  if (!rawData || rawData.length === 0) return null;
  const latestData = rawData[rawData.length - 1];
  const previousData = rawData.length >= 2 ? rawData[rawData.length - 2] : undefined;
  const profile = getInstrumentProfile(symbol);
  return StrategyEngine.performCompleteAnalysis(latestData, symbol, latestData.close, profile, previousData);
}, [rawData, symbol]);
```

### Step 6: Run tests

```bash
npm test -- --testPathPattern=crossoverDetector
npm test
```

Expected: All pass

### Step 7: Commit

```bash
git add src/app/utils/crossoverDetector.ts src/app/utils/strategyEngine.ts src/app/hooks/useStrategyEngine.ts src/app/utils/__tests__/crossoverDetector.test.ts
git commit -m "feat: add crossover detector, wire into MACD/KDJ analyzers for fresh-cross confidence boost"
```

---

## Task 3: Bollinger Band Strategy

**Files:**
- Modify: `src/app/utils/strategyEngine.ts`
- Modify: `src/app/utils/strategyRuleEngine.ts`
- Modify: `src/app/utils/__tests__/strategyEngine.test.ts` (add tests)

### Step 1: Add Bollinger tests

Append to `strategyEngine.test.ts`:

```typescript
import { BollingerAnalyzer } from '../strategyEngine';

describe('BollingerAnalyzer', () => {
  it('returns bullish when price hugs lower band (%B < 0.05)', () => {
    // price=90.1, lower=90, upper=110, middle=100 → %B = 0.005
    const result = BollingerAnalyzer.analyze(90.1, { middle: 100, upper: 110, lower: 90, datetime: new Date() });
    expect(result.signal).toBe('bullish');
  });

  it('returns bearish when price hugs upper band (%B > 0.95)', () => {
    // price=109.9, lower=90, upper=110 → %B = 0.995
    const result = BollingerAnalyzer.analyze(109.9, { middle: 100, upper: 110, lower: 90, datetime: new Date() });
    expect(result.signal).toBe('bearish');
  });

  it('returns neutral with squeeze reason when band width < 0.1', () => {
    // tight band: upper=101, lower=99, middle=100 → width=0.02
    const result = BollingerAnalyzer.analyze(100, { middle: 100, upper: 101, lower: 99, datetime: new Date() });
    expect(result.signal).toBe('neutral');
    expect(result.reasons).toContain('volatility_squeeze');
  });

  it('returns neutral when price is near midline', () => {
    // %B = 0.5 (midline)
    const result = BollingerAnalyzer.analyze(100, { middle: 100, upper: 110, lower: 90, datetime: new Date() });
    expect(result.signal).toBe('neutral');
  });

  it('StrategyEngine.analyzeIndicators includes Bollinger judgment', () => {
    const data: StockAnalysisDTO = {
      _id: '1', symbol: 'QQQ', datetime: new Date(),
      open: 90.1, close: 90.1,
      macd: { dif: 0, dea: 0, histogram: 0, ema12: 0, ema26: 0 },
      ma: { 20: 100 }, ema: { 5: 90 },
      rsi: { 14: 40, gain: 0, loss: 0 },
      bollinger: { datetime: new Date(), middle: 100, upper: 110, lower: 90 },
      kdj: { datetime: new Date(), k: 50, d: 50, j: 50, rsv: 50 },
    };
    const judgments = StrategyEngine.analyzeIndicators(data, 90.1);
    const bb = judgments.find(j => j.indicator === 'Bollinger');
    expect(bb).toBeDefined();
    expect(bb?.signal).toBe('bullish');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=strategyEngine
```

Expected: FAIL — `BollingerAnalyzer` not exported

### Step 3: Add `BollingerAnalyzer` class to `strategyEngine.ts`

Add after `KDJAnalyzer` class (before the `StrategyEngine` class):

```typescript
/**
 * Bollinger Band判斷規則
 */
export class BollingerAnalyzer {
  static analyze(
    price: number,
    bollinger: { middle: number; upper: number; lower: number; datetime: Date }
  ): IndicatorJudgment {
    const { upper, lower, middle } = bollinger;
    const bandWidth = upper - lower;

    // Protect against zero-width band
    const percentB = bandWidth > 0 ? (price - lower) / bandWidth : 0.5;
    const relativeWidth = middle > 0 ? bandWidth / middle : 1;

    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    // Squeeze check (low volatility — breakout imminent)
    if (relativeWidth < 0.1) {
      signal = 'neutral';
      strength = 50;
      confidence = 'moderate';
      message = 'strategy_bollinger_squeeze';
      reasons = ['volatility_squeeze', 'strategy_breakout_imminent'];
      return { indicator: 'Bollinger', signal, strength, confidence, message, reasons };
    }

    if (percentB < 0.05) {
      signal = 'bullish';
      strength = Math.min(90, 70 + (0.05 - percentB) * 200);
      confidence = percentB < 0.01 ? 'strong' : 'moderate';
      message = 'strategy_bollinger_lower_band';
      reasons = ['strategy_price_at_lower_band', 'strategy_mean_reversion_entry'];
    } else if (percentB > 0.95) {
      signal = 'bearish';
      strength = Math.min(90, 70 + (percentB - 0.95) * 200);
      confidence = percentB > 0.99 ? 'strong' : 'moderate';
      message = 'strategy_bollinger_upper_band';
      reasons = ['strategy_price_at_upper_band', 'strategy_overextension_risk'];
    } else {
      signal = 'neutral';
      strength = 50 - Math.abs(percentB - 0.5) * 40;
      confidence = 'weak';
      message = 'strategy_bollinger_midrange';
      reasons = ['strategy_price_within_bands', 'strategy_wait_band_test'];
    }

    return { indicator: 'Bollinger', signal, strength, confidence, message, reasons };
  }
}
```

### Step 4: Add Bollinger to `StrategyEngine.analyzeIndicators`

In the `analyzeIndicators` method, add after the KDJ block:

```typescript
// Bollinger Bands 分析
if (currentPrice && data.bollinger) {
  judgments.push(BollingerAnalyzer.analyze(currentPrice, data.bollinger));
}
```

### Step 5: Add Bollinger squeeze rule to `strategyRuleEngine.ts`

In `STRATEGY_RULES` array, add new rule after `conservative_hold`:

```typescript
{
  id: 'bollinger_squeeze_breakout',
  name: 'Bollinger擠壓突破',
  description: 'Bollinger Band擠壓後MACD確認方向',
  conditions: [
    {
      indicator: 'MACD',
      operator: '>',
      value: 0.2,
      weight: 0.6,
      required: true,
    },
    {
      indicator: 'RSI',
      operator: 'between',
      value: [45, 70],
      weight: 0.4,
      required: false,
    },
  ],
  action: 'buy',
  weight: 0.75,
  riskLevel: 'high',
  expectedReturn: 0.20,
  maxDrawdown: 0.15,
},
```

### Step 6: Run tests

```bash
npm test -- --testPathPattern=strategyEngine
npm test
```

Expected: All pass

### Step 7: Commit

```bash
git add src/app/utils/strategyEngine.ts src/app/utils/strategyRuleEngine.ts src/app/utils/__tests__/strategyEngine.test.ts
git commit -m "feat: add BollingerAnalyzer with %B and squeeze detection, add squeeze-breakout rule"
```

---

## Task 4: RSI Divergence Detection

**Files:**
- Create: `src/app/utils/divergenceDetector.ts`
- Modify: `src/app/utils/strategyEngine.ts`
- Modify: `src/app/utils/enhancedRiskAlert.ts`
- Create: `src/app/utils/__tests__/divergenceDetector.test.ts`

### Step 1: Write failing tests

```typescript
// src/app/utils/__tests__/divergenceDetector.test.ts
import { detectRSIDivergence } from '../divergenceDetector';

describe('detectRSIDivergence — bearish', () => {
  it('detects bearish divergence: price higher high, RSI lower high', () => {
    // Price: 100 → 90 → 110 (higher high vs first peak at 100)
    // RSI:   70  → 60 → 65  (lower high vs first peak at 70)
    const prices = [100, 95, 90, 95, 110];
    const rsi    = [70,  65, 60, 62, 65];
    const result = detectRSIDivergence(prices, rsi);
    expect(result.type).toBe('bearish');
  });

  it('detects bullish divergence: price lower low, RSI higher low', () => {
    // Price: 100 → 90 (lower low)
    // RSI:   30  → 35 (higher low)
    const prices = [100, 95, 90,  95, 88];
    const rsi    = [30,  28, 32,  31, 35];
    const result = detectRSIDivergence(prices, rsi);
    expect(result.type).toBe('bullish');
  });

  it('returns null when no divergence', () => {
    // Both price and RSI make higher highs
    const prices = [100, 95, 105];
    const rsi    = [50,  48, 55];
    const result = detectRSIDivergence(prices, rsi);
    expect(result.type).toBeNull();
  });

  it('returns null when not enough data (< 5 points)', () => {
    const result = detectRSIDivergence([100, 90], [50, 45]);
    expect(result.type).toBeNull();
  });

  it('strength reflects magnitude of divergence', () => {
    // Large divergence
    const prices = [100, 90, 120];
    const rsi    = [70,  60, 50];
    const bigResult = detectRSIDivergence(prices, rsi);

    // Small divergence
    const prices2 = [100, 90, 101];
    const rsi2    = [70,  60, 69];
    const smallResult = detectRSIDivergence(prices2, rsi2);

    if (bigResult.type && smallResult.type) {
      expect(bigResult.strength).toBeGreaterThan(smallResult.strength);
    }
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=divergenceDetector
```

Expected: FAIL — module not found

### Step 3: Create `divergenceDetector.ts`

```typescript
// src/app/utils/divergenceDetector.ts

export interface DivergenceResult {
  type: 'bullish' | 'bearish' | null;
  strength: number;   // 0-100
  barsAgo: number;    // bars since the most recent extremum used
}

const NULL_RESULT: DivergenceResult = { type: null, strength: 0, barsAgo: 0 };

/**
 * Find indices of local peaks (3-point: point[i] is strictly greater than neighbors)
 */
function findPeaks(values: number[]): number[] {
  const peaks: number[] = [];
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
      peaks.push(i);
    }
  }
  return peaks;
}

/**
 * Find indices of local troughs (3-point: point[i] is strictly less than neighbors)
 */
function findTroughs(values: number[]): number[] {
  const troughs: number[] = [];
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
      troughs.push(i);
    }
  }
  return troughs;
}

/**
 * Detect RSI divergence from recent price and RSI history.
 * Needs at least 5 data points to find two extrema.
 *
 * Bearish divergence: price makes higher high, RSI makes lower high.
 * Bullish divergence: price makes lower low, RSI makes higher low.
 */
export function detectRSIDivergence(
  priceHistory: number[],
  rsiHistory: number[]
): DivergenceResult {
  if (priceHistory.length < 5 || rsiHistory.length < 5) return NULL_RESULT;
  if (priceHistory.length !== rsiHistory.length) return NULL_RESULT;

  const n = priceHistory.length;

  // Check bearish divergence using peaks
  const pricePeaks = findPeaks(priceHistory);
  const rsiPeaks = findPeaks(rsiHistory);

  if (pricePeaks.length >= 2 && rsiPeaks.length >= 2) {
    const p1 = pricePeaks[pricePeaks.length - 2];
    const p2 = pricePeaks[pricePeaks.length - 1];
    const r1 = rsiPeaks[rsiPeaks.length - 2];
    const r2 = rsiPeaks[rsiPeaks.length - 1];

    const priceHigherHigh = priceHistory[p2] > priceHistory[p1];
    const rsiLowerHigh = rsiHistory[r2] < rsiHistory[r1];

    if (priceHigherHigh && rsiLowerHigh) {
      const priceDivergence = (priceHistory[p2] - priceHistory[p1]) / priceHistory[p1];
      const rsiDivergence = (rsiHistory[r1] - rsiHistory[r2]) / rsiHistory[r1];
      const magnitude = (priceDivergence + rsiDivergence) / 2;
      const strength = Math.min(100, magnitude * 500);
      return {
        type: 'bearish',
        strength: Math.round(strength),
        barsAgo: n - 1 - p2,
      };
    }
  }

  // Check bullish divergence using troughs
  const priceTroughs = findTroughs(priceHistory);
  const rsiTroughs = findTroughs(rsiHistory);

  if (priceTroughs.length >= 2 && rsiTroughs.length >= 2) {
    const t1 = priceTroughs[priceTroughs.length - 2];
    const t2 = priceTroughs[priceTroughs.length - 1];
    const r1 = rsiTroughs[rsiTroughs.length - 2];
    const r2 = rsiTroughs[rsiTroughs.length - 1];

    const priceLowerLow = priceHistory[t2] < priceHistory[t1];
    const rsiHigherLow = rsiHistory[r2] > rsiHistory[r1];

    if (priceLowerLow && rsiHigherLow) {
      const priceDivergence = (priceHistory[t1] - priceHistory[t2]) / priceHistory[t1];
      const rsiDivergence = (rsiHistory[r2] - rsiHistory[r1]) / rsiHistory[r1];
      const magnitude = (priceDivergence + rsiDivergence) / 2;
      const strength = Math.min(100, magnitude * 500);
      return {
        type: 'bullish',
        strength: Math.round(strength),
        barsAgo: n - 1 - t2,
      };
    }
  }

  return NULL_RESULT;
}
```

### Step 4: Run divergence tests

```bash
npm test -- --testPathPattern=divergenceDetector
```

Expected: All PASS

### Step 5: Wire divergence into `StrategyEngine.analyzeIndicators`

`StockAnalysisDTO` only holds one data point — divergence needs history. The hook has `rawData[]`. Add a new static method to `StrategyEngine` and call it from the hook separately:

Add to `strategyEngine.ts`:

```typescript
import { detectRSIDivergence, type DivergenceResult } from './divergenceDetector';

export class StrategyEngine {
  // ... existing methods ...

  /**
   * Detect RSI divergence from historical data array.
   * Returns an IndicatorJudgment if divergence found, null otherwise.
   */
  static analyzeDivergence(
    priceHistory: number[],
    rsiHistory: number[]
  ): IndicatorJudgment | null {
    const result = detectRSIDivergence(priceHistory, rsiHistory);
    if (!result.type) return null;

    const isBullish = result.type === 'bullish';
    return {
      indicator: 'Divergence',
      signal: isBullish ? 'bullish' : 'bearish',
      strength: result.strength,
      confidence: result.strength > 60 ? 'strong' : 'moderate',
      message: isBullish ? 'strategy_rsi_bullish_divergence' : 'strategy_rsi_bearish_divergence',
      reasons: [
        isBullish
          ? 'strategy_price_lower_low_rsi_higher_low'
          : 'strategy_price_higher_high_rsi_lower_high',
        `strategy_divergence_${result.barsAgo}_bars_ago`,
      ],
    };
  }
}
```

### Step 6: Wire into `useStrategyEngine.ts`

```typescript
// In the analysis useMemo:
const analysis = useMemo(() => {
  if (!rawData || rawData.length === 0) return null;

  const latestData = rawData[rawData.length - 1];
  const previousData = rawData.length >= 2 ? rawData[rawData.length - 2] : undefined;
  const profile = getInstrumentProfile(symbol);

  const baseAnalysis = StrategyEngine.performCompleteAnalysis(
    latestData, symbol, latestData.close, profile, previousData
  );

  // Add divergence judgment from history (needs array of points)
  if (rawData.length >= 5) {
    const priceHistory = rawData.map(d => d.close);
    const rsiHistory = rawData.map(d => d.rsi?.[14]).filter((v): v is number => v !== undefined);

    if (rsiHistory.length >= 5) {
      const divergenceJudgment = StrategyEngine.analyzeDivergence(priceHistory, rsiHistory);
      if (divergenceJudgment) {
        baseAnalysis.indicatorJudgments.push(divergenceJudgment);
      }
    }
  }

  return baseAnalysis;
}, [rawData, symbol]);
```

### Step 7: Add divergence alert to `EnhancedRiskMonitor`

In `enhancedRiskAlert.ts`, inside `generateTechnicalAlerts`, add after the existing RSI extreme check:

```typescript
// Import at top of file:
import { detectRSIDivergence } from './divergenceDetector';

// Inside generateTechnicalAlerts, add:
// RSI Divergence alert — only fires if barsAgo <= 5 (recent)
// Note: signals array carries divergence judgments from the engine
const divergenceJudgment = indicators.find(i => i.indicator === 'Divergence');
if (divergenceJudgment && divergenceJudgment.strength > 40) {
  const isBullish = divergenceJudgment.signal === 'bullish';
  alerts.push({
    id: `rsi_divergence_${Date.now()}`,
    type: 'warning',
    severity: divergenceJudgment.strength > 70 ? 'high' : 'medium',
    category: 'technical',
    message: {
      title: isBullish ? 'RSI看漲背離' : 'RSI看跌背離',
      description: isBullish
        ? '價格創新低但RSI未創新低，下跌動能衰竭'
        : '價格創新高但RSI未創新高，上漲動能衰竭',
      details: [
        `背離強度: ${divergenceJudgment.strength}%`,
        isBullish ? '可能出現底部反轉' : '可能出現頂部反轉',
        '配合其他指標確認後操作',
      ],
      recommendation: isBullish
        ? '等待確認後可考慮逢低布局'
        : '考慮減倉或設置止盈',
    },
    triggers: {
      conditions: [isBullish ? '價格低點下降，RSI低點上升' : '價格高點上升，RSI高點下降'],
      threshold: 0.6,
      timeframe: '近期',
    },
    impact: {
      probability: divergenceJudgment.strength / 100,
      potentialLoss: isBullish ? 5 : 12,
      timeToMaterialize: '3-10個交易日',
      affectedStrategies: ['動量策略', '趨勢跟踪'],
    },
    mitigation: {
      immediate: isBullish ? ['小倉位試探', '關注突破確認'] : ['考慮部分獲利了結', '收緊止損'],
      shortTerm: ['等待趨勢確認', '控制倉位'],
      longTerm: ['重新評估趨勢有效性'],
      alternatives: isBullish ? ['分批建倉'] : ['轉向防守策略'],
    },
    monitoring: {
      keyMetrics: ['RSI走勢', '價格支撐阻力', 'MACD確認'],
      reviewFrequency: '每日',
      escalationTriggers: ['背離被確認突破', '成交量配合'],
    },
    timestamp: new Date(),
    acknowledged: false,
  });
}
```

### Step 8: Run full test suite

```bash
npm test
```

Expected: All pass

### Step 9: Run TypeScript check

```bash
npm run build
```

Expected: No errors

### Step 10: Commit

```bash
git add src/app/utils/divergenceDetector.ts src/app/utils/strategyEngine.ts src/app/utils/enhancedRiskAlert.ts src/app/hooks/useStrategyEngine.ts src/app/utils/__tests__/divergenceDetector.test.ts
git commit -m "feat: add RSI divergence detection, wire into analyzer and risk alert system"
```

---

## Task 5: Final verification

### Step 1: Run full test suite

```bash
npm test
```

Expected: All tests pass (no regressions)

### Step 2: TypeScript build check

```bash
npm run build
```

Expected: Clean build

### Step 3: Final commit

```bash
git add -A
git commit -m "feat: mission B complete — instrument profiles, crossover detection, Bollinger analysis, RSI divergence"
```
