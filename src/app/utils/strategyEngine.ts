/**
 * 策略引擎核心架構
 * Phase 3: Strategy Engine Architecture
 */

import type { StockAnalysisDTO } from './dto';

// ==================== 基礎類型定義 ====================

export type IndicatorSignal = 'bullish' | 'bearish' | 'neutral' | 'extreme';
export type StrategyType = 'momentum' | 'mean_reversion' | 'breakout';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'weak' | 'moderate' | 'strong';

// 單指標判斷結果
export interface IndicatorJudgment {
  indicator: string;
  signal: IndicatorSignal;
  strength: number; // 0-100
  confidence: ConfidenceLevel;
  message: string;
  reasons: string[];
}

// 策略信號
export interface StrategySignal {
  type: StrategyType;
  action: 'buy' | 'sell' | 'hold' | 'reduce';
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
  supportingIndicators: string[];
  conflictingIndicators: string[];
  recommendation: string;
}

// 綜合評估結果
export interface StrategyAnalysis {
  symbol: string;
  timestamp: Date;
  overallSignal: IndicatorSignal;
  overallStrength: number;
  indicatorJudgments: IndicatorJudgment[];
  strategySignals: StrategySignal[];
  finalRecommendation: {
    primaryAction: 'buy' | 'sell' | 'hold';
    secondaryActions: string[];
    riskWarnings: string[];
    timeframe: string;
  };
}

// ==================== 指標判斷規則 ====================

/**
 * RSI 判斷規則
 */
export class RSIAnalyzer {
  static analyze(rsi: number): IndicatorJudgment {
    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    if (rsi >= 80) {
      signal = 'extreme';
      strength = Math.min(95, 60 + (rsi - 80) * 2);
      confidence = 'strong';
      message = 'strategy_rsi_extreme_overbought';
      reasons = ['strategy_rsi_above_80', 'strategy_short_term_pullback_risk'];
    } else if (rsi >= 70) {
      signal = 'bearish';
      strength = 60 + (rsi - 70);
      confidence = rsi >= 75 ? 'strong' : 'moderate';
      message = 'strategy_rsi_overbought_zone';
      reasons = [
        'strategy_rsi_entered_overbought',
        'strategy_consider_reducing_position',
      ];
    } else if (rsi <= 20) {
      signal = 'extreme';
      strength = Math.min(95, 60 + (20 - rsi) * 2);
      confidence = 'strong';
      message = 'strategy_rsi_extreme_oversold';
      reasons = ['strategy_rsi_below_20', 'strategy_rebound_opportunity'];
    } else if (rsi <= 30) {
      signal = 'bullish';
      strength = 60 + (30 - rsi);
      confidence = rsi <= 25 ? 'strong' : 'moderate';
      message = 'strategy_rsi_oversold_zone';
      reasons = [
        'strategy_rsi_entered_oversold',
        'strategy_consider_gradual_buy',
      ];
    } else {
      signal = 'neutral';
      strength = 50 - Math.abs(rsi - 50) / 2;
      confidence = 'weak';
      message = 'strategy_rsi_neutral_zone';
      reasons = ['strategy_rsi_in_neutral', 'strategy_wait_clear_signal'];
    }

    return {
      indicator: 'RSI',
      signal,
      strength,
      confidence,
      message,
      reasons,
    };
  }
}

/**
 * MACD 判斷規則
 */
export class MACDAnalyzer {
  static analyze(macd: {
    dif: number;
    dea: number;
    histogram: number;
  }): IndicatorJudgment {
    const { dif, dea, histogram } = macd;
    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    // 判斷趨勢強度
    const trendStrength = Math.abs(histogram) * 10;
    const isGoldenCross = dif > dea && histogram > 0;
    const isDeathCross = dif < dea && histogram < 0;
    const isStrong = Math.abs(histogram) > 0.5;

    if (isGoldenCross) {
      signal = 'bullish';
      strength = isStrong ? Math.min(90, 70 + trendStrength) : 60;
      confidence = isStrong ? 'strong' : 'moderate';
      message = 'strategy_macd_golden_cross';
      reasons = [
        'strategy_dif_crosses_above_dea',
        'strategy_histogram_positive',
        isStrong
          ? 'strategy_signal_strength_high'
          : 'strategy_signal_strength_medium',
      ];
    } else if (isDeathCross) {
      signal = 'bearish';
      strength = isStrong ? Math.min(90, 70 + trendStrength) : 60;
      confidence = isStrong ? 'strong' : 'moderate';
      message = 'strategy_macd_death_cross';
      reasons = [
        'strategy_dif_crosses_below_dea',
        'strategy_histogram_negative',
        isStrong
          ? 'strategy_signal_strength_high'
          : 'strategy_signal_strength_medium',
      ];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = 'strategy_macd_no_clear_direction';
      reasons = ['strategy_wait_golden_death_cross'];
    }

    return {
      indicator: 'MACD',
      signal,
      strength,
      confidence,
      message,
      reasons,
    };
  }
}

