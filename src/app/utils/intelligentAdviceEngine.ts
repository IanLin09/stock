/**
 * 智能操作建議生成引擎 - Phase 3.3
 * Intelligent Trading Advice Generation Engine
 */

import type { StrategySignal, IndicatorJudgment } from './strategyEngine';
import type { StandardizedSignal } from './strategySignalFormatter';
import type { DetailedScoringResult } from './enhancedStrategyScoring';
import { STRATEGY_CONFIGS, RISK_MANAGEMENT } from './constants/strategies';

// ==================== 智能建議結果類型 ====================

export interface IntelligentAdvice {
  // 核心建議
  primaryAdvice: {
    action: 'strong_buy' | 'buy' | 'accumulate' | 'hold' | 'reduce' | 'sell' | 'strong_sell';
    reasoning: string;
    confidence: number; // 0-100
    urgency: 'immediate' | 'soon' | 'normal' | 'patient' | 'wait';
  };
  
  // 操作計劃
  executionPlan: {
    phases: OperationPhase[];
    totalTimeframe: string;
    contingencyPlans: ContingencyPlan[];
  };
  
  // 風險管理
  riskManagement: {
    positionSizing: PositionSizingAdvice;
    stopLoss: StopLossAdvice;
    takeProfit: TakeProfitAdvice;
    riskBudget: RiskBudgetAdvice;
  };
  
  // 市場監控
  monitoring: {
    keyIndicators: string[];
    warningSignals: string[];
    exitConditions: string[];
    reviewSchedule: string;
  };
  
  // 情境分析
  scenarios: {
    bullCase: ScenarioAnalysis;
    baseCase: ScenarioAnalysis;
    bearCase: ScenarioAnalysis;
  };
}

interface OperationPhase {
  phase: number;
  action: string;
  timing: string;
  allocation: number; // 佔總倉位比例
  conditions: string[];
  keyLevels: {
    entry?: number;
    exit?: number;
    stop?: number;
  };
}

interface ContingencyPlan {
  scenario: string;
  triggers: string[];
  response: string;
  adjustments: string[];
}

interface PositionSizingAdvice {
  recommended: number; // 0-1
  conservative: number;
  aggressive: number;
  reasoning: string;
  adjustmentTriggers: string[];
}

interface StopLossAdvice {
  initial: number; // 百分比
  trailing: boolean;
  adjustmentRules: string[];
  emergencyExit: string;
}

interface TakeProfitAdvice {
  targets: Array<{ level: number; allocation: number }>;
  strategy: 'scale_out' | 'all_or_nothing' | 'trailing';
  reasoning: string;
}

interface RiskBudgetAdvice {
  maxRisk: number; // 佔投資組合百分比
  dailyVaR: number; // 日風險價值
  maxDrawdown: number;
  correlationWarning?: string;
}

interface ScenarioAnalysis {
  probability: number; // 0-1
  expectedReturn: number;
  timeframe: string;
  keyEvents: string[];
  actions: string[];
}

// ==================== 智能建議生成引擎 ====================

export class IntelligentAdviceEngine {
  
  /**
   * 生成完整的智能投資建議
   */
  static generateAdvice(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    scoringResult: DetailedScoringResult,
    marketCondition: string,
    currentPrice?: number,
    portfolioContext?: {
      totalValue: number;
      currentPositions: any[];
      riskTolerance: 'conservative' | 'moderate' | 'aggressive';
      timeHorizon: 'short' | 'medium' | 'long';
    }
  ): IntelligentAdvice {
    
    // 1. 生成核心建議
    const primaryAdvice = this.generatePrimaryAdvice(signals, scoringResult, marketCondition);
    
    // 2. 制定執行計劃
    const executionPlan = this.createExecutionPlan(signals, primaryAdvice, currentPrice);
    
    // 3. 風險管理建議
    const riskManagement = this.generateRiskManagement(
      signals,
      scoringResult,
      portfolioContext,
      currentPrice
    );
    
    // 4. 監控方案
    const monitoring = this.createMonitoringPlan(signals, indicators, primaryAdvice);
    
    // 5. 情境分析
    const scenarios = this.generateScenarios(signals, scoringResult, marketCondition);
    
    return {
      primaryAdvice,
      executionPlan,
      riskManagement,
      monitoring,
      scenarios
    };
  }
  
  // ==================== 核心建議生成 ====================
  
  private static generatePrimaryAdvice(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    marketCondition: string
  ): IntelligentAdvice['primaryAdvice'] {
    
    const { overallScore, confidence, actionGuidance } = scoringResult;
    
    // 基於評分結果優化行動
    let action = actionGuidance.recommendedAction;
    
    // 根據市場環境調整
    if (marketCondition.includes('高波動') && action.includes('buy')) {
      action = 'accumulate'; // 高波動時建議分批建倉
    }
    
    // 生成推理邏輯
    const reasoning = this.generateAdviceReasoning(signals, scoringResult, marketCondition);
    
    // 確定緊急度
    const urgency = this.determineActionUrgency(signals, overallScore, confidence);
    
    return {
      action: action as any,
      reasoning,
      confidence: actionGuidance.confidence,
      urgency
    };
  }
  
