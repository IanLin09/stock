/**
 * 策略引擎 Hook
 * Strategy Engine Hook for React Components
 */

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisList } from '@/utils/api';
import { StrategyEngine, type StrategyAnalysis, type IndicatorJudgment, type StrategySignal } from '@/utils/strategyEngine';
import { STRATEGY_CONFIGS, getStrategyConfig, getConfidenceLabel, getSignalColor } from '@/utils/constants/strategies';
import { globalStrategySystem, type ComprehensiveAnalysisResult } from '@/utils/strategySystemController';
import type { StockAnalysisDTO } from '@/utils/dto';

// ==================== Hook 類型定義 ====================

interface UseStrategyEngineOptions {
  symbol: string;
  timeRange: string;
  enabled?: boolean;
  refreshInterval?: number;
}

interface StrategyEngineResult {
  // 數據狀態
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // 基礎分析結果
  analysis: StrategyAnalysis | null;
  indicators: IndicatorJudgment[];
  strategies: StrategySignal[];
  
  // 增強分析結果 (Phase 3.3)
  comprehensiveAnalysis: ComprehensiveAnalysisResult | null;
  
  // 綜合評估
  overallScore: number;
  marketCondition: string;
  primaryRecommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  
  // 操作建議
  actionAdvice: {
    primary: string;
    secondary: string[];
    warnings: string[];
    timeframe: string;
  };
  
  // 工具函數
  refreshAnalysis: () => void;
  getIndicatorStatus: (indicator: string) => IndicatorJudgment | null;
  getStrategyByType: (type: string) => StrategySignal | null;
  formatStrengthLabel: (strength: number) => string;
  getSignalColorByType: (signal: string) => string;
}

// ==================== 主要 Hook ====================

