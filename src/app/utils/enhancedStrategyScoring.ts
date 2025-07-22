/**
 * 增強型策略評分系統 - Phase 3.3
 * Enhanced Strategy Scoring System with Advanced Analytics
 */

import type { StrategySignal, IndicatorJudgment } from './strategyEngine';
import type { StandardizedSignal } from './strategySignalFormatter';
import { STRATEGY_CONFIGS, INDICATOR_THRESHOLDS } from './constants/strategies';

// ==================== 評分權重配置 ====================

interface ScoringWeights {
  signalStrength: number;
  signalConsistency: number;
  indicatorAlignment: number;
  riskAdjustment: number;
  timingOptimality: number;
  marketConditionFit: number;
  volumeConfirmation: number;
  historicalAccuracy: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  signalStrength: 0.25,      // 信號本身強度
  signalConsistency: 0.20,   // 多信號一致性
  indicatorAlignment: 0.15,  // 技術指標配合度
  riskAdjustment: 0.15,      // 風險調整
  timingOptimality: 0.10,    // 時機最優性
  marketConditionFit: 0.08,  // 市場環境適配
  volumeConfirmation: 0.04,  // 成交量確認
  historicalAccuracy: 0.03   // 歷史準確性
};

// ==================== 評分詳細結果 ====================

export interface DetailedScoringResult {
  // 總體評分
  overallScore: number; // 0-100
  confidence: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  
  // 分項評分
  componentScores: {
    signalStrength: number;
    signalConsistency: number;
    indicatorAlignment: number;
    riskAdjustment: number;
    timingOptimality: number;
    marketConditionFit: number;
    volumeConfirmation: number;
    historicalAccuracy: number;
  };
  
  // 評分分析
  analysis: {
    strengths: string[];      // 優勢項目
    weaknesses: string[];     // 劣勢項目
    recommendations: string[]; // 改進建議
    keyInsights: string[];    // 關鍵洞察
  };
  
  // 風險評估
  riskMetrics: {
    expectedReturn: number;    // 預期收益率
    maxDrawdown: number;       // 最大回撤
    sharpeRatio: number;       // 夏普比率
    winRate: number;           // 勝率
    riskRewardRatio: number;   // 風險收益比
  };
  
  // 操作建議
  actionGuidance: {
    recommendedAction: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;        // 操作信心度
    positionSizing: number;    // 建議倉位 0-1
    stopLossLevel: number;     // 止損水平
    takeProfitLevel: number;   // 止盈水平
    timeHorizon: string;       // 持有期限
  };
}

// ==================== 增強型評分引擎 ====================

export class EnhancedScoringEngine {
  
  /**
   * 執行完整的增強型評分分析
   */
  static performDetailedScoring(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    marketCondition: string,
    currentPrice?: number,
    historicalData?: any[],
    customWeights?: Partial<ScoringWeights>
  ): DetailedScoringResult {
    
    const weights = { ...DEFAULT_WEIGHTS, ...customWeights };
    
    // 1. 計算各分項評分
    const componentScores = {
      signalStrength: this.calculateSignalStrengthScore(signals),
      signalConsistency: this.calculateConsistencyScore(signals),
      indicatorAlignment: this.calculateIndicatorAlignmentScore(signals, indicators),
      riskAdjustment: this.calculateRiskAdjustmentScore(signals),
      timingOptimality: this.calculateTimingOptimalityScore(signals, indicators),
      marketConditionFit: this.calculateMarketFitScore(signals, marketCondition),
      volumeConfirmation: this.calculateVolumeConfirmationScore(signals, historicalData),
      historicalAccuracy: this.calculateHistoricalAccuracyScore(signals, historicalData)
    };
    
    // 2. 計算加權總分
    const overallScore = Math.round(
      Object.entries(componentScores).reduce((total, [key, score]) => {
        const weight = weights[key as keyof ScoringWeights];
        return total + (score * weight);
      }, 0)
    );
    
    // 3. 確定信心等級和評級
    const confidence = this.determineConfidenceLevel(overallScore, componentScores);
    const grade = this.determineGrade(overallScore);
    
    // 4. 生成分析洞察
    const analysis = this.generateAnalysis(componentScores, signals, indicators);
    
    // 5. 計算風險指標
    const riskMetrics = this.calculateRiskMetrics(signals, overallScore);
    
    // 6. 生成操作指導
    const actionGuidance = this.generateActionGuidance(
      signals, 
      overallScore, 
      confidence, 
      currentPrice
    );
    
    return {
      overallScore,
      confidence,
      grade,
      componentScores,
      analysis,
      riskMetrics,
      actionGuidance
    };
  }
  