  private static generateAdviceReasoning(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    marketCondition: string
  ): string {
    const { overallScore, analysis } = scoringResult;
    
    let reasoning = `基於${signals.length}個策略信號的綜合分析，`;
    reasoning += `整體評分${overallScore}分（${scoringResult.grade}級）。`;
    
    if (analysis.strengths.length > 0) {
      reasoning += ` 主要優勢：${analysis.strengths[0]}。`;
    }
    
    if (analysis.keyInsights.length > 0) {
      reasoning += ` ${analysis.keyInsights[0]}。`;
    }
    
    reasoning += ` 在${marketCondition}的市場環境下，該策略組合具有較好的適應性。`;
    
    return reasoning;
  }
  
  private static determineActionUrgency(
    signals: StandardizedSignal[],
    overallScore: number,
    confidence: string
  ): 'immediate' | 'soon' | 'normal' | 'patient' | 'wait' {
    
    const immediateSignals = signals.filter(s => s.primary.urgency === 'immediate').length;
    const strongSignals = signals.filter(s => s.primary.confidence === 'strong').length;
    
    if (overallScore >= 85 && confidence === 'very_high' && immediateSignals >= 2) {
      return 'immediate';
    }
    
    if (overallScore >= 75 && strongSignals >= 2) {
      return 'soon';
    }
    
    if (overallScore >= 60) {
      return 'normal';
    }
    
    if (overallScore >= 40) {
      return 'patient';
    }
    
    return 'wait';
  }
  
  // ==================== 執行計劃制定 ====================
  
  private static createExecutionPlan(
    signals: StandardizedSignal[],
    primaryAdvice: IntelligentAdvice['primaryAdvice'],
    currentPrice?: number
  ): IntelligentAdvice['executionPlan'] {
    
    const phases = this.createOperationPhases(primaryAdvice, signals, currentPrice);
    const totalTimeframe = this.calculateTotalTimeframe(phases);
    const contingencyPlans = this.createContingencyPlans(primaryAdvice, signals);
    
    return {
      phases,
      totalTimeframe,
      contingencyPlans
    };
  }
  
  private static createOperationPhases(
    primaryAdvice: IntelligentAdvice['primaryAdvice'],
    signals: StandardizedSignal[],
    currentPrice?: number
  ): OperationPhase[] {
    const phases: OperationPhase[] = [];
    
    if (primaryAdvice.action.includes('buy') || primaryAdvice.action === 'accumulate') {
      // 買入計劃
      phases.push({
        phase: 1,
        action: '初始建倉',
        timing: primaryAdvice.urgency === 'immediate' ? '立即執行' : '1-2個交易日內',
        allocation: 0.4, // 首批40%
        conditions: ['確認支撐位有效', '成交量配合'],
        keyLevels: {
          entry: currentPrice,
          stop: currentPrice ? currentPrice * 0.95 : undefined
        }
      });
      
      phases.push({
        phase: 2,
        action: '加倉操作',
        timing: '3-5個交易日內',
        allocation: 0.4, // 再加40%
        conditions: ['突破確認', '技術指標持續看漲'],
        keyLevels: {
          entry: currentPrice ? currentPrice * 1.02 : undefined
        }
      });
      
      phases.push({
        phase: 3,
        action: '最後加倉',
        timing: '視市況而定',
        allocation: 0.2, // 最後20%
        conditions: ['趨勢強勁', '無重大利空'],
        keyLevels: {}
      });
      
    } else if (primaryAdvice.action.includes('sell') || primaryAdvice.action === 'reduce') {
      // 賣出計劃
      phases.push({
        phase: 1,
        action: '部分減倉',
        timing: '1-2個交易日內',
        allocation: -0.5, // 減持50%
        conditions: ['確認阻力位', '避免恐慌性拋售'],
        keyLevels: {
          exit: currentPrice ? currentPrice * 0.98 : undefined
        }
      });
      
      phases.push({
        phase: 2,
        action: '繼續減倉',
        timing: '3-7個交易日內',
        allocation: -0.3, // 再減30%
        conditions: ['趨勢確認向下', '反彈無力'],
        keyLevels: {}
      });
    }
    
    return phases;
  }
  
