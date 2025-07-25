/**
 * 策略信號標準化格式器
 * Strategy Signal Formatter - 統一信號格式和展示邏輯
 */

import type { RuleMatchResult, StrategyRule } from './strategyRuleEngine';
import { STRATEGY_RULES } from './strategyRuleEngine';
import type {
  IndicatorJudgment,
  ConfidenceLevel,
  RiskLevel,
} from './strategyEngine';
import { RISK_MANAGEMENT } from './constants/strategies';

// ==================== 標準化信號格式 ====================

export interface StandardizedSignal {
  id: string;
  timestamp: Date;
  symbol: string;

  // 主要信號信息
  primary: {
    action: 'buy' | 'sell' | 'hold' | 'reduce';
    confidence: ConfidenceLevel;
    strength: number; // 0-100
    urgency: 'immediate' | 'normal' | 'patient'; // 執行緊急度
  };

  // 策略詳情
  strategy: {
    name: string;
    type: string;
    description: string;
    riskLevel: RiskLevel;
    expectedReturn: number;
    timeframe: string;
  };

  // 支撐證據
  evidence: {
    matchedConditions: string[];
    supportingIndicators: IndicatorJudgment[];
    conflictingFactors: string[];
  };

  // 操作指導
  guidance: {
    entryPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    positionSize: number; // 建議倉位比例 0-1
    maxRisk: number; // 最大風險敞口
  };

  // 展示格式
  display: {
    title: string;
    subtitle: string;
    color: string;
    icon: string;
    priority: number; // 顯示優先級
  };
}

// ==================== 信號格式化器 ====================

export class SignalFormatter {
  /**
   * 將規則匹配結果轉換為標準化信號
   */
  static formatRuleResult(
    result: RuleMatchResult,
    rule: StrategyRule,
    symbol: string,
    currentPrice?: number
  ): StandardizedSignal {
    const urgency = this.determineUrgency(result, rule);
    const guidance = this.calculateGuidance(rule, currentPrice);
    const display = this.generateDisplay(result, rule);

    return {
      id: `${rule.id}_${Date.now()}`,
      timestamp: new Date(),
      symbol,

      primary: {
        action: rule.action,
        confidence: result.confidence,
        strength: result.score,
        urgency,
      },

      strategy: {
        name: rule.name,
        type: this.getStrategyType(rule.id),
        description: rule.description,
        riskLevel: rule.riskLevel,
        expectedReturn: rule.expectedReturn,
        timeframe: this.getTimeframe(rule.id),
      },

      evidence: {
        matchedConditions: result.matchedConditions,
        supportingIndicators: [], // 需要從其他地方獲取
        conflictingFactors: result.failedConditions,
      },

      guidance,
      display,
    };
  }

  /**
   * 批量格式化多個信號
   */
  static formatMultipleSignals(
    results: RuleMatchResult[],
    symbol: string,
    currentPrice?: number
  ): StandardizedSignal[] {
    return results
      .filter((result) => result.matched)
      .map((result) => {
        const rule = STRATEGY_RULES.find((r) => r.id === result.ruleId);
        if (!rule) return null;
        return this.formatRuleResult(result, rule, symbol, currentPrice);
      })
      .filter((signal): signal is StandardizedSignal => signal !== null)
      .sort((a, b) => b.display.priority - a.display.priority);
  }

