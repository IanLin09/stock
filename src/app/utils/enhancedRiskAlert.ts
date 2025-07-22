/**
 * 增強型風險提示機制 - Phase 3.3
 * Enhanced Risk Alert System with Advanced Warning Capabilities
 */

import type { StrategySignal, IndicatorJudgment } from './strategyEngine';
import type { StandardizedSignal } from './strategySignalFormatter';
import type { DetailedScoringResult } from './enhancedStrategyScoring';

// ==================== 風險警報類型 ====================

export interface RiskAlert {
  id: string;
  type: 'warning' | 'caution' | 'critical' | 'info';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  category: 'technical' | 'fundamental' | 'market' | 'operational' | 'behavioral';
  
  message: {
    title: string;
    description: string;
    details: string[];
    recommendation: string;
  };
  
  triggers: {
    conditions: string[];
    threshold: number;
    timeframe: string;
  };
  
  impact: {
    probability: number; // 0-1
    potentialLoss: number; // 百分比
    timeToMaterialize: string;
    affectedStrategies: string[];
  };
  
  mitigation: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    alternatives: string[];
  };
  
  monitoring: {
    keyMetrics: string[];
    reviewFrequency: string;
    escalationTriggers: string[];
  };
  
  timestamp: Date;
  acknowledged: boolean;
}

// ==================== 風險評估結果 ====================

export interface RiskAssessmentResult {
  overallRiskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number; // 0-100
  
  activeAlerts: RiskAlert[];
  riskFactors: {
    technical: RiskFactor[];
    market: RiskFactor[];
    operational: RiskFactor[];
    behavioral: RiskFactor[];
  };
  
  riskMetrics: {
    valueAtRisk: number; // VaR at 95%
    expectedShortfall: number; // ES at 95%
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
  };
  
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    strategic: string[];
  };
  
  riskBudget: {
    allocated: number;
    available: number;
    utilization: number; // 百分比
    limits: Record<string, number>;
  };
}

interface RiskFactor {
  name: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  description: string;
  mitigationStatus: 'none' | 'partial' | 'full';
}

// ==================== 增強型風險監控引擎 ====================

export class EnhancedRiskMonitor {
  
  /**
   * 執行完整的風險評估
   */
  static assessRisk(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    scoringResult: DetailedScoringResult,
    marketCondition: string,
    portfolioContext?: {
      totalValue: number;
      currentPositions: any[];
      riskTolerance: 'conservative' | 'moderate' | 'aggressive';
      stopLossLevels: Record<string, number>;
    }
  ): RiskAssessmentResult {
    
    // 1. 生成風險警報
    const activeAlerts = this.generateRiskAlerts(signals, indicators, scoringResult, marketCondition);
    
    // 2. 識別風險因素
    const riskFactors = this.identifyRiskFactors(signals, indicators, marketCondition);
    
    // 3. 計算風險指標
    const riskMetrics = this.calculateRiskMetrics(signals, scoringResult, portfolioContext);
    
    // 4. 確定整體風險等級
    const { overallRiskLevel, riskScore } = this.determineOverallRisk(
      activeAlerts, 
      riskFactors, 
      riskMetrics
    );
    
    // 5. 生成建議
    const recommendations = this.generateRiskRecommendations(
      activeAlerts, 
      riskFactors, 
      overallRiskLevel
    );
    
    // 6. 計算風險預算
    const riskBudget = this.calculateRiskBudget(riskMetrics, portfolioContext);
    
    return {
      overallRiskLevel,
      riskScore,
      activeAlerts,
      riskFactors,
      riskMetrics,
      recommendations,
      riskBudget
    };
  }
  
  // ==================== 風險警報生成 ====================
  