  // ==================== 分項評分計算 ====================
  
  /**
   * 計算信號強度評分
   */
  private static calculateSignalStrengthScore(signals: StandardizedSignal[]): number {
    if (signals.length === 0) return 0;
    
    // 計算平均強度
    const avgStrength = signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length;
    
    // 計算強信號比例
    const strongSignalRatio = signals.filter(s => s.primary.confidence === 'strong').length / signals.length;
    
    // 計算信號數量加成
    const signalCountBonus = Math.min(10, signals.length * 2);
    
    return Math.min(100, Math.round(avgStrength * 0.7 + strongSignalRatio * 20 + signalCountBonus));
  }
  
  /**
   * 計算信號一致性評分
   */
  private static calculateConsistencyScore(signals: StandardizedSignal[]): number {
    if (signals.length <= 1) return 100;
    
    // 方向一致性
    const actions = signals.map(s => s.primary.action);
    const actionCounts = actions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxActionCount = Math.max(...Object.values(actionCounts));
    const directionConsistency = (maxActionCount / signals.length) * 100;
    
    // 強度一致性
    const strengths = signals.map(s => s.primary.strength);
    const avgStrength = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
    const strengthVariance = strengths.reduce((sum, s) => sum + Math.pow(s - avgStrength, 2), 0) / strengths.length;
    const strengthConsistency = Math.max(0, 100 - strengthVariance / 10);
    
    return Math.round((directionConsistency * 0.7 + strengthConsistency * 0.3));
  }
  
  /**
   * 計算技術指標配合度評分
   */
  private static calculateIndicatorAlignmentScore(
    signals: StandardizedSignal[], 
    indicators: IndicatorJudgment[]
  ): number {
    if (signals.length === 0 || indicators.length === 0) return 50;
    
    let alignmentScore = 0;
    let totalWeight = 0;
    
    // 檢查各指標與策略信號的配合度
    indicators.forEach(indicator => {
      const weight = this.getIndicatorWeight(indicator.indicator);
      totalWeight += weight;
      
      // 計算該指標與策略的一致性
      const consistency = this.calculateIndicatorSignalConsistency(indicator, signals);
      alignmentScore += consistency * weight;
    });
    
    return totalWeight > 0 ? Math.round(alignmentScore / totalWeight) : 50;
  }
  