  /**
   * 生成綜合信號摘要
   */
  static generateSignalSummary(signals: StandardizedSignal[]): {
    overallAction: 'buy' | 'sell' | 'hold';
    confidence: ConfidenceLevel;
    riskLevel: RiskLevel;
    summary: string;
    keyPoints: string[];
    warnings: string[];
  } {
    if (signals.length === 0) {
      return {
        overallAction: 'hold',
        confidence: 'weak',
        riskLevel: 'low',
        summary: '沒有明確的策略信號，建議保持觀望',
        keyPoints: ['等待更明確的市場方向'],
        warnings: ['避免盲目操作'],
      };
    }

    // 計算主要行動
    const actionCounts = signals.reduce(
      (acc, signal) => {
        acc[signal.primary.action] =
          (acc[signal.primary.action] || 0) + signal.primary.strength;
        return acc;
      },
      {} as Record<string, number>
    );

    const overallAction = Object.entries(actionCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0] as 'buy' | 'sell' | 'hold';

    // 計算綜合信心度
    const avgStrength =
      signals.reduce((sum, s) => sum + s.primary.strength, 0) / signals.length;
    const strongCount = signals.filter(
      (s) => s.primary.confidence === 'strong'
    ).length;

    let confidence: ConfidenceLevel;
    if (strongCount >= 2 && avgStrength >= 75) {
      confidence = 'strong';
    } else if (strongCount >= 1 && avgStrength >= 60) {
      confidence = 'moderate';
    } else {
      confidence = 'weak';
    }

    // 評估風險等級
    const riskLevels = signals.map((s) => s.strategy.riskLevel);
    const highRiskCount = riskLevels.filter((r) => r === 'high').length;
    const riskLevel: RiskLevel =
      highRiskCount > 0
        ? 'high'
        : riskLevels.includes('medium')
          ? 'medium'
          : 'low';

    // 生成摘要
    const topSignal = signals[0];
    const actionText = {
      buy: '買入',
      sell: '賣出',
      hold: '持有',
      reduce: '減倉',
    }[overallAction];

    const summary = `基於${signals.length}個策略信號分析，建議${actionText}。主要策略：${topSignal.strategy.name}`;

    // 提取要點
    const keyPoints = signals
      .slice(0, 3)
      .map((s) => `${s.strategy.name}: ${s.primary.strength}%信心度`);

    // 風險警告
    const warnings: string[] = [];
    if (riskLevel === 'high') {
      warnings.push('包含高風險策略，請控制倉位規模');
    }
    if (signals.some((s) => s.evidence.conflictingFactors.length > 0)) {
      warnings.push('存在衝突指標，需謹慎操作');
    }
    if (confidence === 'weak') {
      warnings.push('信號強度較弱，建議等待確認');
    }

    return {
      overallAction,
      confidence,
      riskLevel,
      summary,
      keyPoints,
      warnings,
    };
  }

  /**
   * 確定執行緊急度
   */
  private static determineUrgency(
    result: RuleMatchResult,
    rule: StrategyRule
  ): 'immediate' | 'normal' | 'patient' {
    // 高分且高置信度 = 立即執行
    if (result.score >= 85 && result.confidence === 'strong') {
      return 'immediate';
    }

    // 中等分數或突破策略 = 正常執行
    if (result.score >= 70 || rule.id.includes('breakout')) {
      return 'normal';
    }

    // 其他情況 = 耐心等待
    return 'patient';
  }

  /**
   * 計算操作指導
   */
  private static calculateGuidance(
    rule: StrategyRule,
    currentPrice?: number
  ): StandardizedSignal['guidance'] {
    const riskMgmt = RISK_MANAGEMENT;
    const riskKey =
      `${rule.riskLevel}_risk` as keyof typeof riskMgmt.position_sizing;
    const positionSize = riskMgmt.position_sizing[riskKey].max_position;
    const stopLossPercent =
      riskMgmt.stop_loss[this.getStrategyTypeFromRule(rule)].percentage;
    const takeProfitPercent =
      riskMgmt.take_profit[this.getStrategyTypeFromRule(rule)].percentage;

    const guidance: StandardizedSignal['guidance'] = {
      positionSize,
      maxRisk: positionSize * stopLossPercent,
    };

    if (currentPrice) {
      guidance.entryPrice = currentPrice;

      if (rule.action === 'buy') {
        guidance.stopLoss = currentPrice * (1 - stopLossPercent);
        guidance.takeProfit = currentPrice * (1 + takeProfitPercent);
      } else if (rule.action === 'sell') {
        guidance.stopLoss = currentPrice * (1 + stopLossPercent);
        guidance.takeProfit = currentPrice * (1 - takeProfitPercent);
      }
    }

    return guidance;
  }

