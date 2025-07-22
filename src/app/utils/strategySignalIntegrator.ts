/**
 * 策略信號整合器 - Phase 3.3 增強版
 * Advanced Strategy Signal Integrator for Multiple Signal Processing
 */

import type { StrategySignal, IndicatorJudgment } from './strategyEngine';
import type { StandardizedSignal } from './strategySignalFormatter';
import type { RuleMatchResult } from './strategyRuleEngine';
import { STRATEGY_CONFIGS, SIGNAL_STRENGTH } from './constants/strategies';

// ==================== 增強型信號整合結果 ====================

export interface EnhancedSignalAnalysis {
  // 基本信息
  symbol: string;
  timestamp: Date;
  confidence: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  
  // 策略信號統計
  signalStats: {
    totalSignals: number;
    bullishSignals: number;
    bearishSignals: number;
    neutralSignals: number;
    conflictingSignals: boolean;
    dominantDirection: 'bullish' | 'bearish' | 'neutral';
  };
  
  // 信號強度分析
  strengthAnalysis: {
    averageStrength: number;
    weightedStrength: number;
    strongSignalCount: number;
    weakSignalCount: number;
    strengthDistribution: Record<string, number>;
  };
  
  // 風險評估
  riskProfile: {
    overallRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    riskFactors: string[];
    riskScore: number; // 0-100
    maxDrawdownEstimate: number;
    positionSizeRecommendation: number; // 0-1
  };
  
  // 操作建議
  actionRecommendation: {
    primaryAction: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    actionConfidence: number; // 0-100
    urgency: 'immediate' | 'soon' | 'normal' | 'patient' | 'wait';
    reasoning: string[];
    alternatives: string[];
    warnings: string[];
  };
  
