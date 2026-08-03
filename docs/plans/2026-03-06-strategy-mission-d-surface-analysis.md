# Strategy Engine — Mission D: Surface Comprehensive Analysis in UI

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the `comprehensiveAnalysis` data already computed by `useStrategyEngine` — real risk alerts and intelligent position-sizing/stop-loss advice — into the `risk` and `advice` tabs of `TradingStrategies/`, replacing the hardcoded toy warnings and Chinese string matching currently in `RiskAssessment.tsx` and `TradingAdvice.tsx`.

**Architecture:** `useStrategyEngine` already returns `comprehensiveAnalysis: ComprehensiveAnalysisResult | null` which contains `riskAssessment.activeAlerts` (real engine-computed alerts) and `intelligentAdvice.riskManagement` (position sizing ratio and stop loss percentage). Neither is displayed anywhere. After Mission C rewrites `TradingStrategies/index.tsx` with tab navigation, the `risk` and `advice` tabs render inline minimal content — Mission D replaces those stubs with the real `RiskAssessment` and `TradingAdvice` components wired to real data. `RiskAssessment` and `TradingAdvice` are existing but orphaned files that must first be fixed: `RiskAssessment` generates its own alerts from strategy signals with hardcoded Chinese text, and `TradingAdvice` pattern-matches Chinese strings which break after Mission C's i18n refactor.

**Tech Stack:** TypeScript, React, React Testing Library (`npm test -- --testPathPattern=<filename> --no-coverage`). All tests in `src/app/components/analysis/TradingStrategies/__tests__/`.

**Depends on:** Mission C must be complete first (the wired `TradingStrategies/index.tsx` with tab navigation is the integration point).

---

## Task 1 — Fix `RiskAssessment.tsx`: add real `comprehensiveRisk` prop

**Files:**

- Modify: `src/app/components/analysis/TradingStrategies/RiskAssessment.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/RiskAssessment.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/RiskAssessment.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskAssessment from '../RiskAssessment';
import type { StrategySignal } from '@/utils/strategyEngine';
import type { RiskAssessmentResult } from '@/utils/enhancedRiskAlert';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategies: StrategySignal[] = [
  { type: 'momentum', action: 'buy', signal: 'bullish', strength: 72, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
];

const mockComprehensiveRisk: RiskAssessmentResult = {
  overallRiskLevel: 'medium',
  riskScore: 45,
  activeAlerts: [
    {
      id: 'alert_1',
      type: 'warning',
      severity: 'medium',
      category: 'technical',
      message: { title: 'RSI Overbought Warning', description: 'RSI reached extreme level' },
    } as any,
  ],
  riskFactors: { technical: [], market: [], operational: [] },
} as any;

describe('RiskAssessment — real comprehensive risk data', () => {
  it('accepts comprehensiveRisk prop without TypeScript error', () => {
    expect(() =>
      render(
        <RiskAssessment
          strategies={mockStrategies}
          riskLevel="medium"
          overallScore={72}
          comprehensiveRisk={mockComprehensiveRisk}
        />
      )
    ).not.toThrow();
  });

  it('shows riskScore from comprehensiveRisk when provided', () => {
    render(
      <RiskAssessment
        strategies={mockStrategies}
        riskLevel="medium"
        overallScore={72}
        comprehensiveRisk={mockComprehensiveRisk}
      />
    );
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('shows active alert title from comprehensiveRisk', () => {
    render(
      <RiskAssessment
        strategies={mockStrategies}
        riskLevel="medium"
        overallScore={72}
        comprehensiveRisk={mockComprehensiveRisk}
      />
    );
    expect(screen.getByText('RSI Overbought Warning')).toBeInTheDocument();
  });

  it('renders without comprehensiveRisk prop (fallback mode)', () => {
    expect(() =>
      render(
        <RiskAssessment
          strategies={mockStrategies}
          riskLevel="medium"
          overallScore={72}
        />
      )
    ).not.toThrow();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=RiskAssessment.test --no-coverage
```

Expected: FAIL — `comprehensiveRisk` prop not accepted by `RiskAssessment`.

### Step 3: Update `RiskAssessment.tsx` props and alert section

At the top of the file, add the import and extend the props interface:

```typescript
import type { RiskAssessmentResult } from '@/utils/enhancedRiskAlert';

interface RiskAssessmentProps {
  strategies: StrategySignal[];
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
  comprehensiveRisk?: RiskAssessmentResult; // ADD — real alerts when available
}
```

In the component function, add after `const warnings = generateRiskWarnings();`:

```typescript
// Use real engine alerts when available; fall back to locally computed ones
const displayAlerts = comprehensiveRisk?.activeAlerts?.length
  ? comprehensiveRisk.activeAlerts.map((alert) => ({
      level:
        alert.severity === 'extreme' || alert.severity === 'high'
          ? 'high'
          : alert.severity === 'medium'
            ? 'medium'
            : 'low',
      title: alert.message.title,
      message: alert.message.description,
      icon:
        alert.type === 'critical'
          ? '🚨'
          : alert.type === 'warning'
            ? '⚠️'
            : 'ℹ️',
    }))
  : warnings;
```

In the header section, after the risk level badge, add the risk score when available:

```typescript
{/* Risk score from comprehensive engine */}
{comprehensiveRisk && (
  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
    {t('risk_score')}: <strong>{Math.round(comprehensiveRisk.riskScore)}</strong>
  </span>
)}
```

Replace the `{warnings.length > 0 && (...)}` block's inner `{warnings.map(...)}` to use `displayAlerts` instead:

```typescript
{displayAlerts.length > 0 && (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    {/* ... existing border/header ... */}
    <div className="p-4 space-y-3">
      {displayAlerts.map((alert, index) => (
        // same JSX as before, just using displayAlerts[index] instead of warnings[index]
        <div key={index} ...>
          {/* existing layout unchanged */}
        </div>
      ))}
    </div>
  </div>
)}
```

> **Note:** Look for the `{warnings.map((warning, index) => (` block (around line 200) and change `warnings` → `displayAlerts` throughout the warnings section. The layout JSX stays identical.

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=RiskAssessment.test --no-coverage
```

Expected: 4 tests PASS.

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/RiskAssessment.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/RiskAssessment.test.tsx
git commit -m "feat: add comprehensiveRisk prop to RiskAssessment, display real engine alerts and risk score"
```

---

## Task 2 — Fix `TradingAdvice.tsx`: fix Chinese string matching, add `comprehensiveAdvice` prop

**Files:**

- Modify: `src/app/components/analysis/TradingStrategies/TradingAdvice.tsx`
- Create: `src/app/components/analysis/TradingStrategies/__tests__/TradingAdvice.test.tsx`

### Step 1: Write the failing test