/**
 * 移動平均線判斷規則
 */
export class MAAnalyzer {
  static analyze(price: number, ma20: number, ma5?: number): IndicatorJudgment {
    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    const priceToMA20Ratio = (price - ma20) / ma20;
    const deviation = Math.abs(priceToMA20Ratio);

    if (priceToMA20Ratio > 0.03) {
      signal = 'bullish';
      strength = Math.min(85, 60 + deviation * 500);
      confidence = deviation > 0.05 ? 'strong' : 'moderate';
      message = 'strategy_ma_price_above_ma20';
      reasons = [
        `strategy_price_above_ma20_by_${(priceToMA20Ratio * 100).toFixed(1)}_percent`,
        'strategy_short_term_bullish',
      ];
    } else if (priceToMA20Ratio < -0.03) {
      signal = 'bearish';
      strength = Math.min(85, 60 + deviation * 500);
      confidence = deviation > 0.05 ? 'strong' : 'moderate';
      message = 'strategy_ma_price_below_ma20';
      reasons = [
        `strategy_price_below_ma20_by_${(Math.abs(priceToMA20Ratio) * 100).toFixed(1)}_percent`,
        'strategy_short_term_bearish',
      ];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = 'strategy_ma_price_near_ma20';
      reasons = [
        'strategy_price_fluctuating_near_ma20',
        'strategy_wait_trend_clear',
      ];
    }

    // 如果有MA5，加入短期趨勢判斷
    if (ma5) {
      const ma5ToMA20 = (ma5 - ma20) / ma20;
      if (ma5ToMA20 > 0.01 && signal === 'bullish') {
        reasons.push('strategy_ma5_above_ma20_confirm');
        strength = Math.min(95, strength + 10);
      } else if (ma5ToMA20 < -0.01 && signal === 'bearish') {
        reasons.push('strategy_ma5_below_ma20_confirm');
        strength = Math.min(95, strength + 10);
      }
    }

    return {
      indicator: 'MA',
      signal,
      strength,
      confidence,
      message,
      reasons,
    };
  }
}

/**
 * KDJ 判斷規則
 */
export class KDJAnalyzer {
  static analyze(kdj: { k: number; d: number; j: number }): IndicatorJudgment {
    const { k, d, j } = kdj;
    let signal: IndicatorSignal;
    let strength: number;
    let confidence: ConfidenceLevel;
    let message: string;
    let reasons: string[] = [];

    const avgKDJ = (k + d + j) / 3;
    const isGoldenCross = k > d && j > k;
    const isDeathCross = k < d && j < k;

    if (avgKDJ >= 80) {
      signal = 'bearish';
      strength = 60 + (avgKDJ - 80);
      confidence = avgKDJ >= 90 ? 'strong' : 'moderate';
      message = 'strategy_kdj_overbought';
      reasons = [
        'strategy_kdj_values_too_high',
        'strategy_short_term_adjustment_risk',
      ];
    } else if (avgKDJ <= 20) {
      signal = 'bullish';
      strength = 60 + (20 - avgKDJ);
      confidence = avgKDJ <= 10 ? 'strong' : 'moderate';
      message = 'strategy_kdj_oversold';
      reasons = [
        'strategy_kdj_values_too_low',
        'strategy_rebound_opportunity_increased',
      ];
    } else if (isGoldenCross && avgKDJ < 80) {
      signal = 'bullish';
      strength = 70;
      confidence = 'moderate';
      message = 'strategy_kdj_golden_cross';
      reasons = ['strategy_k_crosses_above_d', 'strategy_j_confirms_upward'];
    } else if (isDeathCross && avgKDJ > 20) {
      signal = 'bearish';
      strength = 70;
      confidence = 'moderate';
      message = 'strategy_kdj_death_cross';
      reasons = ['strategy_k_crosses_below_d', 'strategy_j_confirms_downward'];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = 'strategy_kdj_no_clear_signal';
      reasons = ['strategy_wait_cross_or_extreme'];
    }

    return {
      indicator: 'KDJ',
      signal,
      strength,
      confidence,
      message,
      reasons,
    };
  }
}