  // 時機分析
  timingAnalysis: {
    optimalEntry: 'now' | 'wait_dip' | 'wait_breakout' | 'wait_confirmation' | 'avoid';
    timeHorizon: 'intraday' | 'short_term' | 'medium_term' | 'long_term';
    expectedDuration: string;
    keyLevels: {
      support?: number;
      resistance?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
  };
}

// ==================== 多策略信號衝突解決 ====================

export class SignalConflictResolver {
  /**
   * 解決多策略間的信號衝突
   */
  static resolveConflicts(signals: StandardizedSignal[]): {
    resolvedSignals: StandardizedSignal[];
    conflictReport: {
      hasConflicts: boolean;
      conflictingPairs: Array<{
        signal1: string;
        signal2: string;
        conflictType: 'directional' | 'timing' | 'risk';
        resolution: string;
      }>;
    };
  } {
    const conflictingPairs: any[] = [];
    let resolvedSignals = [...signals];

    // 1. 檢測方向性衝突 (買入 vs 賣出)
    const bullishSignals = signals.filter(s => s.primary.action === 'buy');
    const bearishSignals = signals.filter(s => s.primary.action === 'sell');
    
    if (bullishSignals.length > 0 && bearishSignals.length > 0) {
      // 選擇強度最高的信號
      const strongestBullish = bullishSignals.sort((a, b) => b.primary.strength - a.primary.strength)[0];
      const strongestBearish = bearishSignals.sort((a, b) => b.primary.strength - a.primary.strength)[0];
      
      if (strongestBullish.primary.strength > strongestBearish.primary.strength) {
        resolvedSignals = resolvedSignals.filter(s => s.primary.action !== 'sell');
        conflictingPairs.push({
          signal1: strongestBullish.strategy.name,
          signal2: strongestBearish.strategy.name,
          conflictType: 'directional',
          resolution: `保留較強的${strongestBullish.strategy.name}信號`
        });
      } else {
        resolvedSignals = resolvedSignals.filter(s => s.primary.action !== 'buy');
        conflictingPairs.push({
          signal1: strongestBearish.strategy.name,
          signal2: strongestBullish.strategy.name,
          conflictType: 'directional',
          resolution: `保留較強的${strongestBearish.strategy.name}信號`
        });
      }
    }

    // 2. 檢測時機衝突 (立即 vs 耐心等待)
    const immediateSignals = resolvedSignals.filter(s => s.primary.urgency === 'immediate');
    const patientSignals = resolvedSignals.filter(s => s.primary.urgency === 'patient');
    
    if (immediateSignals.length > 0 && patientSignals.length > 0) {
      // 根據信號強度決定時機
      const avgImmediateStrength = immediateSignals.reduce((sum, s) => sum + s.primary.strength, 0) / immediateSignals.length;
      const avgPatientStrength = patientSignals.reduce((sum, s) => sum + s.primary.strength, 0) / patientSignals.length;
      
      if (avgImmediateStrength > avgPatientStrength + 15) {
        // 立即行動信號更強
        resolvedSignals = resolvedSignals.map(s => 
          s.primary.urgency === 'patient' ? {...s, primary: {...s.primary, urgency: 'normal'}} : s
        );
      } else {
        // 耐心等待更謹慎
        resolvedSignals = resolvedSignals.map(s => 
          s.primary.urgency === 'immediate' ? {...s, primary: {...s.primary, urgency: 'normal'}} : s
        );
      }
    }

    // 3. 檢測風險等級衝突
    const highRiskSignals = resolvedSignals.filter(s => s.strategy.riskLevel === 'high');
    const lowRiskSignals = resolvedSignals.filter(s => s.strategy.riskLevel === 'low');
    
    if (highRiskSignals.length > 0 && lowRiskSignals.length > 0) {
      conflictingPairs.push({
        signal1: '高風險策略',
        signal2: '低風險策略',
        conflictType: 'risk',
        resolution: '建議採用中等風險的倉位管理策略'
      });
    }

    return {
      resolvedSignals,
      conflictReport: {
        hasConflicts: conflictingPairs.length > 0,
        conflictingPairs
      }
    };
  }
}

// ==================== 增強型策略評分系統 ====================

export class AdvancedStrategyScorer {
  /**
   * 計算增強型策略評分
   */
  static calculateEnhancedScore(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    marketCondition: string
  ): {
    overallScore: number;
    subscores: {
      signalQuality: number;
      signalConsistency: number;
      riskAdjustedScore: number;
      timingScore: number;
      marketFitScore: number;
    };
    confidenceLevel: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  } {
    
    // 1. 信號質量評分 (0-100)
    const signalQuality = this.calculateSignalQuality(signals);
    
    // 2. 信號一致性評分 (0-100)
    const signalConsistency = this.calculateSignalConsistency(signals);
    
    // 3. 風險調整評分 (0-100)
    const riskAdjustedScore = this.calculateRiskAdjustedScore(signals);
    
    // 4. 時機評分 (0-100)
    const timingScore = this.calculateTimingScore(signals, indicators);
    
    // 5. 市場適配度評分 (0-100)
    const marketFitScore = this.calculateMarketFitScore(signals, marketCondition);
    
    // 綜合評分 (加權平均)
    const weights = {
      signalQuality: 0.3,
      signalConsistency: 0.25,
      riskAdjustedScore: 0.2,
      timingScore: 0.15,
      marketFitScore: 0.1
    };
    
    const overallScore = Math.round(
      signalQuality * weights.signalQuality +
      signalConsistency * weights.signalConsistency +
      riskAdjustedScore * weights.riskAdjustedScore +
      timingScore * weights.timingScore +
      marketFitScore * weights.marketFitScore
    );
    
    // 確定信心水平
    let confidenceLevel: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
    if (overallScore >= 85) confidenceLevel = 'very_strong';
    else if (overallScore >= 70) confidenceLevel = 'strong';
    else if (overallScore >= 55) confidenceLevel = 'moderate';
    else if (overallScore >= 35) confidenceLevel = 'weak';
    else confidenceLevel = 'very_weak';
    
    return {
      overallScore,
      subscores: {
        signalQuality,
        signalConsistency,
        riskAdjustedScore,
        timingScore,
        marketFitScore
      },
      confidenceLevel
    };
  }

  private static calculateSignalQuality(signals: StandardizedSignal[]): number {
    if (signals.length === 0) return 0;
    
    // 基於信號強度和置信度的質量評分
    const avgStrength = signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length;
    const strongSignalRatio = signals.filter(s => s.primary.confidence === 'strong').length / signals.length;
    
    return Math.round(avgStrength * 0.7 + strongSignalRatio * 30);
  }

  private static calculateSignalConsistency(signals: StandardizedSignal[]): number {
    if (signals.length <= 1) return 100;
    
    // 計算信號方向的一致性
    const actions = signals.map(s => s.primary.action);
    const actionCounts = actions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(actionCounts));
    const consistency = (maxCount / signals.length) * 100;
    