  private static calculateTotalTimeframe(phases: OperationPhase[]): string {
    if (phases.length === 0) return '即時';
    
    const maxDays = phases.reduce((max, phase) => {
      const days = this.extractDaysFromTiming(phase.timing);
      return Math.max(max, days);
    }, 0);
    
    if (maxDays <= 1) return '1個交易日';
    if (maxDays <= 7) return `${maxDays}個交易日`;
    if (maxDays <= 30) return `${Math.ceil(maxDays / 7)}週`;
    return `${Math.ceil(maxDays / 30)}個月`;
  }
  
  private static extractDaysFromTiming(timing: string): number {
    if (timing.includes('立即')) return 0;
    if (timing.includes('1-2')) return 2;
    if (timing.includes('3-5')) return 5;
    if (timing.includes('3-7')) return 7;
    return 1;
  }
  
  private static createContingencyPlans(
    primaryAdvice: IntelligentAdvice['primaryAdvice'],
    signals: StandardizedSignal[]
  ): ContingencyPlan[] {
    const plans: ContingencyPlan[] = [];
    
    // 止損計劃
    plans.push({
      scenario: '快速下跌',
      triggers: ['跌破關鍵支撐', '成交量暴增', '技術指標轉空'],
      response: '立即止損',
      adjustments: ['全倉清空', '等待反彈確認', '重新評估策略']
    });
    
    // 獲利計劃
    plans.push({
      scenario: '達到目標位',
      triggers: ['達到預期收益', '技術指標超買', '成交量萎縮'],
      response: '分批獲利了結',
      adjustments: ['保留核心倉位', '上調止損位', '關注回調機會']
    });
    
    // 橫盤計劃
    plans.push({
      scenario: '長期橫盤',
      triggers: ['技術指標鈍化', '成交量持續萎縮', '缺乏催化劑'],
      response: '調整策略',
      adjustments: ['降低倉位', '等待突破', '考慮其他標的']
    });
    
    return plans;
  }
  
  // ==================== 風險管理建議 ====================
  
  private static generateRiskManagement(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    portfolioContext?: any,
    currentPrice?: number
  ): IntelligentAdvice['riskManagement'] {
    
    const positionSizing = this.generatePositionSizingAdvice(signals, scoringResult, portfolioContext);
    const stopLoss = this.generateStopLossAdvice(signals, currentPrice);
    const takeProfit = this.generateTakeProfitAdvice(signals, currentPrice);
    const riskBudget = this.generateRiskBudgetAdvice(scoringResult, portfolioContext);
    
    return {
      positionSizing,
      stopLoss,
      takeProfit,
      riskBudget
    };
  }
  
  private static generatePositionSizingAdvice(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    portfolioContext?: any
  ): PositionSizingAdvice {
    
    const baseSize = scoringResult.actionGuidance.positionSizing;
    const riskTolerance = portfolioContext?.riskTolerance || 'moderate';
    
    // 根據風險偏好調整
    const adjustments = {
      conservative: 0.7,
      moderate: 1.0,
      aggressive: 1.3
    };
    
    const recommended = Math.min(0.5, baseSize * adjustments[riskTolerance]);
    const conservative = recommended * 0.7;
    const aggressive = Math.min(0.8, recommended * 1.4);
    
    return {
      recommended,
      conservative,
      aggressive,
      reasoning: `基於${scoringResult.confidence}信心等級和${riskTolerance}風險偏好`,
      adjustmentTriggers: [
        '信號強度顯著變化時調整倉位',
        '市場波動率變化時重新評估',
        '投資組合風險超標時減倉'
      ]
    };
  }
  
  private static generateStopLossAdvice(
    signals: StandardizedSignal[],
    currentPrice?: number
  ): StopLossAdvice {
    
    // 根據策略類型確定止損水平
    const strategyTypes = signals.map(s => s.strategy.type);
    const stopLossLevels = strategyTypes.map(type => 
      RISK_MANAGEMENT.stop_loss[type]?.percentage || 0.08
    );
    
    const averageStopLoss = stopLossLevels.reduce((sum, level) => sum + level, 0) / stopLossLevels.length;
    const initial = Math.round(averageStopLoss * 100);
    
    return {
      initial,
      trailing: signals.some(s => s.strategy.name.includes('動量')), // 動量策略使用追蹤止損
      adjustmentRules: [
        '價格上漲超過5%時上調止損位',
        '技術指標轉空時收緊止損',
        '成交量異常時考慮提前止損'
      ],
      emergencyExit: '單日跌幅超過8%或跌破關鍵支撐位時無條件止損'
    };
  }
  
  private static generateTakeProfitAdvice(
    signals: StandardizedSignal[],
    currentPrice?: number
  ): TakeProfitAdvice {
    
    const targets = [
      { level: 8, allocation: 0.3 },   // 8%時賣出30%
      { level: 15, allocation: 0.4 },  // 15%時再賣出40%
      { level: 25, allocation: 0.3 }   // 25%時賣出剩餘30%
    ];
    
    return {
      targets,
      strategy: 'scale_out',
      reasoning: '分批獲利可以平衡風險和收益，避免過早或過晚離場'
    };
  }
  