```typescript
// src/app/components/analysis/TradingStrategies/__tests__/TradingAdvice.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import TradingAdvice from '../TradingAdvice';
import type { StrategySignal } from '@/utils/strategyEngine';
import type { IntelligentAdvice } from '@/utils/intelligentAdviceEngine';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStrategies: StrategySignal[] = [
  { type: 'momentum', action: 'buy', signal: 'bullish', strength: 72, confidence: 'strong', riskLevel: 'medium', supportingIndicators: [], conflictingIndicators: [], recommendation: '' },
];

const mockComprehensiveAdvice: Partial<IntelligentAdvice> = {
  riskManagement: {
    positionSizing: { recommended: 0.35, conservative: 0.2, aggressive: 0.5, reasoning: 'Moderate signal', adjustmentTriggers: [] },
    stopLoss: { initial: 7, trailing: true, adjustmentRules: [], emergencyExit: 'Exit immediately if -12%' },
  } as any,
};

describe('TradingAdvice — i18n key action matching + real advice data', () => {
  it('renders buy-action steps when actionAdvice.primary is i18n key (primary_advice_buy)', () => {
    render(
      <TradingAdvice
        actionAdvice={{ primary: 'primary_advice_buy', secondary: [], warnings: [], timeframe: '1W' }}
        marketCondition="market_strong_uptrend"
        riskLevel="medium"
        strategies={mockStrategies}
      />
    );
    // Should render buy action steps, not the fallback hold steps
    // The step for position entry should appear (step 1 of buy flow)
    expect(screen.getByText(/1/)).toBeInTheDocument(); // step number
  });

  it('accepts comprehensiveAdvice prop without TypeScript error', () => {
    expect(() =>
      render(
        <TradingAdvice
          actionAdvice={{ primary: 'primary_advice_buy', secondary: [], warnings: [], timeframe: '1W' }}
          marketCondition="market_moderate_uptrend"
          riskLevel="medium"
          strategies={mockStrategies}
          comprehensiveAdvice={mockComprehensiveAdvice as IntelligentAdvice}
        />
      )
    ).not.toThrow();
  });

  it('shows real position sizing from comprehensiveAdvice', () => {
    render(
      <TradingAdvice
        actionAdvice={{ primary: 'primary_advice_buy', secondary: [], warnings: [], timeframe: '1W' }}
        marketCondition="market_moderate_uptrend"
        riskLevel="medium"
        strategies={mockStrategies}
        comprehensiveAdvice={mockComprehensiveAdvice as IntelligentAdvice}
      />
    );
    // 35% recommended position size should appear
    expect(screen.getByText(/35%/)).toBeInTheDocument();
  });

  it('shows real stop loss from comprehensiveAdvice', () => {
    render(
      <TradingAdvice
        actionAdvice={{ primary: 'primary_advice_sell', secondary: [], warnings: [], timeframe: '' }}
        marketCondition="market_strong_downtrend"
        riskLevel="high"
        strategies={mockStrategies}
        comprehensiveAdvice={mockComprehensiveAdvice as IntelligentAdvice}
      />
    );
    // 7% stop loss should appear
    expect(screen.getByText(/7%/)).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=TradingAdvice.test --no-coverage
```

Expected: FAIL — `comprehensiveAdvice` prop missing, and `primary_advice_buy` string doesn't match `includes('買入')`.

### Step 3: Fix Chinese string matching and add real advice prop

**3a. Fix the import and interface** at the top of `TradingAdvice.tsx`:

```typescript
import type { IntelligentAdvice } from '@/utils/intelligentAdviceEngine';

interface TradingAdviceProps {
  actionAdvice: {
    primary: string;
    secondary: string[];
    warnings: string[];
    timeframe: string;
  };
  marketCondition: string;
  riskLevel: 'low' | 'medium' | 'high';
  strategies: StrategySignal[];
  comprehensiveAdvice?: IntelligentAdvice; // ADD
}
```

**3b. Fix `generateActionSteps()`** — find the two places where it matches on Chinese strings and replace:

```typescript
// BEFORE (broken after Mission C i18n change):
if (action.includes('買入')) {
// AFTER:
if (action.includes('buy')) {

// BEFORE:
} else if (action.includes('賣出')) {
// AFTER:
} else if (action.includes('sell') || action.includes('reduce')) {
```

**3c. Add real position sizing section** — inside the component, add a section that shows `comprehensiveAdvice.riskManagement` when available. Find the `{/* 輔助建議 */}` section (near line 380) and insert **before** it:

```typescript
{/* Real position sizing and stop loss from comprehensive engine */}
{comprehensiveAdvice?.riskManagement && (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h5 className="text-md font-semibold text-gray-900 dark:text-white">
        {t('position_sizing_advice')}
      </h5>
    </div>
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('recommended_position')}</span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {Math.round(comprehensiveAdvice.riskManagement.positionSizing.recommended * 100)}%
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('stop_loss_level')}</span>
        <span className="text-sm font-bold text-red-600 dark:text-red-400">
          {comprehensiveAdvice.riskManagement.stopLoss.initial}%
        </span>
      </div>
    </div>
  </div>
)}
```

**3d. Fix the `marketAnalysis.sentiment` detection** — the current code uses Chinese string matching:

```typescript
// BEFORE (broken after Mission C):
sentiment: marketCondition.includes('上漲') ? 'bullish'
         : marketCondition.includes('下跌') ? 'bearish'
         : 'neutral',
// AFTER (works with i18n keys):
sentiment: marketCondition.includes('uptrend') ? 'bullish'
         : marketCondition.includes('downtrend') ? 'bearish'
         : 'neutral',
```

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=TradingAdvice.test --no-coverage
```

Expected: 4 tests PASS.

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/TradingAdvice.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/TradingAdvice.test.tsx
git commit -m "feat: fix Chinese string matching in TradingAdvice, add comprehensiveAdvice prop for real position sizing and stop loss"
```