    return Math.round(consistency);
  }

  private static calculateRiskAdjustedScore(signals: StandardizedSignal[]): number {
    if (signals.length === 0) return 0;
    
    // 根據風險等級調整評分
    const riskWeights = { low: 1.0, medium: 0.8, high: 0.6 };
    const weightedScore = signals.reduce((sum, s) => {
      const weight = riskWeights[s.strategy.riskLevel];
      return sum + (s.primary.strength * weight);
    }, 0) / signals.length;
    
    return Math.round(weightedScore);
  }

  private static calculateTimingScore(signals: StandardizedSignal[], indicators: IndicatorJudgment[]): number {
    // 基於指標的時機評分
    const rsiIndicator = indicators.find(i => i.indicator === 'RSI');
    const macdIndicator = indicators.find(i => i.indicator === 'MACD');
    
    let timingScore = 50; // 基準分
    
    // RSI時機評分
    if (rsiIndicator) {
      if (rsiIndicator.signal === 'extreme') {
        timingScore += 20; // 極值是好的進場時機
      } else if (rsiIndicator.signal === 'neutral') {
        timingScore += 10;
      }
    }
    
    // MACD時機評分
    if (macdIndicator) {
      if (macdIndicator.signal === 'bullish' || macdIndicator.signal === 'bearish') {
        timingScore += 15; // 明確的MACD信號
      }
    }
    
    // 信號緊急度評分
    const urgentSignals = signals.filter(s => s.primary.urgency === 'immediate').length;
    if (urgentSignals > 0) {
      timingScore += 15;
    }
    
    return Math.min(100, Math.round(timingScore));
  }

  private static calculateMarketFitScore(signals: StandardizedSignal[], marketCondition: string): number {
    if (signals.length === 0) return 0;
    
    // 根據市場狀況評估策略適配度
    let fitScore = 50;
    
    if (marketCondition.includes('趨勢')) {
      // 趨勢市場適合動量策略
      const momentumSignals = signals.filter(s => s.strategy.name.includes('動量'));
      fitScore += momentumSignals.length * 10;
    } else if (marketCondition.includes('震盪')) {
      // 震盪市場適合均值回歸
      const reversionSignals = signals.filter(s => s.strategy.name.includes('回歸'));
      fitScore += reversionSignals.length * 15;
    }
    
    return Math.min(100, Math.round(fitScore));
  }
}

// ==================== 智能操作建議生成器 ====================

export class IntelligentAdviceGenerator {
  /**
   * 生成智能化的操作建議
   */
  static generateAdvice(
    signals: StandardizedSignal[],
    scoring: any,
    marketCondition: string,
    currentPrice?: number
  ): EnhancedSignalAnalysis['actionRecommendation'] {
    
    const { resolvedSignals } = SignalConflictResolver.resolveConflicts(signals);
    
    // 分析主要動作
    const actionCounts = resolvedSignals.reduce((acc, signal) => {
      acc[signal.primary.action] = (acc[signal.primary.action] || 0) + signal.primary.strength;
      return acc;
    }, {} as Record<string, number>);
    
    const primaryAction = this.determinePrimaryAction(actionCounts, scoring.overallScore);
    const actionConfidence = this.calculateActionConfidence(resolvedSignals, scoring);
    const urgency = this.determineUrgency(resolvedSignals, scoring);
    
    // 生成推理邏輯
    const reasoning = this.generateReasoning(resolvedSignals, scoring, marketCondition);
    const alternatives = this.generateAlternatives(resolvedSignals, primaryAction);
    const warnings = this.generateWarnings(resolvedSignals, scoring);
    
    return {
      primaryAction,
      actionConfidence,
      urgency,
      reasoning,
      alternatives,
      warnings
    };
  }

  private static determinePrimaryAction(
    actionCounts: Record<string, number>,
    overallScore: number
  ): 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' {
    
    if (Object.keys(actionCounts).length === 0) return 'hold';
    
    const topAction = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const topStrength = actionCounts[topAction];
    
    // 根據信號強度和總體評分決定行動強度
    if (topAction === 'buy') {
      return topStrength >= 80 && overallScore >= 75 ? 'strong_buy' : 'buy';
    } else if (topAction === 'sell') {
      return topStrength >= 80 && overallScore >= 75 ? 'strong_sell' : 'sell';
    }
    
