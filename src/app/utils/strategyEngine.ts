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
      message = '極度超買，強烈反轉信號';
      reasons = ['RSI超過80，極度超買', '短期回調風險極高'];
    } else if (rsi >= 70) {
      signal = 'bearish';
      strength = 60 + (rsi - 70);
      confidence = rsi >= 75 ? 'strong' : 'moderate';
      message = '超買區間，注意回調風險';
      reasons = ['RSI進入超買區間', '建議考慮減倉'];
    } else if (rsi <= 20) {
      signal = 'extreme';
      strength = Math.min(95, 60 + (20 - rsi) * 2);
      confidence = 'strong';
      message = '極度超賣，強烈反彈信號';
      reasons = ['RSI低於20，極度超賣', '反彈機會較大'];
    } else if (rsi <= 30) {
      signal = 'bullish';
      strength = 60 + (30 - rsi);
      confidence = rsi <= 25 ? 'strong' : 'moderate';
      message = '超賣區間，考慮買入機會';
      reasons = ['RSI進入超賣區間', '可考慮逐步建倉'];
    } else {
      signal = 'neutral';
      strength = 50 - Math.abs(rsi - 50) / 2;
      confidence = 'weak';
      message = '中性區間，無明確信號';
      reasons = ['RSI處於中性區間', '等待明確信號'];
    }

    return {
      indicator: 'RSI',
      signal,
      strength,
      confidence,
      message,
      reasons
    };
  }
}

/**
 * MACD 判斷規則
 */
export class MACDAnalyzer {
  static analyze(macd: { dif: number; dea: number; histogram: number }): IndicatorJudgment {
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
      message = 'MACD金叉，看漲信號';
      reasons = ['DIF上穿DEA', 'Histogram為正', isStrong ? '信號強度較高' : '信號強度中等'];
    } else if (isDeathCross) {
      signal = 'bearish';
      strength = isStrong ? Math.min(90, 70 + trendStrength) : 60;
      confidence = isStrong ? 'strong' : 'moderate';
      message = 'MACD死叉，看跌信號';
      reasons = ['DIF下穿DEA', 'Histogram為負', isStrong ? '信號強度較高' : '信號強度中等'];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = 'MACD無明確方向';
      reasons = ['等待金叉或死叉信號'];
    }

    return {
      indicator: 'MACD',
      signal,
      strength,
      confidence,
      message,
      reasons
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
      message = '價格明顯高於MA20，趨勢向上';
      reasons = [`價格高於MA20約${(priceToMA20Ratio * 100).toFixed(1)}%`, '短期趨勢看漲'];
    } else if (priceToMA20Ratio < -0.03) {
      signal = 'bearish';
      strength = Math.min(85, 60 + deviation * 500);
      confidence = deviation > 0.05 ? 'strong' : 'moderate';
      message = '價格明顯低於MA20，趨勢向下';
      reasons = [`價格低於MA20約${(Math.abs(priceToMA20Ratio) * 100).toFixed(1)}%`, '短期趨勢看跌'];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = '價格接近MA20，趨勢不明';
      reasons = ['價格在MA20附近波動', '等待趨勢明確'];
    }

    // 如果有MA5，加入短期趨勢判斷
    if (ma5) {
      const ma5ToMA20 = (ma5 - ma20) / ma20;
      if (ma5ToMA20 > 0.01 && signal === 'bullish') {
        reasons.push('MA5高於MA20，短期趨勢確認');
        strength = Math.min(95, strength + 10);
      } else if (ma5ToMA20 < -0.01 && signal === 'bearish') {
        reasons.push('MA5低於MA20，短期趨勢確認');
        strength = Math.min(95, strength + 10);
      }
    }

    return {
      indicator: 'MA',
      signal,
      strength,
      confidence,
      message,
      reasons
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
      message = 'KDJ超買，注意回調';
      reasons = ['KDJ值過高', '短期調整風險'];
    } else if (avgKDJ <= 20) {
      signal = 'bullish';
      strength = 60 + (20 - avgKDJ);
      confidence = avgKDJ <= 10 ? 'strong' : 'moderate';
      message = 'KDJ超賣，反彈機會';
      reasons = ['KDJ值過低', '反彈機會增加'];
    } else if (isGoldenCross && avgKDJ < 80) {
      signal = 'bullish';
      strength = 70;
      confidence = 'moderate';
      message = 'KDJ金叉，短期看漲';
      reasons = ['K線上穿D線', 'J線確認向上'];
    } else if (isDeathCross && avgKDJ > 20) {
      signal = 'bearish';
      strength = 70;
      confidence = 'moderate';
      message = 'KDJ死叉，短期看跌';
      reasons = ['K線下穿D線', 'J線確認向下'];
    } else {
      signal = 'neutral';
      strength = 50;
      confidence = 'weak';
      message = 'KDJ無明確信號';
      reasons = ['等待交叉信號或極值'];
    }

    return {
      indicator: 'KDJ',
      signal,
      strength,
      confidence,
      message,
      reasons
    };
  }
}

