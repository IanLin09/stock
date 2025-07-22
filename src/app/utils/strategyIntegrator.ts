/**
 * 策略集成器 - 整合所有策略引擎功能
 * Strategy Integrator - 將所有策略引擎組件整合成統一API
 */

import type { StockAnalysisDTO } from './dto';
import { StrategyEngine, type StrategyAnalysis } from './strategyEngine';
import { RuleEngine, StrategyScorer, type RuleMatchResult } from './strategyRuleEngine';
import { SignalFormatter, SignalFilter, type StandardizedSignal } from './strategySignalFormatter';
import { STRATEGY_RULES } from './strategyRuleEngine';

// ==================== 集成分析結果 ====================

export interface IntegratedAnalysis {
  // 基本信息
  symbol: string;
  timestamp: Date;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // 原始技術指標分析
  technicalAnalysis: StrategyAnalysis;
  
  // 規則引擎分析
  ruleAnalysis: {
    matchedRules: RuleMatchResult[];
    overallScore: number;
    confidence: 'weak' | 'moderate' | 'strong';
    recommendation: string;
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      suggestions: string[];
    };
  };
  
  // 標準化信號
  signals: StandardizedSignal[];
  
  // 最終建議
  finalRecommendation: {
    primaryAction: 'buy' | 'sell' | 'hold' | 'reduce';
    confidence: 'weak' | 'moderate' | 'strong';
    urgency: 'immediate' | 'normal' | 'patient';
    reasoning: string;
    alternatives: string[];
    warnings: string[];
  };
  
  // 風險管理
  riskManagement: {
    recommendedPosition: number; // 0-1
    stopLoss?: number;
    takeProfit?: number;
    maxRisk: number;
    timeframe: string;
  };
}

// ==================== 主要集成器類 ====================

export class StrategyIntegrator {
  /**
   * 執行完整的策略分析
   */
  static async performCompleteAnalysis(
    data: StockAnalysisDTO,
    symbol: string,
    currentPrice?: number,
    options?: {
      riskPreference?: 'conservative' | 'moderate' | 'aggressive';
      timeframe?: 'short' | 'medium' | 'long';
      minConfidence?: 'weak' | 'moderate' | 'strong';
    }
  ): Promise<IntegratedAnalysis> {
    
    // 1. 執行技術指標分析
    const technicalAnalysis = StrategyEngine.performCompleteAnalysis(data, symbol);
    
    // 2. 執行規則引擎分析
    const ruleResults = RuleEngine.evaluateAllRules(data, currentPrice);
    const ruleScoring = StrategyScorer.calculateOverallScore(ruleResults);
    const riskAssessment = StrategyScorer.assessRisk(ruleResults);
    
    // 3. 生成標準化信號
    let signals = SignalFormatter.formatMultipleSignals(ruleResults, symbol, currentPrice);
    
    // 4. 根據選項篩選信號
    if (options?.riskPreference) {
      signals = SignalFilter.filterByRiskPreference(signals, options.riskPreference);
    }
    
    if (options?.minConfidence) {
      signals = SignalFilter.filterByConfidence(signals, options.minConfidence);
    }
    
    // 5. 去除衝突並排序
    signals = SignalFilter.removeConflictingSignals(signals);
    signals = SignalFilter.sortByPriority(signals);
    
    // 6. 生成最終建議
    const finalRecommendation = this.generateFinalRecommendation(
      technicalAnalysis,
      ruleScoring,
      signals,
      options
    );
    
    // 7. 計算風險管理參數
    const riskManagement = this.calculateRiskManagement(signals, currentPrice);
    
    // 8. 評估數據質量
    const dataQuality = this.assessDataQuality(data);
    
    return {
      symbol,
      timestamp: new Date(),
      dataQuality,
      technicalAnalysis,
      ruleAnalysis: {
        matchedRules: ruleResults.filter(r => r.matched),
        overallScore: ruleScoring.score,
        confidence: ruleScoring.confidence,
        recommendation: ruleScoring.recommendation,
        riskAssessment: {
          level: riskAssessment.overallRisk,
          factors: riskAssessment.riskFactors,
          suggestions: riskAssessment.suggestions
        }
      },
      signals,
      finalRecommendation,
      riskManagement
    };
  }

  /**
   * 快速分析 - 只返回關鍵信息
   */
  static quickAnalysis(
    data: StockAnalysisDTO,
    symbol: string,
    currentPrice?: number
  ): {
    action: 'buy' | 'sell' | 'hold';
    confidence: number; // 0-100
    reason: string;
    risk: 'low' | 'medium' | 'high';
  } {
    const ruleResults = RuleEngine.evaluateAllRules(data, currentPrice);
    const bestStrategy = RuleEngine.getBestStrategy(data, currentPrice);
    
    if (!bestStrategy) {
      return {
        action: 'hold',
        confidence: 0,
        reason: '沒有明確策略信號',
        risk: 'low'
      };
    }
    
    const matchedRule = ruleResults.find(r => r.ruleId === bestStrategy.ruleId);
    const rule = STRATEGY_RULES.find((r: any) => r.id === bestStrategy.ruleId);
    
    return {
      action: rule?.action || 'hold',
      confidence: bestStrategy.score,
      reason: bestStrategy.recommendation,
      risk: rule?.riskLevel || 'low'
    };
  }