// ==================== 策略引擎核心 ====================

// Helper function to map action to signal
function actionToSignal(
  action: 'buy' | 'sell' | 'hold' | 'reduce'
): 'bullish' | 'bearish' | 'neutral' {
  switch (action) {
    case 'buy':
      return 'bullish';
    case 'sell':
      return 'bearish';
    case 'hold':
    case 'reduce':
    default:
      return 'neutral';
  }
}

export class StrategyEngine {
  /**
   * 綜合分析所有技術指標
   */
  static analyzeIndicators(data: StockAnalysisDTO): IndicatorJudgment[] {
    const judgments: IndicatorJudgment[] = [];

    // RSI 分析
    if (data.rsi && data.rsi[14]) {
      judgments.push(RSIAnalyzer.analyze(data.rsi[14]));
    }

    // MACD 分析
    if (data.macd) {
      judgments.push(MACDAnalyzer.analyze(data.macd));
    }

    // MA 分析 (假設我們有當前價格)
    if (data.ma && data.ma[20] && data.ema && data.ema[5]) {
      // 這裡需要當前價格，可能需要從其他地方獲取
      // judgments.push(MAAnalyzer.analyze(currentPrice, data.ma[20], data.ema[5]));
    }

    // KDJ 分析
    if (data.kdj) {
      judgments.push(KDJAnalyzer.analyze(data.kdj));
    }

    return judgments;
  }

  /**
   * 生成策略信號
   */
  static generateStrategySignals(
    judgments: IndicatorJudgment[]
  ): StrategySignal[] {
    const signals: StrategySignal[] = [];

    // 動量策略
    signals.push(this.generateMomentumStrategy(judgments));

    // 均值回歸策略
    signals.push(this.generateMeanReversionStrategy(judgments));

    // 突破策略
    signals.push(this.generateBreakoutStrategy(judgments));

    return signals;
  }

  /**
   * 動量策略
   */
  private static generateMomentumStrategy(
    judgments: IndicatorJudgment[]
  ): StrategySignal {
    const bullishIndicators = judgments.filter(
      (j) => j.signal === 'bullish' || j.signal === 'extreme'
    );
    const bearishIndicators = judgments.filter((j) => j.signal === 'bearish');

    const bullishStrength =
      bullishIndicators.reduce((sum, j) => sum + j.strength, 0) /
        bullishIndicators.length || 0;
    const bearishStrength =
      bearishIndicators.reduce((sum, j) => sum + j.strength, 0) /
        bearishIndicators.length || 0;

    let action: 'buy' | 'sell' | 'hold' | 'reduce';
    let strength: number;
    let confidence: ConfidenceLevel;
    let recommendation: string;

    if (bullishIndicators.length >= 2 && bullishStrength > 65) {
      action = 'buy';
      strength = bullishStrength;
      confidence = bullishStrength > 80 ? 'strong' : 'moderate';
      recommendation = 'strategy_momentum_multiple_bullish';
    } else if (bearishIndicators.length >= 2 && bearishStrength > 65) {
      action = 'sell';
      strength = bearishStrength;
      confidence = bearishStrength > 80 ? 'strong' : 'moderate';
      recommendation = 'strategy_momentum_multiple_bearish';
    } else {
      action = 'hold';
      strength = 50;
      confidence = 'weak';
      recommendation = 'strategy_momentum_inconsistent_signals';
    }

    return {
      type: 'momentum',
      action,
      signal: actionToSignal(action),
      strength,
      confidence,
      riskLevel: strength > 80 ? 'high' : strength > 60 ? 'medium' : 'low',
      supportingIndicators: bullishIndicators.map((j) => j.indicator),
      conflictingIndicators: bearishIndicators.map((j) => j.indicator),
      recommendation,
    };
  }