  private static generateRiskBudgetAdvice(
    scoringResult: DetailedScoringResult,
    portfolioContext?: any
  ): RiskBudgetAdvice {
    
    const maxRisk = scoringResult.riskMetrics.maxDrawdown * 100;
    const dailyVaR = maxRisk / 20; // 簡化計算
    
    return {
      maxRisk,
      dailyVaR,
      maxDrawdown: scoringResult.riskMetrics.maxDrawdown,
      correlationWarning: portfolioContext?.currentPositions?.length > 5 ? 
        '注意與現有持倉的相關性，避免集中風險' : undefined
    };
  }
  
  // ==================== 監控方案 ====================
  
  private static createMonitoringPlan(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    primaryAdvice: IntelligentAdvice['primaryAdvice']
  ): IntelligentAdvice['monitoring'] {
    
    const keyIndicators = this.identifyKeyIndicators(signals, indicators);
    const warningSignals = this.identifyWarningSignals(primaryAdvice);
    const exitConditions = this.identifyExitConditions(signals, primaryAdvice);
    const reviewSchedule = this.createReviewSchedule(primaryAdvice);
    
    return {
      keyIndicators,
      warningSignals,
      exitConditions,
      reviewSchedule
    };
  }
  
  private static identifyKeyIndicators(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[]
  ): string[] {
    const keyIndicators = ['價格走勢', '成交量變化'];
    
    // 根據策略類型添加關鍵指標
    const strategyTypes = signals.map(s => s.strategy.type);
    
    if (strategyTypes.includes('momentum')) {
      keyIndicators.push('MACD走勢', 'RSI動量');
    }
    
    if (strategyTypes.includes('mean_reversion')) {
      keyIndicators.push('RSI極值', 'KDJ背離');
    }
    
    if (strategyTypes.includes('breakout')) {
      keyIndicators.push('關鍵阻力支撐', '突破有效性');
    }
    
    return keyIndicators;
  }
  
  private static identifyWarningSignals(primaryAdvice: IntelligentAdvice['primaryAdvice']): string[] {
    const baseWarnings = [
      '成交量異常萎縮或暴增',
      '技術指標出現背離',
      '市場情緒極端變化'
    ];
    
    if (primaryAdvice.action.includes('buy')) {
      baseWarnings.push('跌破關鍵支撐位', '多頭排列被破壞');
    } else if (primaryAdvice.action.includes('sell')) {
      baseWarnings.push('突破關鍵阻力位', '空頭排列被破壞');
    }
    
    return baseWarnings;
  }
  
  private static identifyExitConditions(
    signals: StandardizedSignal[],
    primaryAdvice: IntelligentAdvice['primaryAdvice']
  ): string[] {
    return [
      '達到預設的止損或止盈位',
      '策略基礎假設發生根本改變',
      '技術形態完全破壞',
      '市場系統性風險爆發',
      '個股基本面出現重大利空'
    ];
  }
  
  private static createReviewSchedule(primaryAdvice: IntelligentAdvice['primaryAdvice']): string {
    switch (primaryAdvice.urgency) {
      case 'immediate':
        return '每日收盤後檢視，必要時盤中調整';
      case 'soon':
        return '每2-3個交易日檢視一次';
      case 'normal':
        return '每週檢視一次，重大變化時額外檢視';
      case 'patient':
        return '每兩週檢視一次';
      default:
        return '每月檢視一次';
    }
  }
  
  // ==================== 情境分析 ====================
  
  private static generateScenarios(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    marketCondition: string
  ): IntelligentAdvice['scenarios'] {
    
    const baseReturn = scoringResult.riskMetrics.expectedReturn;
    
    const bullCase: ScenarioAnalysis = {
      probability: 0.3,
      expectedReturn: baseReturn * 1.5,
      timeframe: '1-2個月',
      keyEvents: ['技術突破確認', '基本面改善', '市場情緒轉好'],
      actions: ['保持滿倉', '適時加倉', '上調止盈目標']
    };
    
    const baseCase: ScenarioAnalysis = {
      probability: 0.5,
      expectedReturn: baseReturn,
      timeframe: '2-3個月',
      keyEvents: ['按預期發展', '技術指標配合', '無重大利空'],
      actions: ['按計劃執行', '定期檢視調整', '嚴格風控']
    };
    
    const bearCase: ScenarioAnalysis = {
      probability: 0.2,
      expectedReturn: -baseReturn * 0.8,
      timeframe: '1-6週',
      keyEvents: ['技術破位', '基本面惡化', '市場系統性風險'],
      actions: ['及時止損', '重新評估', '避險操作']
    };
    
    return { bullCase, baseCase, bearCase };
  }
}