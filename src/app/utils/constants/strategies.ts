/**
 * 策略常數定義
 * Strategy Constants and Configurations
 */

import type {
  StrategyType,
  RiskLevel,
  ConfidenceLevel,
} from '../strategyEngine';

// ==================== 策略配置 ====================

export const STRATEGY_CONFIGS = {
  momentum: {
    name: '動量策略',
    description: '基於趨勢跟踪的策略，適合單邊行情',
    riskLevel: 'medium' as RiskLevel,
    timeframe: '短期(1-5個交易日)',
    requirements: ['多個指標同向', '趨勢明確', '成交量配合'],
    advantages: ['捕捉趨勢', '收益潛力大', '操作相對簡單'],
    disadvantages: ['震盪市場表現差', '可能追高殺低', '需要及時止損'],
    successRate: 65,
    maxDrawdown: 15,
  },
  mean_reversion: {
    name: '均值回歸策略',
    description: '基於價格極值反轉的策略，適合震盪行情',
    riskLevel: 'medium' as RiskLevel,
    timeframe: '短期(2-7個交易日)',
    requirements: ['指標極值', '背離信號', '波動率較高'],
    advantages: ['勝率較高', '回撤相對較小', '適合震盪市場'],
    disadvantages: ['單次收益有限', '需要精確時機', '趨勢市場風險大'],
    successRate: 72,
    maxDrawdown: 10,
  },
  breakout: {
    name: '突破策略',
    description: '基於技術形態突破的策略，適合關鍵位置',
    riskLevel: 'high' as RiskLevel,
    timeframe: '中短期(3-10個交易日)',
    requirements: ['關鍵位置突破', '成交量放大', '多指標確認'],
    advantages: ['收益潛力最大', '趨勢確立後持續性強', '信號相對明確'],
    disadvantages: ['假突破風險', '波動較大', '需要較大資金'],
    successRate: 58,
    maxDrawdown: 20,
  },
} as const;

// ==================== 指標閾值 ====================

export const INDICATOR_THRESHOLDS = {
  RSI: {
    extreme_oversold: 20,
    oversold: 30,
    neutral_low: 40,
    neutral_high: 60,
    overbought: 70,
    extreme_overbought: 80,
  },
  MACD: {
    weak_signal: 0.1,
    moderate_signal: 0.3,
    strong_signal: 0.5,
  },
  MA: {
    trend_threshold: 0.02, // 2%偏離視為趨勢
    strong_trend: 0.05, // 5%偏離視為強趨勢
    extreme_deviation: 0.08, // 8%偏離視為極端
  },
  KDJ: {
    oversold: 20,
    overbought: 80,
    extreme_oversold: 10,
    extreme_overbought: 90,
  },
} as const;

// ==================== 信號強度配置 ====================

export const SIGNAL_STRENGTH = {
  confidence_levels: {
    weak: { min: 0, max: 40, label: '弱', color: '#6b7280' },
    moderate: { min: 40, max: 70, label: '中', color: '#f59e0b' },
    strong: { min: 70, max: 100, label: '強', color: '#10b981' },
  },
  signal_types: {
    bullish: { label: '看漲', color: '#22c55e', icon: '↗️' },
    bearish: { label: '看跌', color: '#ef4444', icon: '↘️' },
    neutral: { label: '中性', color: '#6b7280', icon: '→' },
    extreme: { label: '極端', color: '#f59e0b', icon: '⚠️' },
  },
  risk_levels: {
    low: {
      label: '低風險',
      color: '#10b981',
      description: '相對安全，適合保守投資者',
    },
    medium: {
      label: '中風險',
      color: '#f59e0b',
      description: '風險適中，需要適當管理',
    },
    high: {
      label: '高風險',
      color: '#ef4444',
      description: '高風險高收益，需要嚴格止損',
    },
  },
} as const;

// ==================== 操作建議模板 ====================

