/**
 * 策略建議系統總控制器 - Phase 3.3 最終整合
 * Strategy System Master Controller - Complete Integration of All Phase 3 Components
 */

import type { StockAnalysisDTO } from './dto';
import type { StrategyAnalysis, IndicatorJudgment, StrategySignal } from './strategyEngine';
import type { StandardizedSignal } from './strategySignalFormatter';
import type { DetailedScoringResult } from './enhancedStrategyScoring';
import type { IntelligentAdvice } from './intelligentAdviceEngine';
import type { RiskAssessmentResult } from './enhancedRiskAlert';
import type { EnhancedSignalAnalysis } from './strategySignalIntegrator';

// 導入核心引擎
import { StrategyEngine } from './strategyEngine';
import { RuleEngine, StrategyScorer } from './strategyRuleEngine';
import { SignalFormatter, SignalFilter } from './strategySignalFormatter';
import { EnhancedScoringEngine } from './enhancedStrategyScoring';
import { IntelligentAdviceEngine } from './intelligentAdviceEngine';
import { EnhancedRiskMonitor } from './enhancedRiskAlert';
import { performEnhancedStrategyAnalysis } from './strategySignalIntegrator';

// ==================== 系統配置 ====================

export interface SystemConfiguration {
  // 分析配置
  analysis: {
    enableAdvancedScoring: boolean;
    enableRiskMonitoring: boolean;
    enableIntelligentAdvice: boolean;
    confidenceThreshold: number; // 0-100
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  };
  
  // 策略配置
  strategies: {
    enabledTypes: ('momentum' | 'mean_reversion' | 'breakout')[];
    minimumSignalStrength: number;
    maximumSignalCount: number;
    conflictResolution: 'strength_based' | 'risk_adjusted' | 'diversified';
  };
  
  // 風險配置
  risk: {
    maxPositionSize: number; // 0-1
    maxDrawdown: number;
    stopLossLevel: number;
    enableRealTimeAlerts: boolean;
    alertSeverityThreshold: 'low' | 'medium' | 'high';
  };
  
  // 用戶偏好
  preferences: {
    timeHorizon: 'short' | 'medium' | 'long';
    tradingStyle: 'conservative' | 'balanced' | 'aggressive';
    riskAppetite: 'risk_averse' | 'risk_neutral' | 'risk_seeking';
  };
}

const DEFAULT_CONFIG: SystemConfiguration = {
  analysis: {
    enableAdvancedScoring: true,
    enableRiskMonitoring: true,
    enableIntelligentAdvice: true,
    confidenceThreshold: 60,
    riskTolerance: 'moderate'
  },
  strategies: {
    enabledTypes: ['momentum', 'mean_reversion', 'breakout'],
    minimumSignalStrength: 50,
    maximumSignalCount: 10,
    conflictResolution: 'strength_based'
  },
  risk: {
    maxPositionSize: 0.3,
    maxDrawdown: 0.15,
    stopLossLevel: 0.08,
    enableRealTimeAlerts: true,
    alertSeverityThreshold: 'medium'
  },
  preferences: {
    timeHorizon: 'medium',
    tradingStyle: 'balanced',
    riskAppetite: 'risk_neutral'
  }
};

// ==================== 完整分析結果 ====================