export const useStrategyEngine = (options: UseStrategyEngineOptions): StrategyEngineResult => {
  const { symbol, timeRange, enabled = true, refreshInterval } = options;

  // 獲取技術指標數據
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<StockAnalysisDTO[], Error>({
    queryKey: ['strategyAnalysis', symbol, timeRange],
    queryFn: () => getAnalysisList(symbol, timeRange),
    enabled,
    refetchInterval: refreshInterval,
    staleTime: 30000, // 30秒內數據視為新鮮
  });

  // 執行基礎策略分析
  const analysis = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;
    
    // 使用最新的數據點進行分析
    const latestData = rawData[rawData.length - 1];
    return StrategyEngine.performCompleteAnalysis(latestData, symbol);
  }, [rawData, symbol]);

  // 執行增強型綜合分析 (Phase 3.3) - 使用單獨的查詢
  const {
    data: comprehensiveAnalysis,
    isLoading: isComprehensiveLoading
  } = useQuery<ComprehensiveAnalysisResult | null>({
    queryKey: ['comprehensiveAnalysis', symbol, timeRange],
    queryFn: async () => {
      if (!rawData || rawData.length === 0) return null;
      
      try {
        const latestData = rawData[rawData.length - 1];
        return await globalStrategySystem.performComprehensiveAnalysis(
          latestData, 
          symbol,
          undefined, // currentPrice - 可以從rawData獲取
          {
            riskTolerance: 'moderate', // 可以從用戶設置獲取
            timeHorizon: 'medium'
          }
        );
      } catch (error) {
        console.error('Comprehensive analysis failed:', error);
        return null;
      }
    },
    enabled: enabled && !!rawData && rawData.length > 0,
    staleTime: 60000, // 1分鐘內數據視為新鮮
  });

  // 提取指標判斷
  const indicators = useMemo(() => {
    return analysis?.indicatorJudgments || [];
  }, [analysis]);

  // 提取策略信號
  const strategies = useMemo(() => {
    return analysis?.strategySignals || [];
  }, [analysis]);

  // 計算綜合評分
  const overallScore = useMemo(() => {
    if (!analysis) return 0;
    return Math.round(analysis.overallStrength);
  }, [analysis]);

  // 判斷市場狀況
  const marketCondition = useMemo(() => {
    if (!analysis) return '數據不足';
    
    const { overallSignal, overallStrength } = analysis;
    const bullishCount = indicators.filter(i => i.signal === 'bullish').length;
    const bearishCount = indicators.filter(i => i.signal === 'bearish').length;
    
    if (overallSignal === 'bullish' && overallStrength > 70) {
      return '強勢上漲';
    } else if (overallSignal === 'bearish' && overallStrength > 70) {
      return '強勢下跌';
    } else if (Math.abs(bullishCount - bearishCount) <= 1) {
      return '震盪整理';
    } else if (overallStrength < 50) {
      return '方向不明';
    } else {
      return overallSignal === 'bullish' ? '溫和上漲' : '溫和下跌';
    }
  }, [analysis, indicators]);

  // 主要建議
  const primaryRecommendation = useMemo(() => {
    if (!analysis) return '等待數據';
    
    const bestStrategy = strategies.reduce((best, current) => 
      current.strength > best.strength ? current : best,
      strategies[0] || { action: 'hold', recommendation: '保持觀望' }
    );
    
    return bestStrategy.recommendation || '保持觀望';
  }, [analysis, strategies]);

  // 風險等級
  const riskLevel = useMemo(() => {
    if (!analysis) return 'low';
    
    const highRiskStrategies = strategies.filter(s => s.riskLevel === 'high' && s.strength > 60);
    const avgRisk = strategies.reduce((sum, s) => {
      const riskScore = s.riskLevel === 'high' ? 3 : s.riskLevel === 'medium' ? 2 : 1;
      return sum + riskScore;
    }, 0) / strategies.length;
    
    if (highRiskStrategies.length > 0 || avgRisk > 2.5) return 'high';
    if (avgRisk > 1.5) return 'medium';
    return 'low';
  }, [strategies]);

  // 操作建議
  const actionAdvice = useMemo(() => {
    if (!analysis) {
      return {
        primary: '等待數據載入',
        secondary: [],
        warnings: [],
        timeframe: ''
      };
    }

    const { finalRecommendation } = analysis;
    const primaryAction = finalRecommendation.primaryAction;
    
    // 根據主要操作生成建議
    const getActionTemplate = (action: string) => {
      switch (action) {
        case 'buy':
          return {
            primary: '建議買入',
            secondary: ['分批建倉減少風險', '設置合理止損位', '控制單次投入金額'],
            warnings: ['注意風險控制', '避免追高操作', '準備止損計劃']
          };
        case 'sell':
          return {
            primary: '建議賣出',
            secondary: ['可考慮分批減倉', '保留部分觀察倉位', '關注技術面變化'],
            warnings: ['避免恐慌性拋售', '注意反彈風險', '保持理性操作']
          };
        default:
          return {
            primary: '建議觀望',
            secondary: ['等待更明確信號', '關注關鍵技術位', '準備應對變化'],
            warnings: ['避免頻繁交易', '控制交易成本', '保持耐心等待']
          };
      }
    };

    const template = getActionTemplate(primaryAction);
    
    return {
      ...template,
      secondary: [
        ...template.secondary,
        ...finalRecommendation.secondaryActions.slice(0, 2)
      ],
      warnings: [
        ...template.warnings,
        ...finalRecommendation.riskWarnings
      ],
      timeframe: finalRecommendation.timeframe
    };
  }, [analysis]);

  // 工具函數
  const refreshAnalysis = useCallback(() => {
    refetch();
  }, [refetch]);

  const getIndicatorStatus = useCallback((indicator: string): IndicatorJudgment | null => {
    return indicators.find(i => i.indicator === indicator) || null;
  }, [indicators]);

  const getStrategyByType = useCallback((type: string): StrategySignal | null => {
    return strategies.find(s => s.type === type) || null;
  }, [strategies]);

  const formatStrengthLabel = useCallback((strength: number): string => {
    const confidence = getConfidenceLabel(strength);
    const percentage = Math.round(strength);
    
    const labels = {
      weak: '弱',
      moderate: '中',
      strong: '強'
    };
    
    return `${labels[confidence]} (${percentage}%)`;
  }, []);

  const getSignalColorByType = useCallback((signal: string): string => {
    return getSignalColor(signal);
  }, []);

  return {
    // 數據狀態
    isLoading: isLoading || isComprehensiveLoading,
    isError,
    error,
    
    // 分析結果
    analysis,
    indicators,
    strategies,
    
    // 增強分析結果 (Phase 3.3)
    comprehensiveAnalysis: comprehensiveAnalysis || null,
    
    // 綜合評估
    overallScore,
    marketCondition,
    primaryRecommendation,
    riskLevel,
    
    // 操作建議
    actionAdvice,
    
    // 工具函數
    refreshAnalysis,
    getIndicatorStatus,
    getStrategyByType,
    formatStrengthLabel,
    getSignalColorByType
  };
};

// ==================== 輔助 Hooks ====================

/**
 * 獲取特定指標的歷史趨勢
 */
export const useIndicatorTrend = (symbol: string, indicator: string, timeRange: string) => {
  const { data } = useQuery<StockAnalysisDTO[], Error>({
    queryKey: ['indicatorTrend', symbol, indicator, timeRange],
    queryFn: () => getAnalysisList(symbol, timeRange),
  });

  const trend = useMemo(() => {
    if (!data) return [];
    
    return data.map(item => {
      const analysis = StrategyEngine.analyzeIndicators(item);
      const indicatorData = analysis.find(a => a.indicator === indicator);
      
      return {
        timestamp: item.datetime,
        strength: indicatorData?.strength || 0,
        signal: indicatorData?.signal || 'neutral'
      };
    });
  }, [data, indicator]);

  return trend;
};

/**
 * 策略表現統計
 */
export const useStrategyPerformance = (symbol: string, timeRange: string) => {
  const { strategies } = useStrategyEngine({ symbol, timeRange });
  
  const performance = useMemo(() => {
    if (!strategies) return null;
    
    const stats = strategies.map(strategy => {
      const config = getStrategyConfig(strategy.type);
      
      return {
        type: strategy.type,
        name: config.name,
        currentStrength: strategy.strength,
        confidence: strategy.confidence,
        riskLevel: strategy.riskLevel,
        expectedSuccess: config.successRate,
        maxDrawdown: config.maxDrawdown,
        recommendation: strategy.recommendation
      };
    });
    
    return stats.sort((a, b) => b.currentStrength - a.currentStrength);
  }, [strategies]);
  
  return performance;
};