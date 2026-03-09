import { computeMarketCondition } from '../useStrategyEngine';

describe('computeMarketCondition — returns i18n keys', () => {
  it('strong bullish returns market_strong_uptrend', () => {
    expect(computeMarketCondition('bullish', 75, 3, 0)).toBe(
      'market_strong_uptrend'
    );
  });

  it('strong bearish returns market_strong_downtrend', () => {
    expect(computeMarketCondition('bearish', 75, 0, 3)).toBe(
      'market_strong_downtrend'
    );
  });

  it('balanced indicators returns market_sideways', () => {
    expect(computeMarketCondition('neutral', 55, 2, 2)).toBe('market_sideways');
  });

  it('low strength returns market_unclear', () => {
    expect(computeMarketCondition('bullish', 45, 2, 1)).toBe('market_unclear');
  });

  it('moderate bullish returns market_moderate_uptrend', () => {
    expect(computeMarketCondition('bullish', 60, 3, 1)).toBe(
      'market_moderate_uptrend'
    );
  });

  it('moderate bearish returns market_moderate_downtrend', () => {
    expect(computeMarketCondition('bearish', 60, 1, 3)).toBe(
      'market_moderate_downtrend'
    );
  });
});