export interface ComprehensiveAnalysisResult {
  // 基本信息
  metadata: {
    symbol: string;
    timestamp: Date;
    analysisVersion: string;
    processingTime: number; // 毫秒
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // 核心分析結果
  technicalAnalysis: StrategyAnalysis;
  enhancedScoring: DetailedScoringResult;
  signalIntegration: EnhancedSignalAnalysis;
  riskAssessment: RiskAssessmentResult;
  intelligentAdvice: IntelligentAdvice;
  
  // 綜合評估
  overallAssessment: {
    recommendationLevel: 'strong_recommend' | 'recommend' | 'neutral' | 'caution' | 'avoid';
    confidenceScore: number; // 0-100
    riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'extreme';
    timelineAssessment: string;
    keyFactors: string[];
  };
  
  // 執行指導
  executionGuidance: {
    priorityActions: Array<{
      action: string;
      timeline: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      reason: string;
    }>;
    
    checkpoints: Array<{
      date: string;
      milestone: string;
      criteria: string[];
      actions: string[];
    }>;
    
    contingencies: Array<{
      scenario: string;
      probability: number;
      impact: string;
      response: string;
    }>;
  };
  
  // 監控方案
  monitoringPlan: {
    dailyChecks: string[];
    weeklyReviews: string[];
    monthlyAssessments: string[];
    alertTriggers: string[];
  };
}

// ==================== 策略系統主控制器 ====================

export class StrategySystemController {
  private config: SystemConfiguration;
  private performanceMetrics: {
    analysisCount: number;
    averageProcessingTime: number;
    successRate: number;
    lastAnalysis: Date | null;
  };
  
  constructor(config?: Partial<SystemConfiguration>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.performanceMetrics = {
      analysisCount: 0,
      averageProcessingTime: 0,
      successRate: 1.0,
      lastAnalysis: null
    };
  }
  
  /**
   * 執行完整的策略分析
   */
  async performComprehensiveAnalysis(
    data: StockAnalysisDTO,
    symbol: string,
    currentPrice?: number,
    portfolioContext?: any
  ): Promise<ComprehensiveAnalysisResult> {
    const startTime = performance.now();
    
    try {
      // 1. 基礎技術分析
      const technicalAnalysis = StrategyEngine.performCompleteAnalysis(data, symbol);
      
      // 2. 規則引擎分析
      const ruleResults = RuleEngine.evaluateAllRules(data, currentPrice);
      const standardizedSignals = SignalFormatter.formatMultipleSignals(ruleResults, symbol, currentPrice);
      
      // 3. 信號過濾和優化
      const filteredSignals = this.filterSignals(standardizedSignals);
      
      // 4. 增強型評分
      const enhancedScoring = this.config.analysis.enableAdvancedScoring ? 
        EnhancedScoringEngine.performDetailedScoring(
          filteredSignals,
          technicalAnalysis.indicatorJudgments,
          this.determineMarketCondition(technicalAnalysis),
          currentPrice
        ) : this.createBasicScoring(filteredSignals);
      
      // 5. 信號整合分析
      const signalIntegration = performEnhancedStrategyAnalysis(
        filteredSignals,
        technicalAnalysis.indicatorJudgments,
        this.determineMarketCondition(technicalAnalysis),
        symbol,
        currentPrice
      );
      
      // 6. 風險評估
      const riskAssessment = this.config.analysis.enableRiskMonitoring ?
        EnhancedRiskMonitor.assessRisk(
          filteredSignals,
          technicalAnalysis.indicatorJudgments,
          enhancedScoring,
          this.determineMarketCondition(technicalAnalysis),
          portfolioContext
        ) : this.createBasicRiskAssessment();
      
      // 7. 智能建議生成
      const intelligentAdvice = this.config.analysis.enableIntelligentAdvice ?
        IntelligentAdviceEngine.generateAdvice(
          filteredSignals,
          technicalAnalysis.indicatorJudgments,
          enhancedScoring,
          this.determineMarketCondition(technicalAnalysis),
          currentPrice,
          portfolioContext
        ) : this.createBasicAdvice();
      
      // 8. 綜合評估
      const overallAssessment = this.generateOverallAssessment(
        enhancedScoring,
        riskAssessment,
        signalIntegration
      );
      
      // 9. 執行指導
      const executionGuidance = this.generateExecutionGuidance(
        intelligentAdvice,
        riskAssessment,
        overallAssessment
      );
      
      // 10. 監控方案
      const monitoringPlan = this.generateMonitoringPlan(
        filteredSignals,
        riskAssessment,
        intelligentAdvice
      );
      
      const processingTime = performance.now() - startTime;
      
      // 更新性能指標
      this.updatePerformanceMetrics(processingTime, true);
      
      return {
        metadata: {
          symbol,
          timestamp: new Date(),
          analysisVersion: '3.3.0',
          processingTime,
          dataQuality: this.assessDataQuality(data)
        },
        technicalAnalysis,
        enhancedScoring,
        signalIntegration,
        riskAssessment,
        intelligentAdvice,
        overallAssessment,
        executionGuidance,
        monitoringPlan
      };
      
    } catch (error) {
      this.updatePerformanceMetrics(performance.now() - startTime, false);
      throw new Error(`策略分析執行失敗: ${error}`);
    }
  }
  
