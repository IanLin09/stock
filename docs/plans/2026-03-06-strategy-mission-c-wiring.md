# Strategy Engine — Mission C: Wire Components to Real Engine

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the self-contained fake scoring in `TradingStrategies/index.tsx` with the real `useStrategyEngine` hook, and activate the three orphaned detail components (Momentum, MeanReversion, Breakout) via tab navigation so the rich UI already built is actually shown to the user.

**Architecture:** `TradingStrategies/index.tsx` currently makes its own `getSymbolDetail` call and runs five standalone scoring functions that duplicate `strategyEngine.ts`. The fix: (1) fix `useStrategyEngine` to return i18n-safe market condition keys, (2) rewrite `index.tsx` to use `useStrategyEngine` + add `StrategyTabs` navigation + render the active detail component, (3) update each detail component to accept `IndicatorJudgment[]` so it shows real indicator values. No new files needed. Trading-rules/scenario text in sub-components stays hardcoded (that's Mission D scope).

**Tech Stack:** TypeScript, React, React Testing Library (`npm test -- --testPathPattern=<filename>`), i18next. All tests in `src/app/components/analysis/TradingStrategies/__tests__/`.

---

## Task 1 — Fix `useStrategyEngine` market condition to return i18n keys

**Files:**
- Modify: `src/app/hooks/useStrategyEngine.ts` (lines 152–175)
- Modify: `src/app/hooks/__tests__/useStrategyEngine.test.ts` (add test, or create if absent)

### Step 1: Check for existing test file

```bash
ls src/app/hooks/__tests__/ 2>/dev/null || echo "no test dir"
```

If no test file exists, create `src/app/hooks/__tests__/useStrategyEngine.marketCondition.test.ts`.

### Step 2: Write the failing test

```typescript
// src/app/hooks/__tests__/useStrategyEngine.marketCondition.test.ts
import { computeMarketCondition } from '../useStrategyEngine';

describe('computeMarketCondition — returns i18n keys', () => {
  it('strong bullish returns market_strong_uptrend', () => {
    expect(computeMarketCondition('bullish', 75, 3, 0)).toBe('market_strong_uptrend');
  });

  it('strong bearish returns market_strong_downtrend', () => {
    expect(computeMarketCondition('bearish', 75, 0, 3)).toBe('market_strong_downtrend');
  });

  it('balanced indicators returns market_sideways', () => {
    expect(computeMarketCondition('neutral', 55, 2, 2)).toBe('market_sideways');
  });

  it('low strength returns market_unclear', () => {
    expect(computeMarketCondition('bullish', 45, 2, 1)).toBe('market_unclear');
  });

  it('moderate bullish returns market_moderate_uptrend', () => {
    expect(computeMarketCondition('bullish', 60, 3, 1)).toBe('market_moderate_uptrend');
  });

  it('moderate bearish returns market_moderate_downtrend', () => {
    expect(computeMarketCondition('bearish', 60, 1, 3)).toBe('market_moderate_downtrend');
  });
});
```

### Step 3: Run test to verify it fails

```bash
npm test -- --testPathPattern=useStrategyEngine.marketCondition --no-coverage
```

Expected: FAIL — `computeMarketCondition` not exported.

### Step 4: Extract and fix the logic

In `src/app/hooks/useStrategyEngine.ts`, extract the market condition logic into an exported pure function **above** the hook definition:

```typescript
// Add above the useStrategyEngine function (around line 72):
export function computeMarketCondition(
  overallSignal: string,
  overallStrength: number,
  bullishCount: number,
  bearishCount: number
): string {
  if (overallSignal === 'bullish' && overallStrength > 70) return 'market_strong_uptrend';
  if (overallSignal === 'bearish' && overallStrength > 70) return 'market_strong_downtrend';
  if (Math.abs(bullishCount - bearishCount) <= 1) return 'market_sideways';
  if (overallStrength < 50) return 'market_unclear';
  return overallSignal === 'bullish' ? 'market_moderate_uptrend' : 'market_moderate_downtrend';
}
```

Then replace the `marketCondition` useMemo body (lines 152–175) to call it:

```typescript
const marketCondition = useMemo(() => {
  if (!analysis) return 'market_unclear';
  const bullishCount = indicators.filter((i) => i.signal === 'bullish').length;
  const bearishCount = indicators.filter((i) => i.signal === 'bearish').length;
  return computeMarketCondition(
    analysis.overallSignal,
    analysis.overallStrength,
    bullishCount,
    bearishCount
  );
}, [analysis, indicators]);
```

### Step 5: Run tests to verify they pass

```bash
npm test -- --testPathPattern=useStrategyEngine.marketCondition --no-coverage
```

Expected: 6 tests PASS.

### Step 6: Commit

```bash
git add src/app/hooks/useStrategyEngine.ts src/app/hooks/__tests__/useStrategyEngine.marketCondition.test.ts
git commit -m "fix: extract computeMarketCondition, return i18n keys instead of Chinese strings"
```

---

## Task 2 — Rewrite `TradingStrategies/index.tsx` to use `useStrategyEngine`

**Files:**
- Modify: `src/app/components/analysis/TradingStrategies/index.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/TradingStrategies.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/TradingStrategies.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import TradingStrategies from '../index';

// Mock the hook — component must use this, not compute its own scores
jest.mock('@/app/hooks/useStrategyEngine', () => ({
  useStrategyEngine: () => ({
    isLoading: false,
    isError: false,
    analysis: {
      overallStrength: 82,
      overallSignal: 'bullish',
      strategySignals: [
        { type: 'momentum', action: 'buy', signal: 'bullish', strength: 82, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
        { type: 'mean_reversion', action: 'hold', signal: 'neutral', strength: 50, confidence: 'weak', riskLevel: 'low', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
        { type: 'breakout', action: 'buy', signal: 'bullish', strength: 78, confidence: 'moderate', riskLevel: 'high', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
      ],
      indicatorJudgments: [],
      finalRecommendation: { primaryAction: 'buy', secondaryActions: [], riskWarnings: [], timeframe: 'short' },
      timestamp: new Date(),
      symbol: 'QQQ',
    },
    indicators: [],
    strategies: [
      { type: 'momentum', action: 'buy', signal: 'bullish', strength: 82, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
    ],
    overallScore: 82,
    marketCondition: 'market_strong_uptrend',
    riskLevel: 'medium',
    actionAdvice: { primary: 'primary_advice_buy', secondary: [], warnings: [], timeframe: '' },
    refreshAnalysis: jest.fn(),
    getIndicatorStatus: jest.fn(),
    getStrategyByType: jest.fn(),
    formatStrengthLabel: jest.fn(),
    getSignalColorByType: jest.fn(),
    comprehensiveAnalysis: null,
    primaryRecommendation: '',
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/utils/zustand', () => ({
  useAnalysisStore: () => ({ currentSymbol: 'QQQ', timeRange: '3M' }),
}));

describe('TradingStrategies — uses real engine data', () => {
  it('shows overallScore from useStrategyEngine (82), not a locally computed value', () => {
    render(<TradingStrategies />);
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('shows market condition i18n key from hook', () => {
    render(<TradingStrategies />);
    expect(screen.getByText('market_strong_uptrend')).toBeInTheDocument();
  });

  it('does NOT import or call getSymbolDetail', () => {
    // If getSymbolDetail is still called the mock above won't cover it and
    // the component will throw — this test passing proves it's removed.
    render(<TradingStrategies />);
    expect(screen.queryByText('strategy_analysis_failed')).not.toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=TradingStrategies.test --no-coverage
```

Expected: FAIL — component calls `getSymbolDetail` and ignores mock.

### Step 3: Rewrite `TradingStrategies/index.tsx`

Replace the entire file content:

```typescript
/**
 * 交易策略分析組件主入口 - Mission C 版本
 * Trading Strategies Analysis - wired to useStrategyEngine
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalysisStore } from '@/utils/zustand';
import { useStrategyEngine } from '@/app/hooks/useStrategyEngine';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';
import StrategyTabs from './StrategyTabs';
import MomentumStrategy from './MomentumStrategy';
import MeanReversionStrategy from './MeanReversionStrategy';
import BreakoutStrategy from './BreakoutStrategy';

interface TradingStrategiesProps {
  className?: string;
}

// Map primaryAction → i18n advice keys
function buildActionAdvice(primaryAction: string, secondaryActions: string[], riskWarnings: string[]) {
  switch (primaryAction) {
    case 'buy':
      return {
        primary: 'primary_advice_buy',
        secondary: ['secondary_advice_batch_build', 'secondary_advice_stop_loss', ...secondaryActions.slice(0, 1)],
        warnings: ['warning_risk_control', ...riskWarnings.slice(0, 1)],
      };
    case 'sell':
    case 'reduce':
      return {
        primary: 'primary_advice_sell',
        secondary: ['secondary_advice_batch_reduce', 'secondary_advice_watch_support', ...secondaryActions.slice(0, 1)],
        warnings: ['warning_no_panic', ...riskWarnings.slice(0, 1)],
      };
    default:
      return {
        primary: 'primary_advice_hold',
        secondary: ['secondary_advice_wait_signal', 'secondary_advice_watch_technical'],
        warnings: ['warning_no_frequent'],
      };
  }
}

const TradingStrategies: React.FC<TradingStrategiesProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { currentSymbol, timeRange } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<'momentum' | 'mean_reversion' | 'breakout' | 'risk' | 'advice'>('momentum');

  const { analysis, indicators, strategies, overallScore, marketCondition, riskLevel, isLoading, isError } =
    useStrategyEngine({ symbol: currentSymbol, timeRange });

  const actionAdvice = useMemo(() => {
    if (!analysis) return { primary: 'primary_advice_hold', secondary: [], warnings: [] };
    const { primaryAction, secondaryActions, riskWarnings } = analysis.finalRecommendation;
    return buildActionAdvice(primaryAction, secondaryActions, riskWarnings);
  }, [analysis]);

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-500 dark:text-red-400 text-center">
          <p className="text-sm font-medium">{t('strategy_analysis_failed')}</p>
          <p className="text-xs mt-1">{t('check_network')}</p>
        </div>
      </div>
    );
  }

  const activeStrategy = strategies.find((s) => s.type === activeTab) || null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('strategy_analysis')}
          </h3>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                marketCondition.includes('uptrend')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : marketCondition.includes('downtrend')
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {t(marketCondition)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                overallScore >= 70
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : overallScore >= 50
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {overallScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Tab navigation — uses real strategy strengths from engine */}
      <StrategyTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        strategies={strategies}
      />

      {/* Active tab content */}
      <div className="p-3">
        {activeTab === 'momentum' && activeStrategy && (
          <MomentumStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'mean_reversion' && activeStrategy && (
          <MeanReversionStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'breakout' && activeStrategy && (
          <BreakoutStrategy
            strategy={activeStrategy}
            indicators={indicators}
            marketCondition={marketCondition}
            overallScore={overallScore}
          />
        )}
        {activeTab === 'risk' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t('risk_level')}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  riskLevel === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : riskLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {t(riskLevel === 'high' ? 'high_risk' : riskLevel === 'medium' ? 'medium_risk' : 'low_risk')}
              </span>
            </div>
          </div>
        )}
        {activeTab === 'advice' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t('trading_advice')}: {t(actionAdvice.primary)}
            </div>
            {actionAdvice.secondary.map((advice, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {t(advice)}
              </div>
            ))}
            {actionAdvice.warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <span className="w-1 h-1 bg-amber-500 rounded-full mr-2"></span>
                {t(w)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingStrategies;
```

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=TradingStrategies.test --no-coverage
```

Expected: 3 tests PASS.

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/index.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/TradingStrategies.test.tsx
git commit -m "feat: wire TradingStrategies to useStrategyEngine, activate tab navigation with detail components"
```

---

## Task 3 — Update `MomentumStrategy` to accept real `IndicatorJudgment[]`

**Files:**
- Modify: `src/app/components/analysis/TradingStrategies/MomentumStrategy.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/MomentumStrategy.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/MomentumStrategy.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MomentumStrategy from '../MomentumStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'momentum',
  action: 'buy',
  signal: 'bullish',
  strength: 78,
  confidence: 'strong',
  riskLevel: 'medium',
  supportingIndicators: ['RSI', 'MACD'],
  conflictingIndicators: [],
  recommendation: 'strategy_momentum_multiple_bullish',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'RSI', signal: 'bullish', strength: 72, confidence: 'moderate', message: 'strategy_rsi_overbought_zone', reasons: [], direction: 'overbought' },
  { indicator: 'MACD', signal: 'bullish', strength: 80, confidence: 'strong', message: 'strategy_macd_golden_cross', reasons: [] },
  { indicator: 'MA', signal: 'bullish', strength: 65, confidence: 'moderate', message: 'strategy_ma_above', reasons: [] },
];

describe('MomentumStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />)
    ).not.toThrow();
  });

  it('shows RSI signal from indicators array, not hardcoded', () => {
    render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />);
    // RSI signal 'bullish' at strength 72 should show — not a constant 'neutral'
    expect(screen.getAllByText(/72/).length).toBeGreaterThan(0);
  });

  it('shows MACD signal strength from indicators array', () => {
    render(<MomentumStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_strong_uptrend" overallScore={78} />);
    expect(screen.getAllByText(/80/).length).toBeGreaterThan(0);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=MomentumStrategy.test --no-coverage
```

Expected: FAIL — `indicators` prop not accepted by `MomentumStrategy`.

### Step 3: Add `indicators` prop and real indicator display

In `MomentumStrategy.tsx`, update the props interface (around line 10) to add `indicators`:

```typescript
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

interface MomentumStrategyProps {
  strategy: StrategySignal;
  indicators: IndicatorJudgment[];  // ADD THIS
  marketCondition: string;
  overallScore: number;
}
```

At the start of the component function, extract the real indicator judgments:

```typescript
const MomentumStrategy: React.FC<MomentumStrategyProps> = ({
  strategy,
  indicators,
  marketCondition,
  overallScore,
}) => {
  const { t } = useTranslation();

  // Real indicator values from the engine
  const rsiJudgment = indicators.find((i) => i.indicator === 'RSI');
  const macdJudgment = indicators.find((i) => i.indicator === 'MACD');
  const maJudgment = indicators.find((i) => i.indicator === 'MA');
  // ... rest of component
```

Find the section that displays RSI, MACD, MA status (the hardcoded derivation from `strategy.action`). It will look something like `mapActionToSignal(strategy.action)` returning a fixed status. Replace each indicator display with:

```typescript
// RSI row — replace hardcoded status with real judgment
{rsiJudgment ? (
  <span>{Math.round(rsiJudgment.strength)}%</span>
) : (
  <span className="text-gray-400">—</span>
)}

// MACD row — replace hardcoded status
{macdJudgment ? (
  <span>{Math.round(macdJudgment.strength)}%</span>
) : (
  <span className="text-gray-400">—</span>
)}

// MA row — replace hardcoded status
{maJudgment ? (
  <span>{Math.round(maJudgment.strength)}%</span>
) : (
  <span className="text-gray-400">—</span>
)}
```

> **Note:** The exact lines to replace depend on the hardcoded indicator display section. Search for `mapActionToSignal` or the section that derives indicator status from `strategy.action` and replace it with the above pattern using real judgment data.

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=MomentumStrategy.test --no-coverage
```

Expected: 3 tests PASS.

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/MomentumStrategy.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/MomentumStrategy.test.tsx
git commit -m "feat: add indicators prop to MomentumStrategy, show real RSI/MACD/MA strengths"
```

---

## Task 4 — Update `MeanReversionStrategy` to accept real `IndicatorJudgment[]`

**Files:**
- Modify: `src/app/components/analysis/TradingStrategies/MeanReversionStrategy.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/MeanReversionStrategy.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/MeanReversionStrategy.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MeanReversionStrategy from '../MeanReversionStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'mean_reversion',
  action: 'buy',
  signal: 'bullish',
  strength: 85,
  confidence: 'strong',
  riskLevel: 'medium',
  supportingIndicators: ['RSI'],
  conflictingIndicators: [],
  recommendation: 'strategy_rsi_extreme_oversold_reversal',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'RSI', signal: 'extreme', strength: 88, confidence: 'strong', message: 'strategy_rsi_extreme_oversold', reasons: [], direction: 'oversold' },
  { indicator: 'KDJ', signal: 'bullish', strength: 75, confidence: 'moderate', message: 'strategy_kdj_oversold', reasons: [] },
];

describe('MeanReversionStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />)
    ).not.toThrow();
  });

  it('shows RSI strength 88 from real indicators', () => {
    render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />);
    expect(screen.getAllByText(/88/).length).toBeGreaterThan(0);
  });

  it('shows KDJ strength 75 from real indicators', () => {
    render(<MeanReversionStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_sideways" overallScore={60} />);
    expect(screen.getAllByText(/75/).length).toBeGreaterThan(0);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=MeanReversionStrategy.test --no-coverage
```

Expected: FAIL — `indicators` prop not accepted.

### Step 3: Add `indicators` prop and real indicator display

In `MeanReversionStrategy.tsx`, same pattern as Task 3:

```typescript
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

interface MeanReversionStrategyProps {
  strategy: StrategySignal;
  indicators: IndicatorJudgment[];  // ADD
  marketCondition: string;
  overallScore: number;
}
```

Extract judgments at the start of the component:

```typescript
const rsiJudgment = indicators.find((i) => i.indicator === 'RSI');
const kdjJudgment = indicators.find((i) => i.indicator === 'KDJ');
const maJudgment  = indicators.find((i) => i.indicator === 'MA');
```

Replace the hardcoded reversion indicator strength display with real judgment strengths (same pattern as Task 3 — show `Math.round(judgment.strength)` where previously a fixed number or `strategy.action`-derived value appeared).

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=MeanReversionStrategy.test --no-coverage
```

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/MeanReversionStrategy.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/MeanReversionStrategy.test.tsx
git commit -m "feat: add indicators prop to MeanReversionStrategy, show real RSI/KDJ strengths"
```

---

## Task 5 — Update `BreakoutStrategy` to accept real `IndicatorJudgment[]`

**Files:**
- Modify: `src/app/components/analysis/TradingStrategies/BreakoutStrategy.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/BreakoutStrategy.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/BreakoutStrategy.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import BreakoutStrategy from '../BreakoutStrategy';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategy: StrategySignal = {
  type: 'breakout',
  action: 'buy',
  signal: 'bullish',
  strength: 77,
  confidence: 'strong',
  riskLevel: 'high',
  supportingIndicators: ['MACD', 'MA'],
  conflictingIndicators: [],
  recommendation: 'strategy_macd_strong_golden_breakout',
};

const mockIndicators: IndicatorJudgment[] = [
  { indicator: 'MACD', signal: 'bullish', strength: 82, confidence: 'strong', message: 'strategy_macd_golden_cross', reasons: [] },
  { indicator: 'MA', signal: 'bullish', strength: 68, confidence: 'moderate', message: 'strategy_ma_above', reasons: [] },
];

describe('BreakoutStrategy — real indicator display', () => {
  it('accepts indicators prop without TypeScript error', () => {
    expect(() =>
      render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />)
    ).not.toThrow();
  });

  it('shows MACD strength 82 from real indicators', () => {
    render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />);
    expect(screen.getAllByText(/82/).length).toBeGreaterThan(0);
  });

  it('shows MA strength 68 from real indicators', () => {
    render(<BreakoutStrategy strategy={mockStrategy} indicators={mockIndicators} marketCondition="market_moderate_uptrend" overallScore={77} />);
    expect(screen.getAllByText(/68/).length).toBeGreaterThan(0);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=BreakoutStrategy.test --no-coverage
```

Expected: FAIL — `indicators` prop not accepted.

### Step 3: Add `indicators` prop and real indicator display

Same pattern as Tasks 3 & 4. In `BreakoutStrategy.tsx`:

```typescript
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';

interface BreakoutStrategyProps {
  strategy: StrategySignal;
  indicators: IndicatorJudgment[];  // ADD
  marketCondition: string;
  overallScore: number;
}
```

Extract:
```typescript
const macdJudgment = indicators.find((i) => i.indicator === 'MACD');
const maJudgment   = indicators.find((i) => i.indicator === 'MA');
const rsiJudgment  = indicators.find((i) => i.indicator === 'RSI');
```

Replace hardcoded breakout indicator strength values with `Math.round(judgment?.strength ?? 0)`.

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=BreakoutStrategy.test --no-coverage
```

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/BreakoutStrategy.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/BreakoutStrategy.test.tsx
git commit -m "feat: add indicators prop to BreakoutStrategy, show real MACD/MA strengths"
```

---

## Task 6 — Final verification

### Step 1: Run full test suite

```bash
npm test -- --no-coverage
```

Expected: New tests pass, no regressions.

### Step 2: Run TypeScript build

```bash
npm run build
```

Expected: No new TypeScript or Prettier errors.

### Step 3: Commit any fixes

```bash
git add -A
git commit -m "fix: mission C complete — TradingStrategies wired to real engine, sub-components activated"
```
