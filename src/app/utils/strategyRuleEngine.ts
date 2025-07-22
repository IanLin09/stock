/**
 * 策略規則解析器
 * Strategy Rule Engine - 核心規則匹配和條件解析系統
 */

import type { StockAnalysisDTO } from './dto';
import type { IndicatorSignal, StrategySignal, ConfidenceLevel, RiskLevel } from './strategyEngine';

// ==================== 規則條件類型 ====================

export interface StrategyRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: 'buy' | 'sell' | 'hold' | 'reduce';
  weight: number; // 權重 0-1
  riskLevel: RiskLevel;
  expectedReturn: number; // 預期收益率
  maxDrawdown: number; // 最大回撤
}

export interface RuleCondition {
  indicator: 'RSI' | 'MACD' | 'MA' | 'KDJ' | 'price' | 'volume';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between' | 'cross_above' | 'cross_below';
  value: number | number[] | string;
  period?: number; // 週期參數
  weight: number; // 條件權重
  required: boolean; // 是否為必要條件
}

export interface RuleMatchResult {
  ruleId: string;
  matched: boolean;
  score: number; // 匹配得分 0-100
  confidence: ConfidenceLevel;
  matchedConditions: string[];
  failedConditions: string[];
  recommendation: string;
}

// ==================== 預定義策略規則庫 ====================

export const STRATEGY_RULES: StrategyRule[] = [
  // 動量策略規則
  {
    id: 'momentum_strong_buy',
    name: '強勢動量買入',
    description: 'RSI適中+MACD金叉+價格突破',
    conditions: [
      { indicator: 'RSI', operator: 'between', value: [40, 70], weight: 0.25, required: true },
      { indicator: 'MACD', operator: '>', value: 0, weight: 0.35, required: true }, // DIF > DEA
      { indicator: 'MA', operator: 'cross_above', value: 20, weight: 0.4, required: true }
    ],
    action: 'buy',
    weight: 0.8,
    riskLevel: 'medium',
    expectedReturn: 0.15,
    maxDrawdown: 0.08
  },
  {
    id: 'momentum_trend_follow',
    name: '趨勢跟踪',
    description: 'MACD持續看漲+價格在均線上方',
    conditions: [
      { indicator: 'MACD', operator: '>', value: 0, weight: 0.4, required: true },
      { indicator: 'MA', operator: '>', value: 0.02, period: 20, weight: 0.3, required: true }, // 價格高於MA20 2%
      { indicator: 'RSI', operator: '<', value: 75, weight: 0.3, required: false }
    ],
    action: 'buy',
    weight: 0.6,
    riskLevel: 'medium',
    expectedReturn: 0.12,
    maxDrawdown: 0.1
  },

  // 均值回歸策略規則
  {
    id: 'mean_reversion_oversold',
    name: '超賣反彈',
    description: 'RSI極度超賣+KDJ底部金叉',
    conditions: [
      { indicator: 'RSI', operator: '<=', value: 25, weight: 0.5, required: true },
      { indicator: 'KDJ', operator: '<=', value: 20, weight: 0.3, required: true },
      { indicator: 'MACD', operator: '>', value: -0.5, weight: 0.2, required: false } // 避免強勢下跌
    ],
    action: 'buy',
    weight: 0.9,
    riskLevel: 'low',
    expectedReturn: 0.08,
    maxDrawdown: 0.05
  },
  {
    id: 'mean_reversion_overbought',
    name: '超買回調',
    description: 'RSI極度超買+價格偏離均線過大',
    conditions: [
      { indicator: 'RSI', operator: '>=', value: 75, weight: 0.4, required: true },
      { indicator: 'MA', operator: '>', value: 0.05, period: 20, weight: 0.4, required: true }, // 偏離MA20超過5%
      { indicator: 'KDJ', operator: '>=', value: 80, weight: 0.2, required: false }
    ],
    action: 'sell',
    weight: 0.7,
    riskLevel: 'medium',
    expectedReturn: 0.06,
    maxDrawdown: 0.08
  },

  // 突破策略規則
  {
    id: 'breakout_volume_surge',
    name: '放量突破',
    description: 'MACD強勢金叉+突破關鍵阻力',
    conditions: [
      { indicator: 'MACD', operator: '>', value: 0.3, weight: 0.4, required: true }, // 強勢金叉
      { indicator: 'RSI', operator: 'between', value: [50, 75], weight: 0.3, required: true },
      { indicator: 'MA', operator: '>', value: 0.03, period: 20, weight: 0.3, required: true }
    ],
    action: 'buy',
    weight: 0.8,
    riskLevel: 'high',
    expectedReturn: 0.25,
    maxDrawdown: 0.15
  },
  {
    id: 'breakout_breakdown',
    name: '跌破支撐',
    description: 'MACD死叉+跌破關鍵支撐',
    conditions: [
      { indicator: 'MACD', operator: '<', value: -0.2, weight: 0.4, required: true },
      { indicator: 'MA', operator: '<', value: -0.03, period: 20, weight: 0.35, required: true },
      { indicator: 'RSI', operator: '<', value: 45, weight: 0.25, required: false }
    ],
    action: 'sell',
    weight: 0.75,
    riskLevel: 'high',
    expectedReturn: 0.2,
    maxDrawdown: 0.2
  },

  // 保守策略規則
  {
    id: 'conservative_hold',
    name: '保守持有',
    description: '指標中性，建議持有觀望',
    conditions: [
      { indicator: 'RSI', operator: 'between', value: [35, 65], weight: 0.4, required: false },
      { indicator: 'MACD', operator: 'between', value: [-0.1, 0.1], weight: 0.4, required: false },
      { indicator: 'MA', operator: 'between', value: [-0.02, 0.02], period: 20, weight: 0.2, required: false }
    ],
    action: 'hold',
    weight: 0.3,
    riskLevel: 'low',
    expectedReturn: 0.03,
    maxDrawdown: 0.03
  }
];