  /**
   * 快速分析模式
   */
  performQuickAnalysis(
    data: StockAnalysisDTO,
    symbol: string,
    currentPrice?: number
  ): {
    action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasoning: string;
    keyPoints: string[];
  } {
    // 基礎技術分析
    const technicalAnalysis = StrategyEngine.performCompleteAnalysis(data, symbol);
    const overallStrength = technicalAnalysis.overallStrength;
    const overallSignal = technicalAnalysis.overallSignal;
    
    // 簡化的行動建議
    let action: any = 'hold';
    if (overallSignal === 'bullish') {
      action = overallStrength >= 80 ? 'strong_buy' : 'buy';
    } else if (overallSignal === 'bearish') {
      action = overallStrength >= 80 ? 'strong_sell' : 'sell';
    }
    
    // 風險等級評估
    const riskLevel = overallStrength >= 70 ? 'low' : overallStrength >= 50 ? 'medium' : 'high';
    
    // 推理說明
    const reasoning = this.generateQuickReasoning(technicalAnalysis);
    
    // 關鍵要點
    const keyPoints = this.extractKeyPoints(technicalAnalysis);
    
    return {
      action,
      confidence: Math.round(overallStrength),
      riskLevel,
      reasoning,
      keyPoints
    };
  }
  
  /**
   * 更新系統配置
   */
  updateConfiguration(updates: Partial<SystemConfiguration>): void {
    this.config = this.mergeConfigurations(this.config, updates);
  }
  