export const ACTION_TEMPLATES = {
  buy: {
    primary: '建議買入',
    secondary: ['分批建倉', '設置止損', '控制倉位'],
    warnings: ['注意風險控制', '不要滿倉操作', '準備止損計劃'],
  },
  sell: {
    primary: '建議賣出',
    secondary: ['分批減倉', '保留部分倉位', '關注反彈機會'],
    warnings: ['避免情緒操作', '注意反彈風險', '保留現金為王'],
  },
  hold: {
    primary: '建議持有',
    secondary: ['保持觀望', '等待明確信號', '準備應對變化'],
    warnings: ['密切關注市場', '準備調整策略', '控制交易頻率'],
  },
  reduce: {
    primary: '建議減倉',
    secondary: ['部分獲利了結', '降低風險敞口', '保留核心倉位'],
    warnings: ['不要一次性清倉', '關注市場情緒', '準備重新建倉'],
  },
} as const;

// ==================== 市場狀況判斷 ====================

export const MARKET_CONDITIONS = {
  trending_up: {
    label: '上升趨勢',
    description: '多個指標看漲，適合動量策略',
    recommended_strategies: ['momentum'],
    avoid_strategies: ['mean_reversion'],
  },
  trending_down: {
    label: '下降趨勢',
    description: '多個指標看跌，建議減倉或做空',
    recommended_strategies: ['momentum'],
    avoid_strategies: ['mean_reversion'],
  },
  sideways: {
    label: '震盪整理',
    description: '指標分歧，適合區間操作',
    recommended_strategies: ['mean_reversion'],
    avoid_strategies: ['breakout'],
  },
  volatile: {
    label: '高波動',
    description: '市場劇烈波動，謹慎操作',
    recommended_strategies: ['mean_reversion'],
    avoid_strategies: ['momentum'],
  },
  uncertain: {
    label: '方向不明',
    description: '等待明確信號，建議觀望',
    recommended_strategies: [],
    avoid_strategies: ['momentum', 'breakout'],
  },
} as const;

// ==================== 時間框架配置 ====================

export const TIMEFRAMES = {
  short_term: {
    label: '短期',
    duration: '1-5個交易日',
    suitable_strategies: ['momentum', 'mean_reversion'],
    indicators_weight: {
      RSI: 0.3,
      MACD: 0.25,
      KDJ: 0.25,
      MA: 0.2,
    },
  },
  medium_term: {
    label: '中期',
    duration: '1-4週',
    suitable_strategies: ['breakout', 'momentum'],
    indicators_weight: {
      MACD: 0.35,
      MA: 0.3,
      RSI: 0.2,
      KDJ: 0.15,
    },
  },
  long_term: {
    label: '長期',
    duration: '1個月以上',
    suitable_strategies: ['momentum'],
    indicators_weight: {
      MA: 0.4,
      MACD: 0.3,
      RSI: 0.2,
      KDJ: 0.1,
    },
  },
} as const;

// ==================== 風險管理規則 ====================

export const RISK_MANAGEMENT = {
  position_sizing: {
    low_risk: { max_position: 0.3, description: '最大30%倉位' },
    medium_risk: { max_position: 0.2, description: '最大20%倉位' },
    high_risk: { max_position: 0.1, description: '最大10%倉位' },
  },
  stop_loss: {
    momentum: { percentage: 0.08, description: '8%止損' },
    mean_reversion: { percentage: 0.05, description: '5%止損' },
    breakout: { percentage: 0.12, description: '12%止損' },
  },
  take_profit: {
    momentum: { percentage: 0.15, description: '15%止盈' },
    mean_reversion: { percentage: 0.08, description: '8%止盈' },
    breakout: { percentage: 0.25, description: '25%止盈' },
  },
} as const;

// ==================== 輔助函數 ====================

export const getStrategyConfig = (type: StrategyType) => {
  return STRATEGY_CONFIGS[type];
};

export const getSignalColor = (signal: string) => {
  return (
    SIGNAL_STRENGTH.signal_types[
      signal as keyof typeof SIGNAL_STRENGTH.signal_types
    ]?.color || '#6b7280'
  );
};

export const getConfidenceLabel = (strength: number): ConfidenceLevel => {
  if (strength >= 70) return 'strong';
  if (strength >= 40) return 'moderate';
  return 'weak';
};

export const getRiskColor = (risk: RiskLevel) => {
  return SIGNAL_STRENGTH.risk_levels[risk].color;
};