// ==================== 條件匹配引擎 ====================

export class RuleEngine {
  /**
   * 評估單個條件是否滿足
   */
  static evaluateCondition(condition: RuleCondition, data: StockAnalysisDTO, currentPrice?: number): boolean {
    const { indicator, operator, value, period } = condition;

    let actualValue: number | undefined;

    // 獲取指標實際值
    switch (indicator) {
      case 'RSI':
        actualValue = data.rsi?.[period || 14];
        break;
      case 'MACD':
        if (operator === '>' || operator === '<' || operator === '>=' || operator === '<=') {
          // 比較histogram值
          actualValue = data.macd?.histogram;
        }
        break;
      case 'MA':
        if (currentPrice && data.ma?.[period || 20]) {
          // 計算價格與MA的偏離程度
          const ma = data.ma[period || 20];
          actualValue = (currentPrice - ma) / ma;
        }
        break;
      case 'KDJ':
        // 使用KDJ的平均值
        if (data.kdj) {
          actualValue = (data.kdj.k + data.kdj.d + data.kdj.j) / 3;
        }
        break;
      case 'price':
        actualValue = currentPrice;
        break;
      case 'volume':
        // 這裡需要成交量數據，暫時跳過
        return false;
    }

    if (actualValue === undefined) return false;

    // 執行比較操作
    switch (operator) {
      case '>':
        return actualValue > (value as number);
      case '<':
        return actualValue < (value as number);
      case '>=':
        return actualValue >= (value as number);
      case '<=':
        return actualValue <= (value as number);
      case '==':
        return Math.abs(actualValue - (value as number)) < 0.001;
      case '!=':
        return Math.abs(actualValue - (value as number)) >= 0.001;
      case 'between':
        const [min, max] = value as number[];
        return actualValue >= min && actualValue <= max;
      case 'cross_above':
      case 'cross_below':
        // 穿越條件需要歷史數據，暫時簡化處理
        return operator === 'cross_above' ? actualValue > (value as number) : actualValue < (value as number);
      default:
        return false;
    }
  }