  /**
   * 獲取系統性能統計
   */
  getPerformanceStats(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  /**
   * 重置性能統計
   */
  resetPerformanceStats(): void {
    this.performanceMetrics = {
      analysisCount: 0,
      averageProcessingTime: 0,
      successRate: 1.0,
      lastAnalysis: null
    };
  }
  
  // ==================== 私有方法 ====================
  
  private filterSignals(signals: StandardizedSignal[]): StandardizedSignal[] {
    let filtered = signals;
    
    // 按強度過濾
    filtered = filtered.filter(s => s.primary.strength >= this.config.strategies.minimumSignalStrength);
    
    // 按啟用的策略類型過濾
    filtered = filtered.filter(s => 
      this.config.strategies.enabledTypes.includes(s.strategy.type as any)
    );
    
    // 限制信號數量
    filtered = filtered
      .sort((a, b) => b.primary.strength - a.primary.strength)
      .slice(0, this.config.strategies.maximumSignalCount);
    
    // 衝突解決
    filtered = SignalFilter.removeConflictingSignals(filtered);
    
    return filtered;
  }
  
  private determineMarketCondition(analysis: StrategyAnalysis): string {
    const { overallSignal, overallStrength } = analysis;
    
    if (overallStrength >= 75) {
      return overallSignal === 'bullish' ? '強勢上漲趨勢' : '強勢下跌趨勢';
    } else if (overallStrength >= 55) {
      return overallSignal === 'bullish' ? '溫和上漲趨勢' : '溫和下跌趨勢';
    } else {
      return '震盪整理';
    }
  }
  
  private createBasicScoring(signals: StandardizedSignal[]): DetailedScoringResult {
    const avgStrength = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length : 0;
    
    return {
      overallScore: Math.round(avgStrength),
      confidence: avgStrength >= 70 ? 'high' : avgStrength >= 50 ? 'medium' : 'low',
      grade: avgStrength >= 85 ? 'A' : avgStrength >= 70 ? 'B' : 'C',
      componentScores: {
        signalStrength: avgStrength,
        signalConsistency: 70,
        indicatorAlignment: 60,
        riskAdjustment: 65,
        timingOptimality: 60,
        marketConditionFit: 55,
        volumeConfirmation: 50,
        historicalAccuracy: 60
      },
      analysis: {
        strengths: ['信號基礎分析'],
        weaknesses: [],
        recommendations: ['繼續監控'],
        keyInsights: ['基礎評分模式']
      },
      riskMetrics: {
        expectedReturn: 0.08,
        maxDrawdown: 0.12,
        sharpeRatio: 0.6,
        winRate: 0.65,
        riskRewardRatio: 2.0
      },
      actionGuidance: {
        recommendedAction: 'hold',
        confidence: Math.round(avgStrength),
        positionSizing: 0.2,
        stopLossLevel: 0.95,
        takeProfitLevel: 1.08,
        timeHorizon: '短期'
      }
    } as DetailedScoringResult;
  }
  
  private createBasicRiskAssessment(): RiskAssessmentResult {
    return {
      overallRiskLevel: 'medium',
      riskScore: 50,
      activeAlerts: [],
      riskFactors: {
        technical: [],
        market: [],
        operational: [],
        behavioral: []
      },
      riskMetrics: {
        valueAtRisk: 0.05,
        expectedShortfall: 0.065,
        maxDrawdown: 0.12,
        sharpeRatio: 0.6,
        volatility: 0.15
      },
      recommendations: {
        immediate: ['監控市場變化'],
        shortTerm: ['保持謹慎'],
        strategic: ['建立風險管理制度']
      },
      riskBudget: {
        allocated: 0.05,
        available: 0.10,
        utilization: 33,
        limits: { single_position: 0.05, sector: 0.10, strategy: 0.08 }
      }
    };
  }
  
  private createBasicAdvice(): IntelligentAdvice {
    return {
      primaryAdvice: {
        action: 'hold',
        reasoning: '基於基礎分析的保守建議',
        confidence: 60,
        urgency: 'normal'
      },
      executionPlan: {
        phases: [],
        totalTimeframe: '1-2週',
        contingencyPlans: []
      },
      riskManagement: {
        positionSizing: {
          recommended: 0.2,
          conservative: 0.15,
          aggressive: 0.25,
          reasoning: '保守估算',
          adjustmentTriggers: []
        },
        stopLoss: {
          initial: 8,
          trailing: false,
          adjustmentRules: [],
          emergencyExit: '重大利空時退出'
        },
        takeProfit: {
          targets: [{ level: 8, allocation: 1.0 }],
          strategy: 'all_or_nothing',
          reasoning: '簡單獲利策略'
        },
        riskBudget: {
          maxRisk: 0.08,
          dailyVaR: 0.02,
          maxDrawdown: 0.12
        }
      },
      monitoring: {
        keyIndicators: ['價格', 'RSI', 'MACD'],
        warningSignals: ['技術指標惡化'],
        exitConditions: ['重大利空'],
        reviewSchedule: '每週'
      },
      scenarios: {
        bullCase: {
          probability: 0.3,
          expectedReturn: 0.12,
          timeframe: '1-2個月',
          keyEvents: ['技術突破'],
          actions: ['保持倉位']
        },
        baseCase: {
          probability: 0.5,
          expectedReturn: 0.05,
          timeframe: '1-3個月',
          keyEvents: ['平穩發展'],
          actions: ['按計劃執行']
        },
        bearCase: {
          probability: 0.2,
          expectedReturn: -0.08,
          timeframe: '2-6週',
          keyEvents: ['市場調整'],
          actions: ['及時止損']
        }
      }
    };
  }
  
  private generateOverallAssessment(
    scoring: DetailedScoringResult,
    risk: RiskAssessmentResult,
    integration: EnhancedSignalAnalysis
  ): ComprehensiveAnalysisResult['overallAssessment'] {
    
    // 確定推薦等級
    let recommendationLevel: any = 'neutral';
    if (scoring.overallScore >= 85 && risk.overallRiskLevel === 'low') {
      recommendationLevel = 'strong_recommend';
    } else if (scoring.overallScore >= 70 && risk.overallRiskLevel !== 'high') {
      recommendationLevel = 'recommend';
    } else if (risk.overallRiskLevel === 'high' || risk.overallRiskLevel === 'extreme') {
      recommendationLevel = scoring.overallScore >= 60 ? 'caution' : 'avoid';
    }
    
    return {
      recommendationLevel,
      confidenceScore: Math.round((scoring.overallScore + (100 - risk.riskScore)) / 2),
      riskLevel: risk.overallRiskLevel,
      timelineAssessment: this.generateTimelineAssessment(scoring, integration),
      keyFactors: this.extractKeyFactors(scoring, risk, integration)
    };
  }
  
  private generateExecutionGuidance(
    advice: IntelligentAdvice,
    risk: RiskAssessmentResult,
    assessment: ComprehensiveAnalysisResult['overallAssessment']
  ): ComprehensiveAnalysisResult['executionGuidance'] {
    
    const priorityActions = [
      {
        action: advice.primaryAdvice.action === 'hold' ? '保持當前倉位' : 
                advice.primaryAdvice.action.includes('buy') ? '考慮建倉' : '考慮減倉',
        timeline: advice.primaryAdvice.urgency === 'immediate' ? '立即' : '1-3個交易日',
        importance: assessment.recommendationLevel === 'strong_recommend' ? 'critical' as const : 'medium' as const,
        reason: advice.primaryAdvice.reasoning
      }
    ];
    
    return {
      priorityActions,
      checkpoints: this.generateCheckpoints(advice),
      contingencies: advice.executionPlan.contingencyPlans.map(cp => ({
        scenario: cp.scenario,
        probability: 0.3, // 簡化
        impact: '中等',
        response: cp.response
      }))
    };
  }
  
  private generateMonitoringPlan(
    signals: StandardizedSignal[],
    risk: RiskAssessmentResult,
    advice: IntelligentAdvice
  ): ComprehensiveAnalysisResult['monitoringPlan'] {
    
    return {
      dailyChecks: [
        '檢查價格變動',
        '監控關鍵技術位',
        '觀察成交量變化'
      ],
      weeklyReviews: [
        '檢視策略表現',
        '評估風險指標',
        '調整倉位配置'
      ],
      monthlyAssessments: [
        '全面策略回顧',
        '風險管理檢討',
        '投資組合優化'
      ],
      alertTriggers: risk.activeAlerts.map(alert => alert.message.title)
    };
  }
  
  private generateQuickReasoning(analysis: StrategyAnalysis): string {
    const { overallSignal, overallStrength } = analysis;
    const strongIndicators = analysis.indicatorJudgments.filter(i => i.confidence === 'strong').length;
    
    return `基於技術分析，當前信號${overallSignal === 'bullish' ? '偏向看漲' : overallSignal === 'bearish' ? '偏向看跌' : '中性'}，` +
           `整體強度${Math.round(overallStrength)}%，${strongIndicators}個強勢指標支持該判斷。`;
  }
  
  private extractKeyPoints(analysis: StrategyAnalysis): string[] {
    const points: string[] = [];
    
    analysis.indicatorJudgments.forEach(indicator => {
      if (indicator.confidence === 'strong') {
        points.push(`${indicator.indicator}: ${indicator.message}`);
      }
    });
    
    if (points.length === 0) {
      points.push('技術指標總體呈中性態勢');
    }
    
    return points.slice(0, 3); // 最多3個要點
  }
  
  private assessDataQuality(data: StockAnalysisDTO): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;
    let maxScore = 0;
    
    // 檢查各項指標數據完整性
    if (data.rsi?.[14] !== undefined) score += 25, maxScore += 25;
    if (data.macd?.dif !== undefined && data.macd?.dea !== undefined) score += 25, maxScore += 25;
    if (data.ma?.[20] !== undefined) score += 25, maxScore += 25;
    if (data.kdj?.k !== undefined) score += 25, maxScore += 25;
    
    const percentage = score / maxScore;
    if (percentage >= 0.9) return 'excellent';
    if (percentage >= 0.7) return 'good';
    if (percentage >= 0.5) return 'fair';
    return 'poor';
  }
  