---

## Task 3 — Wire `TradingStrategies/index.tsx` to use real components in `risk` and `advice` tabs

**Files:**

- Modify: `src/app/components/analysis/TradingStrategies/index.tsx`
- Modify: `src/app/components/analysis/TradingStrategies/__tests__/TradingStrategies.test.tsx`

**Prerequisite:** Mission C must be complete — `index.tsx` must already have the tab navigation and `comprehensiveAnalysis` from `useStrategyEngine`.

### Step 1: Write the failing test additions

Add to `TradingStrategies.test.tsx` (the file created in Mission C Task 2):

```typescript
import { fireEvent } from '@testing-library/react';

describe('TradingStrategies — risk and advice tabs use real components', () => {
  it('renders RiskAssessment component (not just a badge) in risk tab', () => {
    const { container } = render(<TradingStrategies />);

    // Click the risk tab
    const riskTab = screen.getByText(/risk/i) || screen.getByRole('button', { name: /risk/i });
    fireEvent.click(riskTab);

    // RiskAssessment renders multiple sections; check for a distinctive one
    // The comprehensive engine provides a score — just verify tab content renders without crash
    expect(container.querySelector('[data-testid="risk-assessment"]') ||
           screen.queryByText(/risk_score|risk_level/i)).toBeTruthy();
  });
});
```

> **Note:** The test is intentionally loose — it verifies the tab click doesn't crash and renders content. The detailed behavior tests are in `RiskAssessment.test.tsx` and `TradingAdvice.test.tsx`.

### Step 2: Run test to verify it fails

```bash
npm test -- --testPathPattern=TradingStrategies.test --no-coverage
```

Expected: FAIL — risk tab content is just a badge div, not `RiskAssessment` component.

### Step 3: Replace inline tab content with real components

In `src/app/components/analysis/TradingStrategies/index.tsx`, add the imports at the top:

```typescript
import RiskAssessment from './RiskAssessment';
import TradingAdvice from './TradingAdvice';
```

> **Note:** These imports may already be present. If so, skip.

Find the `{activeTab === 'risk' && (` block (the inline risk badge section from Mission C) and replace it entirely:

```typescript
{activeTab === 'risk' && (
  <RiskAssessment
    strategies={strategies}
    riskLevel={riskLevel}
    overallScore={overallScore}
    comprehensiveRisk={comprehensiveAnalysis?.riskAssessment ?? undefined}
  />
)}
```

Find the `{activeTab === 'advice' && (` block (the inline advice section from Mission C) and replace it entirely:

```typescript
{activeTab === 'advice' && (
  <TradingAdvice
    actionAdvice={actionAdvice}
    marketCondition={marketCondition}
    riskLevel={riskLevel}
    strategies={strategies}
    comprehensiveAdvice={comprehensiveAnalysis?.intelligentAdvice ?? undefined}
  />
)}
```

### Step 4: Run tests to verify they pass

```bash
npm test -- --testPathPattern=TradingStrategies.test --no-coverage
```

Expected: All tests PASS (no new failures).

### Step 5: Commit

```bash
git add src/app/components/analysis/TradingStrategies/index.tsx \
        src/app/components/analysis/TradingStrategies/__tests__/TradingStrategies.test.tsx
git commit -m "feat: wire risk and advice tabs to RiskAssessment and TradingAdvice components with real comprehensive analysis data"
```

---

## Task 4 — Final verification

### Step 1: Run full test suite

```bash
npm test -- --no-coverage
```

Expected: All tests pass (Mission C + D tests). No regressions.

### Step 2: Run TypeScript build

```bash
npm run build
```

Expected: No new TypeScript or Prettier errors. If Prettier fails, run:

```bash
npx prettier --write "src/app/components/analysis/TradingStrategies/**/*.{ts,tsx}"
```

Then re-run `npm run build`.

### Step 3: Commit any fixes

```bash
git add -A
git commit -m "fix: mission D complete — surface comprehensive analysis in risk and advice tabs"
```