  /**
   * 評估策略規則匹配度
   */
  static evaluateRule(rule: StrategyRule, data: StockAnalysisDTO, currentPrice?: number): RuleMatchResult {
    const matchedConditions: string[] = [];
    const failedConditions: string[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    let requiredMet = true;

    // 評估每個條件
    for (const condition of rule.conditions) {
      const isMatched = this.evaluateCondition(condition, data, currentPrice);
      const conditionDesc = this.formatConditionDescription(condition);

      if (isMatched) {
        matchedConditions.push(conditionDesc);
        totalScore += condition.weight * 100;
      } else {
        failedConditions.push(conditionDesc);
        if (condition.required) {
          requiredMet = false;
        }
      }
      totalWeight += condition.weight;
    }

    // 計算最終得分
    const score = totalWeight > 0 ? totalScore / totalWeight : 0;
    const matched = requiredMet && score >= 60; // 至少60%條件滿足

    // 確定信心水平
    let confidence: ConfidenceLevel;
    if (score >= 80 && requiredMet) {
      confidence = 'strong';
    } else if (score >= 60 && requiredMet) {
      confidence = 'moderate';
    } else {
      confidence = 'weak';
    }

    // 生成建議
    const recommendation = this.generateRecommendation(rule, matched, score, confidence);

    return {
      ruleId: rule.id,
      matched,
      score: Math.round(score),
      confidence,
      matchedConditions,
      failedConditions,
      recommendation
    };
  }

  /**
   * 評估所有策略規則
   */
  static evaluateAllRules(data: StockAnalysisDTO, currentPrice?: number): RuleMatchResult[] {
    return STRATEGY_RULES.map(rule => this.evaluateRule(rule, data, currentPrice));
  }

  /**
   * 獲取最佳匹配的策略
   */
  static getBestStrategy(data: StockAnalysisDTO, currentPrice?: number): RuleMatchResult | null {
    const results = this.evaluateAllRules(data, currentPrice);
    const matchedResults = results.filter(r => r.matched);

    if (matchedResults.length === 0) return null;

    // 按得分排序，返回最高分的策略
    return matchedResults.sort((a, b) => b.score - a.score)[0];
  }

  /**
   * 格式化條件描述
   */
  private static formatConditionDescription(condition: RuleCondition): string {
    const { indicator, operator, value, period } = condition;

    const indicatorName = {
      RSI: 'RSI',
      MACD: 'MACD',
      MA: `MA${period || 20}`,
      KDJ: 'KDJ',
      price: '價格',
      volume: '成交量'
    }[indicator];

    const operatorDesc = {
      '>': '大於',
      '<': '小於',
      '>=': '大於等於',
      '<=': '小於等於',
      '==': '等於',
      '!=': '不等於',
      'between': '介於',
      'cross_above': '突破',
      'cross_below': '跌破'
    }[operator];

    if (operator === 'between') {
      const [min, max] = value as number[];
      return `${indicatorName} ${operatorDesc} ${min}-${max}`;
    }

    return `${indicatorName} ${operatorDesc} ${value}`;
  }

  /**
   * 生成策略建議
   */
  private static generateRecommendation(
    rule: StrategyRule,
    matched: boolean,
    score: number,
    confidence: ConfidenceLevel
  ): string {
    if (!matched) {
      return `${rule.name}策略條件不滿足，建議觀望`;
    }

    const confidenceDesc = {
      strong: '強烈',
      moderate: '適度',
      weak: '謹慎'
    }[confidence];

    const actionDesc = {
      buy: '買入',
      sell: '賣出',
      hold: '持有',
      reduce: '減倉'
    }[rule.action];

    const riskDesc = {
      low: '低風險',
      medium: '中等風險',
      high: '高風險'
    }[rule.riskLevel];

    return `${confidenceDesc}建議${actionDesc} (${riskDesc}, 預期收益${(rule.expectedReturn * 100).toFixed(1)}%)`;
  }
}

// ==================== 策略評分系統 ====================

export class StrategyScorer {
  /**
   * 綜合評分算法
   */
  static calculateOverallScore(results: RuleMatchResult[]): {
    score: number;
    confidence: ConfidenceLevel;
    recommendation: string;
    topStrategies: RuleMatchResult[];
  } {
    const matchedResults = results.filter(r => r.matched);
    
    if (matchedResults.length === 0) {
      return {
        score: 0,
        confidence: 'weak',
        recommendation: '沒有明確策略信號，建議觀望',
        topStrategies: []
      };
    }

    // 計算加權平均分
    const totalWeight = matchedResults.reduce((sum, r) => {
      const rule = STRATEGY_RULES.find(rule => rule.id === r.ruleId);
      return sum + (rule?.weight || 0);
    }, 0);

    const weightedScore = matchedResults.reduce((sum, r) => {
      const rule = STRATEGY_RULES.find(rule => rule.id === r.ruleId);
      const weight = rule?.weight || 0;
      return sum + (r.score * weight);
    }, 0);

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    // 確定信心水平
    let confidence: ConfidenceLevel;
    const strongCount = matchedResults.filter(r => r.confidence === 'strong').length;
    
    if (strongCount >= 2 && overallScore >= 75) {
      confidence = 'strong';
    } else if (strongCount >= 1 && overallScore >= 60) {
      confidence = 'moderate';
    } else {
      confidence = 'weak';
    }

    // 選取前3個最佳策略
    const topStrategies = matchedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 生成綜合建議
    const primaryStrategy = topStrategies[0];
    const primaryRule = STRATEGY_RULES.find(r => r.id === primaryStrategy.ruleId);
    
    let recommendation = `主要建議: ${primaryRule?.name || '未知策略'}`;
    if (topStrategies.length > 1) {
      recommendation += `，備選策略: ${topStrategies.slice(1).map(s => {
        const rule = STRATEGY_RULES.find(r => r.id === s.ruleId);
        return rule?.name || '未知';
      }).join('、')}`;
    }

    return {
      score: Math.round(overallScore),
      confidence,
      recommendation,
      topStrategies
    };
  }

