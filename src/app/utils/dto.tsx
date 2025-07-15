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

export type StockClosePriceList = Record<string, StockDTO>;