  /**
   * 計算風險調整評分
   */
  private static calculateRiskAdjustmentScore(signals: StandardizedSignal[]): number {
    if (signals.length === 0) return 0;
    
    // 計算風險分布
    const riskCounts = signals.reduce((acc, s) => {
      acc[s.strategy.riskLevel] = (acc[s.strategy.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const highRiskRatio = (riskCounts.high || 0) / signals.length;
    const mediumRiskRatio = (riskCounts.medium || 0) / signals.length;
    const lowRiskRatio = (riskCounts.low || 0) / signals.length;
    
    // 理想的風險分布：低風險40%，中風險50%，高風險10%
    const idealScore = 100 - Math.abs(lowRiskRatio - 0.4) * 50 
                           - Math.abs(mediumRiskRatio - 0.5) * 60
                           - Math.abs(highRiskRatio - 0.1) * 100;
    
    return Math.max(0, Math.round(idealScore));
  }
  
  /**
   * 計算時機最優性評分
   */
  private static calculateTimingOptimalityScore(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[]
  ): number {
    let timingScore = 50; // 基準分
    
    // 檢查RSI時機
    const rsiIndicator = indicators.find(i => i.indicator === 'RSI');
    if (rsiIndicator) {
      if (rsiIndicator.signal === 'extreme') {
        timingScore += 25; // 極值時機最佳
      } else if (rsiIndicator.signal === 'bullish' || rsiIndicator.signal === 'bearish') {
        timingScore += 15;
      }
    }
    
    // 檢查MACD時機
    const macdIndicator = indicators.find(i => i.indicator === 'MACD');
    if (macdIndicator && (macdIndicator.signal === 'bullish' || macdIndicator.signal === 'bearish')) {
      timingScore += 15;
    }
    
    // 檢查信號緊急度
    const urgentSignals = signals.filter(s => s.primary.urgency === 'immediate');
    if (urgentSignals.length > 0) {
      timingScore += 10;
    }
    
    return Math.min(100, Math.round(timingScore));
  }
  
  /**
   * 計算市場環境適配度評分
   */
  private static calculateMarketFitScore(signals: StandardizedSignal[], marketCondition: string): number {
    if (signals.length === 0) return 50;
    
    let fitScore = 50;
    
    // 趨勢市場偏好動量策略
    if (marketCondition.includes('趨勢') || marketCondition.includes('上漲') || marketCondition.includes('下跌')) {
      const momentumSignals = signals.filter(s => s.strategy.name.includes('動量')).length;
      fitScore += momentumSignals * 8;
    }
    
    // 震盪市場偏好均值回歸
    if (marketCondition.includes('震盪') || marketCondition.includes('整理')) {
      const reversionSignals = signals.filter(s => s.strategy.name.includes('回歸')).length;
      fitScore += reversionSignals * 10;
    }
    
    // 突破形態偏好突破策略
    if (marketCondition.includes('突破')) {
      const breakoutSignals = signals.filter(s => s.strategy.name.includes('突破')).length;
      fitScore += breakoutSignals * 12;
    }
    
    return Math.min(100, Math.round(fitScore));
  }
  
  /**
   * 計算成交量確認評分
   */
  private static calculateVolumeConfirmationScore(
    signals: StandardizedSignal[],
    historicalData?: any[]
  ): number {
    // 如果沒有歷史數據，返回中性分數
    if (!historicalData || historicalData.length === 0) return 50;
    
    // 這裡可以實現成交量分析邏輯
    // 暫時返回基於信號強度的估算
    const avgStrength = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length : 50;
    
    return Math.round(avgStrength * 0.8 + 20);
  }
  
  /**
   * 計算歷史準確性評分
   */
  private static calculateHistoricalAccuracyScore(
    signals: StandardizedSignal[],
    historicalData?: any[]
  ): number {
    // 如果沒有歷史數據，返回中性分數
    if (!historicalData || historicalData.length === 0) return 50;
    
    // 這裡可以實現歷史回測邏輯
    // 暫時返回基於策略類型的估算準確率
    const accuracyEstimates = {
      momentum: 65,
      mean_reversion: 72,
      breakout: 58
    };
    
    if (signals.length === 0) return 50;
    
    const avgAccuracy = signals.reduce((sum, s) => {
      const strategyType = s.strategy.type as keyof typeof accuracyEstimates;
      return sum + (accuracyEstimates[strategyType] || 60);
    }, 0) / signals.length;
    
    return Math.round(avgAccuracy);
  }
  
  // ==================== 輔助方法 ====================
  
  private static getIndicatorWeight(indicator: string): number {
    const weights = {
      'RSI': 0.3,
      'MACD': 0.35,
      'MA': 0.25,
      'KDJ': 0.1
    };
    return weights[indicator as keyof typeof weights] || 0.1;
  }
  
  private static calculateIndicatorSignalConsistency(
    indicator: IndicatorJudgment,
    signals: StandardizedSignal[]
  ): number {
    if (signals.length === 0) return 50;
    
    // 檢查指標信號與策略信號的一致性
    let consistentSignals = 0;
    
    signals.forEach(signal => {
      const signalDirection = signal.primary.action;
      const indicatorDirection = indicator.signal;
      
      if (
        (signalDirection === 'buy' && (indicatorDirection === 'bullish' || indicatorDirection === 'extreme')) ||
        (signalDirection === 'sell' && (indicatorDirection === 'bearish' || indicatorDirection === 'extreme'))
      ) {
        consistentSignals++;
      }
    });
    
    return (consistentSignals / signals.length) * 100;
  }
  
  private static determineConfidenceLevel(
    overallScore: number,
    componentScores: any
  ): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    
    // 檢查關鍵分項是否都達標
    const keyScores = [
      componentScores.signalStrength,
      componentScores.signalConsistency,
      componentScores.indicatorAlignment
    ];
    
    const avgKeyScore = keyScores.reduce((sum, score) => sum + score, 0) / keyScores.length;
    
    if (overallScore >= 85 && avgKeyScore >= 80) return 'very_high';
    if (overallScore >= 75 && avgKeyScore >= 70) return 'high';
    if (overallScore >= 60 && avgKeyScore >= 60) return 'medium';
    if (overallScore >= 40) return 'low';
    return 'very_low';
  }
  
  private static determineGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
  
  private static generateAnalysis(
    componentScores: any,
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[]
  ): DetailedScoringResult['analysis'] {
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    const keyInsights: string[] = [];
    
    // 分析優勢
    Object.entries(componentScores).forEach(([key, score]) => {
      if (score >= 80) {
        strengths.push(this.getScoreDescription(key, 'strength'));
      } else if (score <= 50) {
        weaknesses.push(this.getScoreDescription(key, 'weakness'));
      }
    });
    
    // 生成建議
    if (componentScores.signalConsistency < 70) {
      recommendations.push('等待信號更加一致後再行動');
    }
    if (componentScores.riskAdjustment < 60) {
      recommendations.push('優化風險管理，降低高風險策略比重');
    }
    if (componentScores.timingOptimality < 65) {
      recommendations.push('等待更佳的市場時機');
    }
    
    // 關鍵洞察
    if (signals.length >= 3) {
      keyInsights.push(`當前有${signals.length}個策略信號，信號豐富度較高`);
    }
    if (indicators.some(i => i.signal === 'extreme')) {
      keyInsights.push('存在極值信號，可能是關鍵轉折點');
    }
    
    return { strengths, weaknesses, recommendations, keyInsights };
  }
  
  private static getScoreDescription(category: string, type: 'strength' | 'weakness'): string {
    const descriptions = {
      signalStrength: { strength: '策略信號強度優秀', weakness: '策略信號強度不足' },
      signalConsistency: { strength: '多策略高度一致', weakness: '策略信號存在分歧' },
      indicatorAlignment: { strength: '技術指標配合良好', weakness: '技術指標配合度差' },
      riskAdjustment: { strength: '風險控制得當', weakness: '風險分布不均' },
      timingOptimality: { strength: '進場時機較佳', weakness: '時機選择有待優化' },
      marketConditionFit: { strength: '策略適配市場環境', weakness: '策略與市場環境不匹配' }
    };
    
    return descriptions[category as keyof typeof descriptions]?.[type] || '評分異常';
  }
  
  private static calculateRiskMetrics(
    signals: StandardizedSignal[],
    overallScore: number
  ): DetailedScoringResult['riskMetrics'] {
    
    const expectedReturn = overallScore >= 80 ? 0.12 : 
                          overallScore >= 60 ? 0.08 : 
                          overallScore >= 40 ? 0.05 : 0.02;
    
    const maxDrawdown = signals.length > 0 ? 
      Math.max(...signals.map(s => STRATEGY_CONFIGS[s.strategy.type as keyof typeof STRATEGY_CONFIGS]?.maxDrawdown || 0.1)) :
      0.1;
    
    const sharpeRatio = expectedReturn / (maxDrawdown * 2);
    const winRate = Math.min(0.85, Math.max(0.45, overallScore / 100 * 0.7 + 0.15));
    const riskRewardRatio = expectedReturn / maxDrawdown;
    
    return {
      expectedReturn,
      maxDrawdown,
      sharpeRatio,
      winRate,
      riskRewardRatio
    };
  }
  
  private static generateActionGuidance(
    signals: StandardizedSignal[],
    overallScore: number,
    confidence: string,
    currentPrice?: number
  ): DetailedScoringResult['actionGuidance'] {
    
    // 確定推薦行動
    const actions = signals.map(s => s.primary.action);
    const actionCounts = actions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAction = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'hold';
    
    let recommendedAction: any = topAction;
    if (overallScore >= 85 && confidence === 'very_high') {
      recommendedAction = topAction === 'buy' ? 'strong_buy' : 
                         topAction === 'sell' ? 'strong_sell' : topAction;
    }
    
    // 計算其他參數
    const actionConfidence = Math.min(95, overallScore);
    const positionSizing = Math.min(0.5, Math.max(0.1, overallScore / 150));
    const stopLossLevel = currentPrice ? currentPrice * 0.95 : 0;
    const takeProfitLevel = currentPrice ? currentPrice * 1.08 : 0;
    const timeHorizon = signals[0]?.strategy.timeframe || '短期(1-5日)';
    
    return {
      recommendedAction,
      confidence: actionConfidence,
      positionSizing,
      stopLossLevel,
      takeProfitLevel,
      timeHorizon
    };
  }
}