  private updatePerformanceMetrics(processingTime: number, success: boolean): void {
    this.performanceMetrics.analysisCount++;
    
    // 更新平均處理時間
    const currentAvg = this.performanceMetrics.averageProcessingTime;
    const count = this.performanceMetrics.analysisCount;
    this.performanceMetrics.averageProcessingTime = 
      (currentAvg * (count - 1) + processingTime) / count;
    
    // 更新成功率
    const currentSuccessRate = this.performanceMetrics.successRate;
    this.performanceMetrics.successRate = 
      (currentSuccessRate * (count - 1) + (success ? 1 : 0)) / count;
    
    this.performanceMetrics.lastAnalysis = new Date();
  }
  
  private mergeConfigurations(
    base: SystemConfiguration, 
    updates: Partial<SystemConfiguration>
  ): SystemConfiguration {
    return {
      analysis: { ...base.analysis, ...updates.analysis },
      strategies: { ...base.strategies, ...updates.strategies },
      risk: { ...base.risk, ...updates.risk },
      preferences: { ...base.preferences, ...updates.preferences }
    };
  }
  
  private generateTimelineAssessment(
    scoring: DetailedScoringResult,
    integration: EnhancedSignalAnalysis
  ): string {
    const timeHorizon = integration.timingAnalysis.timeHorizon;
    const confidence = scoring.confidence;
    
    return `在${timeHorizon}的時間框架內，${confidence === 'high' ? '高' : confidence === 'medium' ? '中等' : '低'}信心度的分析結果`;
  }
  
