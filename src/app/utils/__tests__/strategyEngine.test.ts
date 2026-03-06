import { RSIAnalyzer, StrategyEngine } from '../strategyEngine';
import { RuleEngine, STRATEGY_RULES } from '../strategyRuleEngine';
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
    const meanReversion = signals.find((s) => s.type === 'mean_reversion');
    expect(meanReversion?.action).toBe('buy');
  });

  it('returns sell action for extreme overbought RSI (>=80)', () => {
    const data = makeData(88);
    const judgments = StrategyEngine.analyzeIndicators(data);
    const signals = StrategyEngine.generateStrategySignals(judgments);
    const meanReversion = signals.find((s) => s.type === 'mean_reversion');
    expect(meanReversion?.action).toBe('sell');
  });
});

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
    const data = makeDataWithPrice(110, 100);
    const judgments = StrategyEngine.analyzeIndicators(data, 110);
    const maJudgment = judgments.find((j) => j.indicator === 'MA');
    expect(maJudgment).toBeDefined();
    expect(maJudgment?.signal).toBe('bullish');
  });

  it('excludes MA judgment when currentPrice is not provided', () => {
    const data = makeDataWithPrice(110, 100);
    const judgments = StrategyEngine.analyzeIndicators(data);
    const maJudgment = judgments.find((j) => j.indicator === 'MA');
    expect(maJudgment).toBeUndefined();
  });

  it('returns bearish MA when price is 5% below MA20', () => {
    const data = makeDataWithPrice(95, 100);
    const judgments = StrategyEngine.analyzeIndicators(data, 95);
    const maJudgment = judgments.find((j) => j.indicator === 'MA');
    expect(maJudgment?.signal).toBe('bearish');
  });
});

describe('RuleEngine — no dead volume conditions', () => {
  it('STRATEGY_RULES contains no volume conditions', () => {
    const volumeConditions = STRATEGY_RULES.flatMap((r) => r.conditions).filter(
      (c) => c.indicator === 'volume'
    );
    expect(volumeConditions).toHaveLength(0);
  });

  it('evaluateCondition does not accept volume indicator type', () => {
    const ruleIds = STRATEGY_RULES.map((r) => r.id);
    expect(ruleIds).toContain('breakout_macd_surge');
    expect(ruleIds).not.toContain('breakout_volume_surge');
  });
});