  /**
   * 均值回歸策略
   */
  private static generateMeanReversionStrategy(
    judgments: IndicatorJudgment[]
  ): StrategySignal {
    const extremeIndicators = judgments.filter((j) => j.signal === 'extreme');
    const rsiJudgment = judgments.find((j) => j.indicator === 'RSI');

    let action: 'buy' | 'sell' | 'hold' | 'reduce' = 'hold';
    let strength = 50;
    let confidence: ConfidenceLevel = 'weak';
    let recommendation = 'strategy_mean_reversion_wait_extreme';

    if (extremeIndicators.length > 0) {
      const avgStrength =
        extremeIndicators.reduce((sum, j) => sum + j.strength, 0) /
        extremeIndicators.length;

      if (rsiJudgment && rsiJudgment.signal === 'extreme') {
        // RSI極值反轉
        if (rsiJudgment.strength > 85) {
          action = rsiJudgment.reasons.some(
            (r) => r.includes('oversold') || r.includes('超賣')
          )
            ? 'buy'
            : 'sell';
          strength = avgStrength;
          confidence = 'strong';
          recommendation =
            action === 'buy'
              ? 'strategy_rsi_extreme_oversold_reversal'
              : 'strategy_rsi_extreme_overbought_reversal';
        }
      }
    }

    return {
      type: 'mean_reversion',
      action,
      signal: actionToSignal(action),
      strength,
      confidence,
      riskLevel: 'medium',
      supportingIndicators: extremeIndicators.map((j) => j.indicator),
      conflictingIndicators: [],
      recommendation,
    };
  }

  /**
   * 突破策略
   */
  private static generateBreakoutStrategy(
    judgments: IndicatorJudgment[]
  ): StrategySignal {
    const macdJudgment = judgments.find((j) => j.indicator === 'MACD');
    const strongSignals = judgments.filter((j) => j.confidence === 'strong');

    let action: 'buy' | 'sell' | 'hold' | 'reduce' = 'hold';
    let strength = 50;
    let confidence: ConfidenceLevel = 'weak';
    let recommendation = 'strategy_breakout_wait_confirmation';

    if (macdJudgment && strongSignals.length >= 1) {
      if (macdJudgment.signal === 'bullish' && macdJudgment.strength > 75) {
        action = 'buy';
        strength = macdJudgment.strength;
        confidence = 'strong';
        recommendation = 'strategy_macd_strong_golden_breakout';
      } else if (
        macdJudgment.signal === 'bearish' &&
        macdJudgment.strength > 75
      ) {
        action = 'sell';
        strength = macdJudgment.strength;
        confidence = 'strong';
        recommendation = 'strategy_macd_strong_death_breakout';
      }
    }

    return {
      type: 'breakout',
      action,
      signal: actionToSignal(action),
      strength,
      confidence,
      riskLevel: 'high',
      supportingIndicators: strongSignals.map((j) => j.indicator),
      conflictingIndicators: [],
      recommendation,
    };
  }

  /**
   * 綜合策略分析
   */
  static performCompleteAnalysis(
    data: StockAnalysisDTO,
    symbol: string
  ): StrategyAnalysis {
    const indicatorJudgments = this.analyzeIndicators(data);
    const strategySignals = this.generateStrategySignals(indicatorJudgments);

    // 計算整體信號
    const avgStrength =
      indicatorJudgments.reduce((sum, j) => sum + j.strength, 0) /
      indicatorJudgments.length;
    const bullishCount = indicatorJudgments.filter(
      (j) => j.signal === 'bullish' || j.signal === 'extreme'
    ).length;
    const bearishCount = indicatorJudgments.filter(
      (j) => j.signal === 'bearish'
    ).length;

    let overallSignal: IndicatorSignal;
    if (bullishCount > bearishCount && avgStrength > 60) {
      overallSignal = 'bullish';
    } else if (bearishCount > bullishCount && avgStrength > 60) {
      overallSignal = 'bearish';
    } else {
      overallSignal = 'neutral';
    }

    // 生成最終建議
    const bestStrategy = strategySignals.reduce((best, current) =>
      current.strength > best.strength ? current : best
    );

    return {
      symbol,
      timestamp: new Date(),
      overallSignal,
      overallStrength: avgStrength,
      indicatorJudgments,
      strategySignals,
      finalRecommendation: {
        primaryAction:
          bestStrategy.action === 'reduce' ? 'sell' : bestStrategy.action,
        secondaryActions: strategySignals
          .filter((s) => s !== bestStrategy && s.strength > 60)
          .map((s) => `${s.type}: ${s.recommendation}`),
        riskWarnings: strategySignals
          .filter((s) => s.riskLevel === 'high')
          .map((s) => `strategy_${s.type}_high_risk`),
        timeframe: 'strategy_short_term_timeframe',
      },
    };
  }
}

// ==================== 輔助工具函數 ====================

/**
 * 將 StrategySignal.action 映射為前端組件期望的 signal 值
 */
export const mapActionToSignal = (
  action: 'buy' | 'sell' | 'hold' | 'reduce'
): 'bullish' | 'bearish' | 'neutral' => {
  switch (action) {
    case 'buy':
      return 'bullish';
    case 'sell':
      return 'bearish';
    case 'hold':
    case 'reduce':
    default:
      return 'neutral';
  }
};
