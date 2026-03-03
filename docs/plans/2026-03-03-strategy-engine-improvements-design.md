# Strategy Engine Improvements — Design Document

**Date:** 2026-03-03
**Branch:** feature/strategy-engine-improvements (to be created)
**Scope:** Frontend — `src/app/utils/`

---

## Overview

Two sequential missions to improve the strategy engine. Mission A fixes correctness bugs
(dead code, disabled logic, fragile string matching). Mission B adds net-new accuracy
capabilities on top of the corrected foundation.

**Dependency:** Mission B must follow Mission A. Each mission ships as its own branch and PR.

---

## Mission A — Correctness Fixes

**Goal:** Make the existing strategy logic actually work as intended. No new features.
Every fix is verifiable with a unit test.

### Fix 1 — Re-enable MA Analysis

**Problem:** `StrategyEngine.analyzeIndicators()` has the `MAAnalyzer.analyze()` call
commented out because `currentPrice` is not threaded through.

**Fix:** Add `currentPrice?: number` as a second parameter to `analyzeIndicators()`.
Uncomment the `MAAnalyzer.analyze()` call. Update all callers
(`strategyIntegrator.ts`, `useStrategyEngine` hook) to forward the price value they
already hold.

**Test:** MA judgment fires and returns `bullish` when price is 5% above MA20.

---

### Fix 2 — Real Cross Detection in RuleEngine

**Problem:** `cross_above`/`cross_below` operators in `RuleEngine.evaluateCondition()`
silently fall back to `>` / `<`. No actual crossover is detected.

**Fix:** Add `previousData?: StockAnalysisDTO` optional param to `evaluateCondition()`
and `evaluateRule()`. For `cross_above` MACD: confirm
`prev.dif <= prev.dea && current.dif > current.dea`. For MA cross: same two-point check
on `(price - ma) / ma`. If `previousData` is absent, keep `>` / `<` as graceful
degradation.

**Test:** Rule with `cross_above` only matches on the day of the actual cross, not on
day 5 of an existing uptrend.

---

### Fix 3 — Remove Dead Volume Code

**Problem:** The `volume` case in `evaluateCondition()` always returns `false`, silently
failing any rule with `required: true` on volume.

**Fix:**
- Remove `volume` from the `RuleCondition.indicator` union type
- Remove the `volume` case from `evaluateCondition()`
- Remove `volume` from any `STRATEGY_RULES` conditions
- Rename `breakout_volume_surge` rule to `breakout_macd_surge` (accurate name)

**Test:** No matched rule returns `false` due to a volume condition; removed rules
contain no volume reference.

---

### Fix 4 — Fix Mean Reversion String Matching

**Problem:** `generateMeanReversionStrategy()` checks `r.includes('oversold')` on i18n
key strings. A key rename silently breaks the logic.

**Fix:** Add `direction?: 'oversold' | 'overbought'` field to the `IndicatorJudgment`
interface. Populate it in `RSIAnalyzer.analyze()` for extreme signals. Replace the
`includes()` string check with `rsiJudgment.direction === 'oversold'`.

**Test:** Mean reversion strategy returns `buy` for RSI extreme oversold, `sell` for
extreme overbought, regardless of i18n key values.

---

### Mission A File Changes

| File | Type |
|---|---|
| `strategyEngine.ts` | Modify — thread `currentPrice`, add `direction` field, uncomment MA |
| `strategyRuleEngine.ts` | Modify — add `previousData` param, remove volume, rename rule |
| `strategyIntegrator.ts` | Modify — forward `currentPrice` to `analyzeIndicators()` |
| `hooks/useStrategyEngine.ts` | Modify — forward `currentPrice` |
| `strategyEngine.test.ts` | New — unit tests for all 4 fixes |

---

## Mission B — Signal Accuracy Improvements

**Goal:** Four net-new capabilities. No Mission A files are touched again.
All additions are backward-compatible (optional parameters, new files).

### Improvement 1 — Instrument-Aware Thresholds

**Problem:** `isStrong = Math.abs(histogram) > 0.5` and RSI bands (30/70) are
one-size-fits-all. TQQQ (3× leveraged) has histograms of 3–8; QQQ ~0.5–1.5.

**Design:** New file `src/app/utils/constants/instrumentProfiles.ts`:

```typescript
interface InstrumentProfile {
  macdStrongThreshold: number;
  rsiOverbought: number;
  rsiOversold: number;
  rsiExtremeOverbought: number;
  rsiExtremeOversold: number;
}

const INSTRUMENT_PROFILES: Record<string, InstrumentProfile> = {
  QQQ:  { macdStrongThreshold: 0.5,  rsiOverbought: 70, rsiOversold: 30, rsiExtremeOverbought: 80, rsiExtremeOversold: 20 },
  TQQQ: { macdStrongThreshold: 2.0,  rsiOverbought: 75, rsiOversold: 25, rsiExtremeOverbought: 82, rsiExtremeOversold: 18 },
  NVDL: { macdStrongThreshold: 1.2,  rsiOverbought: 72, rsiOversold: 28, rsiExtremeOverbought: 80, rsiExtremeOversold: 20 },
};
```

