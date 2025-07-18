export type StockDTO = {
  _id: string;
  symbol: string;
  datetime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type macd = {
  dif: number;

  dea: number;

  histogram: number;

  ema12: number;

  ema26: number;
};

type ma = {
  20: number;
};

type ema = {
  5: number;
};

type rsi = {
  14: number;
  gain: number;
  loss: number;
};

type bollinger = {
  datetime: Date;
  middle: number;
  upper: number;
  lower: number;
};

type kdj = {
  datetime: Date;
  k: number;
  d: number;
  j: number;
  rsv: number;
};

export type StockAnalysisDTO = {
  _id: string;
  symbol: string;
  datetime: Date;
  open: number;
  close: number;
  macd: macd;
  ma: ma;
  ema: ema;
  rsi: rsi;
  bollinger: bollinger;
  kdj: kdj;
};

export type StockChartDTO = {
  _id: string;
  data: StockDTO[];
  extra?: StockDTO[];
  close: number;
  previous?: number;
};

export type PreviousPriceDTO = {
  _id: string;
  datetime: string;
  close: number;
};

export type NewsDTO = {
  category: string;
  datetime: string;
  headline: string;
  id: string;
  image: string;
  related?: string;
  source: string;
  summary: string;
  url: string;
};

export type MaData = {
  x: Date;
  y: number;
};

type NextReportDay = {
  symbol: string;
  fiscalDateEnding: string;
  reportDate: string;
};

export type AnalysisListDTO = {
  indicators: StockAnalysisDTO;
  report: NextReportDay[];
};

// 增強的分析 DTO，包含狀況判斷
export type AnalysisListWithStatusDTO = {
  indicators: StockAnalysisDTO;
  report: NextReportDay[];
  indicatorStatus: IndicatorStatusMap;
  tradingSignals: string[];
};

// 增強的分析 DTO - 為 Phase 2 和 Phase 3 準備
export type EnhancedAnalysisDTO = {
  indicators: StockAnalysisDTO;
  report: NextReportDay[];
  strategies: TradingStrategy[];
  supportedSymbols: string[];
  indicatorStatus: IndicatorStatusMap;
};

// 指標狀態類型
export type IndicatorStatus = 'bullish' | 'bearish' | 'neutral' | 'extreme';

// 指標狀態映射
export type IndicatorStatusMap = {
  rsi: IndicatorStatus;
  macd: IndicatorStatus;
  ma: IndicatorStatus;
  kdj: IndicatorStatus;
  bollinger: IndicatorStatus;
};

// 策略規則類型
export type StrategyRule = {
  condition: string;
  action: string;
  risk: 'low' | 'medium' | 'high';
};

// 交易策略類型
export type TradingStrategy = {
  id: string;
  name: string;
  description: string;
  rules: StrategyRule[];
  riskLevel: 'low' | 'medium' | 'high';
  success_rate?: number;
  max_drawdown?: number;
};

export type StockClosePriceList = Record<string, StockDTO>;