  private extractKeyFactors(
    scoring: DetailedScoringResult,
    risk: RiskAssessmentResult,
    integration: EnhancedSignalAnalysis
  ): string[] {
    const factors: string[] = [];
    
    // 來自評分分析的關鍵因素
    if (scoring.analysis.strengths.length > 0) {
      factors.push(...scoring.analysis.strengths.slice(0, 2));
    }
    
    // 來自風險評估的關鍵因素
    if (risk.activeAlerts.length > 0) {
      factors.push(risk.activeAlerts[0].message.title);
    }
    
    // 來自信號整合的關鍵因素
    if (integration.signalStats.conflictingSignals) {
      factors.push('存在策略信號衝突');
    }
    
    return factors.slice(0, 5); // 最多5個關鍵因素
  }
  
  private generateCheckpoints(advice: IntelligentAdvice): Array<{
    date: string;
    milestone: string;
    criteria: string[];
    actions: string[];
  }> {
    const checkpoints: any[] = [];
    
    // 基於執行計劃生成檢查點
    advice.executionPlan.phases.forEach((phase, index) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (index + 1) * 3); // 每3天一個檢查點
      
      checkpoints.push({
        date: futureDate.toISOString().split('T')[0],
        milestone: `階段${phase.phase}檢查`,
        criteria: phase.conditions,
        actions: [phase.action]
      });
    });
    
    return checkpoints;
  }
}

// ==================== 全局實例和便捷方法 ====================

// 創建全局系統實例
export const globalStrategySystem = new StrategySystemController();

/**
 * 便捷的完整分析方法
 */
export const analyzeStock = async (
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number,
  config?: Partial<SystemConfiguration>
): Promise<ComprehensiveAnalysisResult> => {
  if (config) {
    globalStrategySystem.updateConfiguration(config);
  }
  
  return globalStrategySystem.performComprehensiveAnalysis(data, symbol, currentPrice);
};

/**
 * 便捷的快速分析方法
 */
export const quickAnalyzeStock = (
  data: StockAnalysisDTO,
  symbol: string,
  currentPrice?: number
) => {
  return globalStrategySystem.performQuickAnalysis(data, symbol, currentPrice);
};