  private static generateRiskAlerts(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    scoringResult: DetailedScoringResult,
    marketCondition: string
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    // 1. 技術風險警報
    alerts.push(...this.generateTechnicalAlerts(signals, indicators));
    
    // 2. 市場風險警報
    alerts.push(...this.generateMarketAlerts(marketCondition, scoringResult));
    
    // 3. 操作風險警報
    alerts.push(...this.generateOperationalAlerts(signals, scoringResult));
    
    // 4. 行為風險警報
    alerts.push(...this.generateBehavioralAlerts(signals, scoringResult));
    
    return alerts.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity));
  }
  
  private static generateTechnicalAlerts(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[]
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    // 檢查技術指標背離
    const rsiIndicator = indicators.find(i => i.indicator === 'RSI');
    const macdIndicator = indicators.find(i => i.indicator === 'MACD');
    
    if (rsiIndicator && macdIndicator) {
      const rsiSignal = rsiIndicator.signal;
      const macdSignal = macdIndicator.signal;
      
      if ((rsiSignal === 'bullish' && macdSignal === 'bearish') || 
          (rsiSignal === 'bearish' && macdSignal === 'bullish')) {
        alerts.push({
          id: `tech_divergence_${Date.now()}`,
          type: 'warning',
          severity: 'medium',
          category: 'technical',
          message: {
            title: '技術指標背離警告',
            description: 'RSI和MACD指標出現方向性分歧',
            details: [
              `RSI信號: ${this.translateSignal(rsiSignal)}`,
              `MACD信號: ${this.translateSignal(macdSignal)}`,
              '背離可能預示趨勢即將反轉'
            ],
            recommendation: '密切關注價格走勢，準備調整策略'
          },
          triggers: {
            conditions: ['RSI與MACD方向相反', '持續超過3個交易日'],
            threshold: 0.7,
            timeframe: '3-5個交易日'
          },
          impact: {
            probability: 0.6,
            potentialLoss: 8,
            timeToMaterialize: '1-2週',
            affectedStrategies: ['動量策略', '趨勢跟踪']
          },
          mitigation: {
            immediate: ['減少新建倉位', '緊密監控關鍵位'],
            shortTerm: ['考慮部分止盈', '調整止損位'],
            longTerm: ['重新評估策略有效性'],
            alternatives: ['轉向均值回歸策略', '增加對沖倉位']
          },
          monitoring: {
            keyMetrics: ['RSI走勢', 'MACD histogram', '價格支撐阻力'],
            reviewFrequency: '每日',
            escalationTriggers: ['背離持續擴大', '價格跌破關鍵位']
          },
          timestamp: new Date(),
          acknowledged: false
        });
      }
    }
    
    // 檢查極端超買超賣
    if (rsiIndicator && rsiIndicator.signal === 'extreme') {
      const isOverbought = rsiIndicator.strength > 80;
      alerts.push({
        id: `extreme_rsi_${Date.now()}`,
        type: 'caution',
        severity: isOverbought ? 'high' : 'medium',
        category: 'technical',
        message: {
          title: isOverbought ? 'RSI極度超買警告' : 'RSI極度超賣提醒',
          description: `RSI達到${Math.round(rsiIndicator.strength)}，處於極端區域`,
          details: [
            isOverbought ? ' 可能面臨回調壓力' : '可能出現反彈機會',
            '極端讀數通常不可持續',
            '需要成交量確認才能判斷反轉'
          ],
          recommendation: isOverbought ? '考慮獲利了結或減倉' : '等待確認信號後適量建倉'
        },
        triggers: {
          conditions: [`RSI ${isOverbought ? '> 80' : '< 20'}`],
          threshold: 0.8,
          timeframe: '1-3個交易日'
        },
        impact: {
          probability: 0.7,
          potentialLoss: isOverbought ? 12 : 8,
          timeToMaterialize: '3-7個交易日',
          affectedStrategies: isOverbought ? ['動量策略'] : ['均值回歸策略']
        },
        mitigation: {
          immediate: isOverbought ? ['部分獲利了結', '上調止損'] : ['小倉位試探', '等待確認'],
          shortTerm: ['密切監控成交量', '關注技術形態'],
          longTerm: ['評估長期趨勢完整性'],
          alternatives: ['轉向防守策略', '增加現金比重']
        },
        monitoring: {
          keyMetrics: ['RSI日變化', '成交量', '價格關鍵位'],
          reviewFrequency: '每日',
          escalationTriggers: ['RSI進一步極端', '成交量異常']
        },
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    return alerts;
  }
  
  private static generateMarketAlerts(
    marketCondition: string,
    scoringResult: DetailedScoringResult
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    // 高波動市場警告
    if (marketCondition.includes('高波動') || marketCondition.includes('劇烈')) {
      alerts.push({
        id: `market_volatility_${Date.now()}`,
        type: 'warning',
        severity: 'high',
        category: 'market',
        message: {
          title: '市場高波動警告',
          description: '當前市場處於高波動狀態',
          details: [
            '價格波動明顯增大',
            '方向性不確定性增加',
            '風險事件可能頻發',
            '流動性可能受到影響'
          ],
          recommendation: '降低倉位規模，提高現金比重，嚴格執行風險管理'
        },
        triggers: {
          conditions: ['日波動率 > 3%', '市場情緒極端'],
          threshold: 0.8,
          timeframe: '持續期間'
        },
        impact: {
          probability: 0.8,
          potentialLoss: 20,
          timeToMaterialize: '隨時',
          affectedStrategies: ['所有策略']
        },
        mitigation: {
          immediate: ['減倉至50%以下', '緊密監控止損'],
          shortTerm: ['避免新增倉位', '保持充足現金'],
          longTerm: ['等待波動率回歸正常'],
          alternatives: ['考慮對沖策略', '分散至其他資產']
        },
        monitoring: {
          keyMetrics: ['VIX指數', '市場寬度', '成交量'],
          reviewFrequency: '實時',
          escalationTriggers: ['波動率繼續上升', '系統性風險事件']
        },
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    return alerts;
  }
  
  private static generateOperationalAlerts(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    // 策略過度集中警告
    const strategyTypes = signals.map(s => s.strategy.type);
    const typeDistribution = strategyTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxConcentration = Math.max(...Object.values(typeDistribution)) / signals.length;
    
    if (maxConcentration > 0.7 && signals.length >= 3) {
      const dominantType = Object.entries(typeDistribution)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      alerts.push({
        id: `strategy_concentration_${Date.now()}`,
        type: 'caution',
        severity: 'medium',
        category: 'operational',
        message: {
          title: '策略集中度過高',
          description: `${Math.round(maxConcentration * 100)}%的信號來自${dominantType}策略`,
          details: [
            '策略過度集中可能增加風險',
            '單一策略失效將嚴重影響表現',
            '缺乏足夠的策略分散'
          ],
          recommendation: '考慮增加其他類型策略的權重，提高策略多樣性'
        },
        triggers: {
          conditions: ['單一策略類型佔比 > 70%'],
          threshold: 0.7,
          timeframe: '當前'
        },
        impact: {
          probability: 0.5,
          potentialLoss: 15,
          timeToMaterialize: '市場環境變化時',
          affectedStrategies: [dominantType]
        },
        mitigation: {
          immediate: ['評估其他策略可行性'],
          shortTerm: ['逐步增加策略多樣性'],
          longTerm: ['建立平衡的策略組合'],
          alternatives: ['引入對沖策略', '增加被動投資']
        },
        monitoring: {
          keyMetrics: ['策略分布', '相關性係數'],
          reviewFrequency: '每週',
          escalationTriggers: ['主要策略開始失效']
        },
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    return alerts;
  }
  
  private static generateBehavioralAlerts(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    // 過度自信警告
    if (scoringResult.overallScore > 85 && scoringResult.confidence === 'very_high') {
      alerts.push({
        id: `overconfidence_${Date.now()}`,
        type: 'info',
        severity: 'low',
        category: 'behavioral',
        message: {
          title: '過度自信風險提醒',
          description: '當前策略評分和信心度都很高，請注意避免過度自信',
          details: [
            '高分不等於未來一定成功',
            '市場總是充滿不確定性',
            '過度自信可能導致風險管理放鬆'
          ],
          recommendation: '保持謙遜，嚴格執行既定的風險管理原則'
        },
        triggers: {
          conditions: ['策略評分 > 85', '信心度 = very_high'],
          threshold: 0.85,
          timeframe: '當前'
        },
        impact: {
          probability: 0.3,
          potentialLoss: 10,
          timeToMaterialize: '逐漸積累',
          affectedStrategies: ['所有策略']
        },
        mitigation: {
          immediate: ['重新檢視風險管理'],
          shortTerm: ['保持謹慎態度'],
          longTerm: ['建立系統性風控流程'],
          alternatives: ['尋求第三方意見', '增加反向思考']
        },
        monitoring: {
          keyMetrics: ['決策質量', '風險控制執行'],
          reviewFrequency: '定期自省',
          escalationTriggers: ['開始忽略風險信號']
        },
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    return alerts;
  }
  
  // ==================== 風險因素識別 ====================
  
  private static identifyRiskFactors(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[],
    marketCondition: string
  ): RiskAssessmentResult['riskFactors'] {
    
    return {
      technical: this.identifyTechnicalRiskFactors(signals, indicators),
      market: this.identifyMarketRiskFactors(marketCondition),
      operational: this.identifyOperationalRiskFactors(signals),
      behavioral: this.identifyBehavioralRiskFactors(signals)
    };
  }
  
  private static identifyTechnicalRiskFactors(
    signals: StandardizedSignal[],
    indicators: IndicatorJudgment[]
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // 技術指標衝突
    const signalDirections = signals.map(s => s.primary.action);
    const hasConflict = signalDirections.includes('buy') && signalDirections.includes('sell');
    
    if (hasConflict) {
      factors.push({
        name: '技術信號衝突',
        impact: 'medium',
        likelihood: 'high',
        description: '買入和賣出信號同時存在，方向不明確',
        mitigationStatus: 'none'
      });
    }
    
    // 趨勢疲弱
    const avgStrength = signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length;
    if (avgStrength < 60) {
      factors.push({
        name: '信號強度偏弱',
        impact: 'medium',
        likelihood: 'medium',
        description: '技術信號平均強度不足，可靠性有限',
        mitigationStatus: 'partial'
      });
    }
    
    return factors;
  }
  
  private static identifyMarketRiskFactors(marketCondition: string): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    if (marketCondition.includes('震盪')) {
      factors.push({
        name: '市場震盪',
        impact: 'medium',
        likelihood: 'high',
        description: '市場缺乏明確方向，容易出現假突破',
        mitigationStatus: 'partial'
      });
    }
    
    if (marketCondition.includes('高波動')) {
      factors.push({
        name: '高波動環境',
        impact: 'high',
        likelihood: 'high',
        description: '市場波動劇烈，風險和機會並存',
        mitigationStatus: 'none'
      });
    }
    
    return factors;
  }
  
  private static identifyOperationalRiskFactors(signals: StandardizedSignal[]): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // 策略集中度風險
    const strategyTypes = signals.map(s => s.strategy.type);
    const uniqueTypes = new Set(strategyTypes).size;
    
    if (uniqueTypes <= 1 && signals.length >= 2) {
      factors.push({
        name: '策略集中度過高',
        impact: 'high',
        likelihood: 'medium',
        description: '策略類型過於單一，缺乏分散',
        mitigationStatus: 'none'
      });
    }
    
    return factors;
  }
  
  private static identifyBehavioralRiskFactors(signals: StandardizedSignal[]): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // 檢查是否有追漲殺跌傾向
    const buySignals = signals.filter(s => s.primary.action === 'buy');
    const urgentBuySignals = buySignals.filter(s => s.primary.urgency === 'immediate');
    
    if (urgentBuySignals.length > buySignals.length * 0.5) {
      factors.push({
        name: '急躁交易傾向',
        impact: 'medium',
        likelihood: 'medium',
        description: '過多立即執行信號可能反映追漲心理',
        mitigationStatus: 'none'
      });
    }
    
    return factors;
  }
  
  // ==================== 輔助方法 ====================
  
  private static getSeverityScore(severity: string): number {
    const scores = { extreme: 4, high: 3, medium: 2, low: 1 };
    return scores[severity as keyof typeof scores] || 0;
  }
  
  private static translateSignal(signal: string): string {
    const translations = {
      bullish: '看漲',
      bearish: '看跌', 
      neutral: '中性',
      extreme: '極端'
    };
    return translations[signal as keyof typeof translations] || signal;
  }
  
  private static calculateRiskMetrics(
    signals: StandardizedSignal[],
    scoringResult: DetailedScoringResult,
    portfolioContext?: any
  ): RiskAssessmentResult['riskMetrics'] {
    
    const baseVaR = 0.05; // 5% VaR基準
    const riskMultiplier = this.calculateRiskMultiplier(signals);
    
    return {
      valueAtRisk: baseVaR * riskMultiplier,
      expectedShortfall: baseVaR * riskMultiplier * 1.3,
      maxDrawdown: scoringResult.riskMetrics.maxDrawdown,
      sharpeRatio: scoringResult.riskMetrics.sharpeRatio,
      volatility: this.estimateVolatility(signals)
    };
  }
  
  private static calculateRiskMultiplier(signals: StandardizedSignal[]): number {
    const highRiskCount = signals.filter(s => s.strategy.riskLevel === 'high').length;
    const totalSignals = signals.length;
    
    return 1 + (highRiskCount / totalSignals) * 0.5;
  }
  
  private static estimateVolatility(signals: StandardizedSignal[]): number {
    const baseVolatility = 0.15; // 15%基準波動率
    const avgUrgency = signals.filter(s => s.primary.urgency === 'immediate').length / signals.length;
    
    return baseVolatility * (1 + avgUrgency * 0.3);
  }
  
  private static determineOverallRisk(
    alerts: RiskAlert[],
    riskFactors: any,
    riskMetrics: any
  ): { overallRiskLevel: any; riskScore: number } {
    
    // 基於警報計算風險分數
    let riskScore = 0;
    alerts.forEach(alert => {
      const severityScore = this.getSeverityScore(alert.severity);
      riskScore += severityScore * 10;
    });
    
    // 基於風險因素調整
    Object.values(riskFactors).forEach((factors: any) => {
      factors.forEach((factor: any) => {
        if (factor.impact === 'high') riskScore += 15;
        else if (factor.impact === 'medium') riskScore += 10;
        else riskScore += 5;
      });
    });
    
    riskScore = Math.min(100, riskScore);
    
    let overallRiskLevel: any;
    if (riskScore >= 80) overallRiskLevel = 'extreme';
    else if (riskScore >= 60) overallRiskLevel = 'high';
    else if (riskScore >= 40) overallRiskLevel = 'medium';
    else if (riskScore >= 20) overallRiskLevel = 'low';
    else overallRiskLevel = 'very_low';
    
    return { overallRiskLevel, riskScore };
  }
  
  private static generateRiskRecommendations(
    alerts: RiskAlert[],
    riskFactors: any,
    overallRiskLevel: string
  ): RiskAssessmentResult['recommendations'] {
    
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const strategic: string[] = [];
    
    // 基於整體風險等級的建議
    if (overallRiskLevel === 'extreme' || overallRiskLevel === 'high') {
      immediate.push('立即審查所有倉位', '考慮大幅減倉');
      shortTerm.push('重新評估策略有效性', '增加對沖倉位');
      strategic.push('完善風險管理體系', '建立更嚴格的風控標準');
    } else if (overallRiskLevel === 'medium') {
      immediate.push('密切監控風險指標');
      shortTerm.push('適度調整倉位結構');
      strategic.push('優化風險分散策略');
    }
    
    // 基於具體風險因素的建議
    alerts.forEach(alert => {
      if (alert.severity === 'high' || alert.severity === 'extreme') {
        immediate.push(...alert.mitigation.immediate);
      }
    });
    
    return {
      immediate: [...new Set(immediate)].slice(0, 5),
      shortTerm: [...new Set(shortTerm)].slice(0, 5),
      strategic: [...new Set(strategic)].slice(0, 3)
    };
  }
  
  private static calculateRiskBudget(
    riskMetrics: any,
    portfolioContext?: any
  ): RiskAssessmentResult['riskBudget'] {
    
    const totalRiskBudget = 0.15; // 15%總風險預算
    const allocatedRisk = riskMetrics.valueAtRisk;
    const availableRisk = Math.max(0, totalRiskBudget - allocatedRisk);
    const utilization = (allocatedRisk / totalRiskBudget) * 100;
    
    return {
      allocated: allocatedRisk,
      available: availableRisk,
      utilization,
      limits: {
        single_position: 0.05, // 單一倉位風險限制
        sector: 0.10,          // 行業風險限制
        strategy: 0.08         // 單一策略風險限制
      }
    };
  }
}