    return 'hold';
  }

  private static calculateActionConfidence(signals: StandardizedSignal[], scoring: any): number {
    const baseConfidence = scoring.overallScore;
    const signalCount = signals.length;
    const strongSignalCount = signals.filter(s => s.primary.confidence === 'strong').length;
    
    // 信號數量和質量影響信心度
    let confidence = baseConfidence;
    if (signalCount >= 3) confidence += 5;
    if (strongSignalCount >= 2) confidence += 10;
    
    return Math.min(100, Math.round(confidence));
  }

  private static determineUrgency(
    signals: StandardizedSignal[],
    scoring: any
  ): 'immediate' | 'soon' | 'normal' | 'patient' | 'wait' {
    
    if (scoring.overallScore < 40) return 'wait';
    
    const immediateSignals = signals.filter(s => s.primary.urgency === 'immediate').length;
    const avgStrength = signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length;
    
    if (immediateSignals >= 2 && avgStrength >= 75) return 'immediate';
    if (immediateSignals >= 1 && avgStrength >= 65) return 'soon';
    if (avgStrength >= 55) return 'normal';
    
    return 'patient';
  }

  private static generateReasoning(
    signals: StandardizedSignal[],
    scoring: any,
    marketCondition: string
  ): string[] {
    const reasoning: string[] = [];
    
    // 1. 基於信號強度的推理
    if (scoring.overallScore >= 70) {
      reasoning.push(`綜合策略評分達到${scoring.overallScore}%，信號強度較高`);
    } else if (scoring.overallScore >= 50) {
      reasoning.push(`綜合策略評分${scoring.overallScore}%，信號中等偏強`);
    } else {
      reasoning.push(`綜合策略評分${scoring.overallScore}%，信號偏弱，需謹慎操作`);
    }
    
    // 2. 基於信號一致性的推理
    if (scoring.subscores.signalConsistency >= 80) {
      reasoning.push(`多策略信號高度一致，方向明確`);
    } else if (scoring.subscores.signalConsistency >= 60) {
      reasoning.push(`策略信號基本一致，但存在分歧`);
    } else {
      reasoning.push(`策略信號分歧較大，市場方向不確定`);
    }
    
    // 3. 基於市場環境的推理
    reasoning.push(`當前市場狀況為${marketCondition}，${this.getMarketAdvice(marketCondition)}`);
    
    return reasoning;
  }

  private static generateAlternatives(
    signals: StandardizedSignal[],
    primaryAction: string
  ): string[] {
    const alternatives: string[] = [];
    
    // 根據主要行動生成替代方案
    switch (primaryAction) {
      case 'strong_buy':
      case 'buy':
        alternatives.push('分批建倉以降低風險');
        alternatives.push('等待回調到支撐位進場');
        alternatives.push('設置較緊的止損位');
        break;
      case 'strong_sell':
      case 'sell':
        alternatives.push('分批減倉保留觀察倉位');
        alternatives.push('等待反彈到阻力位減倉');
        alternatives.push('設置止盈位鎖定利潤');
        break;
      default:
        alternatives.push('保持觀望等待更明確信號');
        alternatives.push('小倉位試探性操作');
        alternatives.push('關注關鍵技術位突破');
    }
    
    return alternatives;
  }

  private static generateWarnings(
    signals: StandardizedSignal[],
    scoring: any
  ): string[] {
    const warnings: string[] = [];
    
    // 1. 基於信號質量的警告
    if (scoring.subscores.signalQuality < 60) {
      warnings.push('信號質量偏低，建議等待更強信號');
    }
    
    // 2. 基於風險的警告
    const highRiskSignals = signals.filter(s => s.strategy.riskLevel === 'high').length;
    if (highRiskSignals > 0) {
      warnings.push(`包含${highRiskSignals}個高風險策略，嚴格控制倉位`);
    }
    
    // 3. 基於一致性的警告
    if (scoring.subscores.signalConsistency < 70) {
      warnings.push('策略信號存在分歧，注意市場變化');
    }
    
    // 4. 基於時機的警告
    if (scoring.subscores.timingScore < 60) {
      warnings.push('當前時機可能不是最佳，考慮等待更好入場點');
    }
    
    return warnings;
  }

  private static getMarketAdvice(marketCondition: string): string {
    if (marketCondition.includes('上漲')) return '適合追漲操作';
    if (marketCondition.includes('下跌')) return '適合逢高減倉';
    if (marketCondition.includes('震盪')) return '適合高拋低吸';
    return '需要密切觀察市場動向';
  }
}