// ==================== 策略引擎核心 ====================

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
  static generateStrategySignals(judgments: IndicatorJudgment[]): StrategySignal[] {
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
  private static generateMomentumStrategy(judgments: IndicatorJudgment[]): StrategySignal {
    const bullishIndicators = judgments.filter(j => j.signal === 'bullish' || j.signal === 'extreme');
    const bearishIndicators = judgments.filter(j => j.signal === 'bearish');
    
    const bullishStrength = bullishIndicators.reduce((sum, j) => sum + j.strength, 0) / bullishIndicators.length || 0;
    const bearishStrength = bearishIndicators.reduce((sum, j) => sum + j.strength, 0) / bearishIndicators.length || 0;

    let action: 'buy' | 'sell' | 'hold' | 'reduce';
    let strength: number;
    let confidence: ConfidenceLevel;
    let recommendation: string;

    if (bullishIndicators.length >= 2 && bullishStrength > 65) {
      action = 'buy';
      strength = bullishStrength;
      confidence = bullishStrength > 80 ? 'strong' : 'moderate';
      recommendation = '多個指標看漲，適合趨勢跟踪操作';
    } else if (bearishIndicators.length >= 2 && bearishStrength > 65) {
      action = 'sell';
      strength = bearishStrength;
      confidence = bearishStrength > 80 ? 'strong' : 'moderate';
      recommendation = '多個指標看跌，建議減倉或止損';
    } else {
      action = 'hold';
      strength = 50;
      confidence = 'weak';
      recommendation = '指標信號不一致，建議觀望';
    }

    return {
      type: 'momentum',
      action,
      strength,
      confidence,
      riskLevel: strength > 80 ? 'high' : strength > 60 ? 'medium' : 'low',
      supportingIndicators: bullishIndicators.map(j => j.indicator),
      conflictingIndicators: bearishIndicators.map(j => j.indicator),
      recommendation
    };
  }

  /**
   * 均值回歸策略
   */
  private static generateMeanReversionStrategy(judgments: IndicatorJudgment[]): StrategySignal {
    const extremeIndicators = judgments.filter(j => j.signal === 'extreme');
    const rsiJudgment = judgments.find(j => j.indicator === 'RSI');
    const kdjJudgment = judgments.find(j => j.indicator === 'KDJ');

    let action: 'buy' | 'sell' | 'hold' | 'reduce' = 'hold';
    let strength = 50;
    let confidence: ConfidenceLevel = 'weak';
    let recommendation = '等待極值反轉機會';

    if (extremeIndicators.length > 0) {
      const avgStrength = extremeIndicators.reduce((sum, j) => sum + j.strength, 0) / extremeIndicators.length;
      
      if (rsiJudgment && rsiJudgment.signal === 'extreme') {
        // RSI極值反轉
        if (rsiJudgment.strength > 85) {
          action = rsiJudgment.reasons.some(r => r.includes('超賣')) ? 'buy' : 'sell';
          strength = avgStrength;
          confidence = 'strong';
          recommendation = `RSI${action === 'buy' ? '極度超賣' : '極度超買'}，反轉機會較大`;
        }
      }
    }

    return {
      type: 'mean_reversion',
      action,
      strength,
      confidence,
      riskLevel: 'medium',
      supportingIndicators: extremeIndicators.map(j => j.indicator),
      conflictingIndicators: [],
      recommendation
    };
  }

  /**
   * 突破策略
   */
  private static generateBreakoutStrategy(judgments: IndicatorJudgment[]): StrategySignal {
    const macdJudgment = judgments.find(j => j.indicator === 'MACD');
    const strongSignals = judgments.filter(j => j.confidence === 'strong');

    let action: 'buy' | 'sell' | 'hold' | 'reduce' = 'hold';
    let strength = 50;
    let confidence: ConfidenceLevel = 'weak';
    let recommendation = '等待突破確認信號';

    if (macdJudgment && strongSignals.length >= 1) {
      if (macdJudgment.signal === 'bullish' && macdJudgment.strength > 75) {
        action = 'buy';
        strength = macdJudgment.strength;
        confidence = 'strong';
        recommendation = 'MACD強勢金叉，突破向上可能性大';
      } else if (macdJudgment.signal === 'bearish' && macdJudgment.strength > 75) {
        action = 'sell';
        strength = macdJudgment.strength;
        confidence = 'strong';
        recommendation = 'MACD強勢死叉，突破向下風險高';
      }
    }

    return {
      type: 'breakout',
      action,
      strength,
      confidence,
      riskLevel: 'high',
      supportingIndicators: strongSignals.map(j => j.indicator),
      conflictingIndicators: [],
      recommendation
    };
  }

  /**
   * 綜合策略分析
   */
  static performCompleteAnalysis(data: StockAnalysisDTO, symbol: string): StrategyAnalysis {
    const indicatorJudgments = this.analyzeIndicators(data);
    const strategySignals = this.generateStrategySignals(indicatorJudgments);

    // 計算整體信號
    const avgStrength = indicatorJudgments.reduce((sum, j) => sum + j.strength, 0) / indicatorJudgments.length;
    const bullishCount = indicatorJudgments.filter(j => j.signal === 'bullish' || j.signal === 'extreme').length;
    const bearishCount = indicatorJudgments.filter(j => j.signal === 'bearish').length;

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
        primaryAction: bestStrategy.action === 'reduce' ? 'sell' : bestStrategy.action,
        secondaryActions: strategySignals
          .filter(s => s !== bestStrategy && s.strength > 60)
          .map(s => `${s.type}: ${s.recommendation}`),
        riskWarnings: strategySignals
          .filter(s => s.riskLevel === 'high')
          .map(s => `${s.type}策略風險較高`),
        timeframe: '短期(1-5個交易日)'
      }
    };
  }
}