  /**
   * 比較多個symbol的策略強度
   */
  static compareStrategies(
    analyses: Array<{ symbol: string; data: StockAnalysisDTO; price?: number }>
  ): Array<{
    symbol: string;
    score: number;
    action: string;
    confidence: string;
    rank: number;
  }> {
    const results = analyses.map(({ symbol, data, price }) => {
      const quick = this.quickAnalysis(data, symbol, price);
      return {
        symbol,
        score: quick.confidence,
        action: quick.action,
        confidence: quick.confidence >= 70 ? 'high' : quick.confidence >= 50 ? 'medium' : 'low',
        rank: 0
      };
    });
    
    // 按得分排序並設置排名
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return results;
  }

  /**
   * 生成最終建議
   */
  private static generateFinalRecommendation(
    technicalAnalysis: StrategyAnalysis,
    ruleScoring: any,
    signals: StandardizedSignal[],
    options?: any
  ) {
    if (signals.length === 0) {
      return {
        primaryAction: 'hold' as const,
        confidence: 'weak' as const,
        urgency: 'patient' as const,
        reasoning: '沒有足夠的策略信號支持明確行動',
        alternatives: ['等待更清晰的市場信號', '關注技術指標變化'],
        warnings: ['避免盲目操作', '保持耐心等待']
      };
    }

    const topSignal = signals[0];
    const signalSummary = SignalFormatter.generateSignalSummary(signals);
    
    // 綜合技術分析和規則分析的建議
    const technicalAction = technicalAnalysis.finalRecommendation.primaryAction;
    const ruleAction = signalSummary.overallAction;
    
    let primaryAction = topSignal.primary.action;
    let confidence = ruleScoring.confidence;
    
    // 如果技術分析和規則分析一致，提高信心度
    if (technicalAction === ruleAction) {
      if (confidence === 'moderate') confidence = 'strong';
      if (confidence === 'weak') confidence = 'moderate';
    }
    
    const urgency = topSignal.primary.urgency;
    const reasoning = `${topSignal.strategy.name}策略信號(${topSignal.primary.strength}%)與${ruleScoring.recommendation}一致`;
    
    const alternatives = signals.slice(1, 3).map(s => 
      `${s.strategy.name}: ${s.primary.strength}%`
    );
    
    const warnings = [
      ...signalSummary.warnings,
      ...technicalAnalysis.finalRecommendation.riskWarnings
    ].slice(0, 3); // 最多顯示3個警告
    
    return {
      primaryAction,
      confidence,
      urgency,
      reasoning,
      alternatives,
      warnings
    };
  }

  /**
   * 計算風險管理參數
   */
  private static calculateRiskManagement(
    signals: StandardizedSignal[],
    currentPrice?: number
  ) {
    if (signals.length === 0) {
      return {
        recommendedPosition: 0,
        maxRisk: 0,
        timeframe: '短期'
      };
    }

    const topSignal = signals[0];
    const guidance = topSignal.guidance;
    
    // 根據信號強度調整倉位
    const strengthMultiplier = topSignal.primary.strength / 100;
    const adjustedPosition = guidance.positionSize * strengthMultiplier;
    
    return {
      recommendedPosition: Math.min(adjustedPosition, guidance.positionSize),
      stopLoss: guidance.stopLoss,
      takeProfit: guidance.takeProfit,
      maxRisk: guidance.maxRisk,
      timeframe: topSignal.strategy.timeframe
    };
  }

  /**
   * 評估數據質量
   */
  private static assessDataQuality(data: StockAnalysisDTO): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;
    let maxScore = 0;

    // 檢查RSI
    if (data.rsi?.[14] !== undefined) {
      score += 2;
      if (data.rsi[14] > 0 && data.rsi[14] < 100) score += 1;
    }
    maxScore += 3;

    // 檢查MACD
    if (data.macd?.dif !== undefined && data.macd?.dea !== undefined) {
      score += 2;
      if (data.macd.histogram !== undefined) score += 1;
    }
    maxScore += 3;

    // 檢查MA
    if (data.ma?.[20] !== undefined) {
      score += 2;
      if (data.ma[5] !== undefined) score += 1;
    }
    maxScore += 3;

    // 檢查KDJ
    if (data.kdj?.k !== undefined && data.kdj?.d !== undefined) {
      score += 1;
      if (data.kdj.j !== undefined) score += 1;
    }
    maxScore += 2;

    const percentage = score / maxScore;
    
    if (percentage >= 0.9) return 'excellent';
    if (percentage >= 0.7) return 'good';
    if (percentage >= 0.5) return 'fair';
    return 'poor';
  }
}

// ==================== 導出主要接口 ====================

/**
 * 主要策略分析接口 - 供React組件使用
 */
export const analyzeStrategy = async (
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  options?: {
    riskPreference?: 'conservative' | 'moderate' | 'aggressive';
    timeframe?: 'short' | 'medium' | 'long';
    minConfidence?: 'weak' | 'moderate' | 'strong';
  }
): Promise<IntegratedAnalysis> => {
  return StrategyIntegrator.performCompleteAnalysis(data, symbol, currentPrice, options);
};

/**
 * 快速策略分析接口
 */
export const quickAnalyze = (
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number
) => {
  return StrategyIntegrator.quickAnalysis(data, symbol, currentPrice);
};

/**
 * 多symbol比較接口
 */
export const compareStrategies = (
  analyses: Array<{ symbol: string; data: StockAnalysisDTO; price?: number }>
) => {
  return StrategyIntegrator.compareStrategies(analyses);
};