  /**
   * 生成顯示格式
   */
  private static generateDisplay(
    result: RuleMatchResult,
    rule: StrategyRule
  ): StandardizedSignal['display'] {
    const confidence = result.confidence;
    const action = rule.action;

    // 顏色映射
    const colorMap = {
      buy:
        confidence === 'strong'
          ? '#22c55e'
          : confidence === 'moderate'
            ? '#10b981'
            : '#6ee7b7',
      sell:
        confidence === 'strong'
          ? '#ef4444'
          : confidence === 'moderate'
            ? '#f87171'
            : '#fca5a5',
      hold: '#6b7280',
      reduce: '#f59e0b',
    };

    // 圖標映射
    const iconMap = {
      buy: '📈',
      sell: '📉',
      hold: '⏸️',
      reduce: '📊',
    };

    // 優先級計算 (分數 * 置信度權重)
    const confidenceWeight = { strong: 1.2, moderate: 1.0, weak: 0.8 };
    const priority = result.score * confidenceWeight[confidence];

    return {
      title: rule.name,
      subtitle: `${result.score}% 信心度 | ${rule.riskLevel === 'high' ? '高風險' : rule.riskLevel === 'medium' ? '中風險' : '低風險'}`,
      color: colorMap[action],
      icon: iconMap[action],
      priority,
    };
  }

  /**
   * 從規則ID推斷策略類型
   */
  private static getStrategyType(ruleId: string): string {
    if (ruleId.includes('momentum')) return '動量策略';
    if (ruleId.includes('mean_reversion')) return '均值回歸';
    if (ruleId.includes('breakout')) return '突破策略';
    if (ruleId.includes('conservative')) return '保守策略';
    return '其他策略';
  }

  /**
   * 從規則推斷策略類型（用於風險管理）
   */
  private static getStrategyTypeFromRule(
    rule: StrategyRule
  ): 'momentum' | 'mean_reversion' | 'breakout' {
    if (rule.id.includes('momentum')) return 'momentum';
    if (rule.id.includes('mean_reversion')) return 'mean_reversion';
    if (rule.id.includes('breakout')) return 'breakout';
    return 'momentum'; // 默認
  }

  /**
   * 獲取時間框架
   */
  private static getTimeframe(ruleId: string): string {
    if (ruleId.includes('breakout')) return '中期(3-10日)';
    if (ruleId.includes('mean_reversion')) return '短期(2-7日)';
    return '短期(1-5日)';
  }
}

// ==================== 信號篩選器 ====================

export class SignalFilter {
  /**
   * 根據風險偏好篩選信號
   */
  static filterByRiskPreference(
    signals: StandardizedSignal[],
    riskPreference: 'conservative' | 'moderate' | 'aggressive'
  ): StandardizedSignal[] {
    const riskLevelMap = {
      conservative: ['low'],
      moderate: ['low', 'medium'],
      aggressive: ['low', 'medium', 'high'],
    };

    const allowedRisks = riskLevelMap[riskPreference];
    return signals.filter((signal) =>
      allowedRisks.includes(signal.strategy.riskLevel)
    );
  }

  /**
   * 根據信心度篩選
   */
  static filterByConfidence(
    signals: StandardizedSignal[],
    minConfidence: ConfidenceLevel
  ): StandardizedSignal[] {
    const confidenceOrder = { weak: 1, moderate: 2, strong: 3 };
    const minLevel = confidenceOrder[minConfidence];

    return signals.filter(
      (signal) => confidenceOrder[signal.primary.confidence] >= minLevel
    );
  }

  /**
   * 去除衝突信號
   */
  static removeConflictingSignals(
    signals: StandardizedSignal[]
  ): StandardizedSignal[] {
    // 如果同時有買入和賣出信號，保留強度更高的
    const buySignals = signals.filter((s) => s.primary.action === 'buy');
    const sellSignals = signals.filter((s) => s.primary.action === 'sell');
    const otherSignals = signals.filter(
      (s) => !['buy', 'sell'].includes(s.primary.action)
    );

    if (buySignals.length > 0 && sellSignals.length > 0) {
      const bestBuy = buySignals.sort(
        (a, b) => b.primary.strength - a.primary.strength
      )[0];
      const bestSell = sellSignals.sort(
        (a, b) => b.primary.strength - a.primary.strength
      )[0];

      if (bestBuy.primary.strength > bestSell.primary.strength) {
        return [bestBuy, ...otherSignals];
      } else {
        return [bestSell, ...otherSignals];
      }
    }

    return signals;
  }

  /**
   * 按優先級排序
   */
  static sortByPriority(signals: StandardizedSignal[]): StandardizedSignal[] {
    return signals.sort((a, b) => b.display.priority - a.display.priority);
  }
}