  /**
   * 風險評估
   */
  static assessRisk(results: RuleMatchResult[]): {
    overallRisk: RiskLevel;
    riskFactors: string[];
    suggestions: string[];
  } {
    const matchedResults = results.filter(r => r.matched);
    const riskLevels = matchedResults.map(r => {
      const rule = STRATEGY_RULES.find(rule => rule.id === r.ruleId);
      return rule?.riskLevel || 'low';
    });

    // 計算總體風險水平
    const highRiskCount = riskLevels.filter(r => r === 'high').length;
    const mediumRiskCount = riskLevels.filter(r => r === 'medium').length;

    let overallRisk: RiskLevel;
    if (highRiskCount > 0) {
      overallRisk = 'high';
    } else if (mediumRiskCount > 0) {
      overallRisk = 'medium';
    } else {
      overallRisk = 'low';
    }

    // 識別風險因素
    const riskFactors: string[] = [];
    const suggestions: string[] = [];

    if (highRiskCount > 0) {
      riskFactors.push('包含高風險策略');
      suggestions.push('建議降低倉位規模');
      suggestions.push('設置較緊的止損');
    }

    if (matchedResults.length > 3) {
      riskFactors.push('策略信號過多，可能存在衝突');
      suggestions.push('選擇信心度最高的1-2個策略');
    }

    const weakSignals = matchedResults.filter(r => r.confidence === 'weak').length;
    if (weakSignals > matchedResults.length / 2) {
      riskFactors.push('多數策略信心度較低');
      suggestions.push('等待更明確的信號');
    }

    return {
      overallRisk,
      riskFactors,
      suggestions
    };
  }
}