// ==================== 主要導出接口 ====================

/**
 * 執行完整的增強型策略分析
 */
export const performEnhancedStrategyAnalysis = (
  signals: StandardizedSignal[],
  indicators: IndicatorJudgment[],
  marketCondition: string,
  symbol: string,
  currentPrice?: number
): EnhancedSignalAnalysis => {
  
  // 1. 解決信號衝突
  const { resolvedSignals, conflictReport } = SignalConflictResolver.resolveConflicts(signals);
  
  // 2. 計算增強型評分
  const scoring = AdvancedStrategyScorer.calculateEnhancedScore(
    resolvedSignals,
    indicators,
    marketCondition
  );
  
  // 3. 生成操作建議
  const actionRecommendation = IntelligentAdviceGenerator.generateAdvice(
    resolvedSignals,
    scoring,
    marketCondition,
    currentPrice
  );
  
  // 4. 分析信號統計
  const signalStats = {
    totalSignals: resolvedSignals.length,
    bullishSignals: resolvedSignals.filter(s => s.primary.action === 'buy').length,
    bearishSignals: resolvedSignals.filter(s => s.primary.action === 'sell').length,
    neutralSignals: resolvedSignals.filter(s => s.primary.action === 'hold').length,
    conflictingSignals: conflictReport.hasConflicts,
    dominantDirection: actionRecommendation.primaryAction.includes('buy') ? 'bullish' as const :
                      actionRecommendation.primaryAction.includes('sell') ? 'bearish' as const :
                      'neutral' as const
  };
  
  // 5. 強度分析
  const strengthAnalysis = {
    averageStrength: resolvedSignals.length > 0 ? 
      resolvedSignals.reduce((sum, s) => sum + s.primary.strength, 0) / resolvedSignals.length : 0,
    weightedStrength: scoring.subscores.riskAdjustedScore,
    strongSignalCount: resolvedSignals.filter(s => s.primary.confidence === 'strong').length,
    weakSignalCount: resolvedSignals.filter(s => s.primary.confidence === 'weak').length,
    strengthDistribution: resolvedSignals.reduce((acc, s) => {
      const range = Math.floor(s.primary.strength / 20) * 20;
      const key = `${range}-${range + 19}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  // 6. 風險評估
  const riskProfile = {
    overallRisk: scoring.overallScore >= 80 ? 'low' as const :
                 scoring.overallScore >= 60 ? 'medium' as const :
                 'high' as const,
    riskFactors: conflictReport.conflictingPairs.map(p => p.resolution),
    riskScore: 100 - scoring.subscores.riskAdjustedScore,
    maxDrawdownEstimate: resolvedSignals.length > 0 ? 
      Math.max(...resolvedSignals.map(s => STRATEGY_CONFIGS[s.strategy.type as keyof typeof STRATEGY_CONFIGS]?.maxDrawdown || 0.1)) : 0.1,
    positionSizeRecommendation: Math.min(0.5, Math.max(0.1, scoring.overallScore / 200))
  };
  
  // 7. 時機分析
  const timingAnalysis = {
    optimalEntry: scoring.subscores.timingScore >= 75 ? 'now' as const :
                  scoring.subscores.timingScore >= 60 ? 'wait_confirmation' as const :
                  'wait_dip' as const,
    timeHorizon: resolvedSignals.some(s => s.strategy.timeframe.includes('中期')) ? 'medium_term' as const :
                 'short_term' as const,
    expectedDuration: resolvedSignals[0]?.strategy.timeframe || '短期(1-5日)',
    keyLevels: {
      stopLoss: currentPrice ? currentPrice * 0.95 : undefined,
      takeProfit: currentPrice ? currentPrice * 1.08 : undefined
    }
  };
  
  return {
    symbol,
    timestamp: new Date(),
    confidence: scoring.confidenceLevel,
    signalStats,
    strengthAnalysis,
    riskProfile,
    actionRecommendation,
    timingAnalysis
  };
};