`MACDAnalyzer.analyze()` and `RSIAnalyzer.analyze()` gain optional `profile?:
InstrumentProfile`. Existing callers with no profile continue to use the defaults
(backward-compatible).

---

### Improvement 2 — Real Crossover Detection Utility

**Problem:** Even with Mission A's `previousData` threading, the cross logic is
duplicated across analyzers and only covers MACD/MA.

**Design:** New file `src/app/utils/crossoverDetector.ts` with pure functions:

```typescript
detectMACDCross(prev: { dif: number; dea: number }, current: { dif: number; dea: number })
  → 'golden' | 'death' | null

detectKDJCross(prev: { k: number; d: number }, current: { k: number; d: number })
  → 'golden' | 'death' | null
```

`MACDAnalyzer` and `KDJAnalyzer` consume these functions when `previousData` is
available:

- Fresh cross detected → confidence upgrades to `strong`, reason `'just_crossed'` appended
- Aligned but no fresh cross → confidence stays `moderate`
- This distinction matters: a cross on day 1 vs. day 10 into a trend carries different weight

---

### Improvement 3 — Bollinger Band Strategy

**Problem:** Bollinger data exists in `StockAnalysisDTO` but is never used in any
strategy decision.

**Design:** New `BollingerAnalyzer` class added to `strategyEngine.ts`:

Metrics calculated:
- **%B**: `(price - lower) / (upper - lower)` — 0 = at lower band, 1 = at upper band
- **Band width**: `(upper - lower) / middle` — squeeze when < 0.1

Signal rules:
| Condition | Signal | Reason |
|---|---|---|
| %B < 0.05 | `bullish` | Price hugging lower band — mean reversion entry |
| %B > 0.95 | `bearish` | Price at upper band — overextension |
| width < 0.1 | `neutral` | Squeeze — volatility expansion imminent, direction TBD |
| %B 0.45–0.55 | `neutral` | Price near midline |

New rule added to `STRATEGY_RULES` in `strategyRuleEngine.ts`:
`'bollinger_squeeze_breakout'` — triggers when squeeze is active AND MACD confirms
direction. Risk: `high`, expectedReturn: 0.20.

---

### Improvement 4 — RSI Divergence Detection

**Problem:** Classic RSI divergence (price high but RSI lower high = momentum weakening)
is a high-value signal that is entirely absent from the engine.

**Design:** New file `src/app/utils/divergenceDetector.ts`:

```typescript
interface DivergenceResult {
  type: 'bullish' | 'bearish' | null;
  strength: number;   // 0-100
  barsAgo: number;    // how recent the divergence is
}

detectRSIDivergence(priceHistory: number[], rsiHistory: number[]): DivergenceResult
```

Algorithm:
1. Find the two most recent local peaks (bearish) or troughs (bullish) using a 3-point
   local extremum check: `point[i] > point[i-1] && point[i] > point[i+1]`
2. **Bearish divergence:** price makes higher high, RSI makes lower high
3. **Bullish divergence:** price makes lower low, RSI makes higher low
4. `strength` = magnitude of divergence normalized 0–100
5. `barsAgo` = distance since the second extremum (recency weighting)

Wired into:
- `StrategyEngine.analyzeIndicators()` — adds a `'Divergence'` `IndicatorJudgment`
  when divergence is detected
- `EnhancedRiskMonitor.generateTechnicalAlerts()` — adds a divergence alert when
  `type !== null && barsAgo <= 5`

---

### Mission B File Changes

| File | Type |
|---|---|
| `constants/instrumentProfiles.ts` | New |
| `crossoverDetector.ts` | New |
| `divergenceDetector.ts` | New |
| `strategyEngine.ts` | Modify — add `BollingerAnalyzer`, update `MACDAnalyzer`/`KDJAnalyzer` |
| `strategyRuleEngine.ts` | Modify — add bollinger squeeze rule |
| `enhancedRiskAlert.ts` | Modify — add divergence alert |
| `crossoverDetector.test.ts` | New |
| `divergenceDetector.test.ts` | New |

**No changes to:** `strategyIntegrator.ts`, `intelligentAdviceEngine.ts`,
`enhancedStrategyScoring.ts`, `strategySystemController.ts`.

---

## Success Criteria

### Mission A
- All 4 fixes have passing unit tests
- MA analysis fires in live engine when price is available
- No silent `false` returns from dead conditions
- Mean reversion direction check is type-safe

### Mission B
- Instrument profiles applied for QQQ/TQQQ/NVDL
- Crossover detected only on the crossing bar, not on continuation
- Bollinger %B and squeeze visible in indicator judgments
- RSI divergence fires alert in `EnhancedRiskMonitor`
- All new files have unit tests
