import { StockAnalysisDTO, IndicatorStatus } from './dto';

// RSI 狀況判斷
export const calculateRSIStatus = (
  rsi: number | null | undefined
): IndicatorStatus => {
  if (rsi === null || rsi === undefined || isNaN(rsi)) return 'neutral';
  if (rsi < 30) return 'bullish'; // 超賣區間，可能反彈
  if (rsi > 70) return 'bearish'; // 超買區間，注意回調
  if (rsi < 20 || rsi > 80) return 'extreme'; // 極端區間
  return 'neutral'; // 中性區間
};

// MACD 狀況判斷
export const calculateMACDStatus = (
  dif: number | null | undefined,
  dea: number | null | undefined,
  histogram: number | null | undefined
): IndicatorStatus => {
  if (
    dif === null ||
    dif === undefined ||
    isNaN(dif) ||
    dea === null ||
    dea === undefined ||
    isNaN(dea) ||
    histogram === null ||
    histogram === undefined ||
    isNaN(histogram)
  ) {
    return 'neutral';
  }
  if (dif > dea && histogram > 0) return 'bullish'; // 金叉且直方圖為正
  if (dif < dea && histogram < 0) return 'bearish'; // 死叉且直方圖為負
  if (Math.abs(histogram) > 0.5) return 'extreme'; // 直方圖絕對值較大
  return 'neutral';
};

// 移動平均線狀況判斷
export const calculateMAStatus = (
  currentPrice: number | null | undefined,
  ma20: number | null | undefined
): IndicatorStatus => {
  if (
    currentPrice === null ||
    currentPrice === undefined ||
    isNaN(currentPrice) ||
    ma20 === null ||
    ma20 === undefined ||
    isNaN(ma20) ||
    ma20 === 0
  ) {
    return 'neutral';
  }
  const deviation = ((currentPrice - ma20) / ma20) * 100;
  if (deviation > 5) return 'bullish'; // 價格高於MA20 5%以上
  if (deviation < -5) return 'bearish'; // 價格低於MA20 5%以上
  if (Math.abs(deviation) > 10) return 'extreme'; // 偏離超過10%
  return 'neutral';
};

// KDJ 狀況判斷
export const calculateKDJStatus = (
  k: number | null | undefined,
  d: number | null | undefined,
  j: number | null | undefined
): IndicatorStatus => {
  // 檢查是否有有效的數值
  if (
    k === null ||
    k === undefined ||
    isNaN(k) ||
    d === null ||
    d === undefined ||
    isNaN(d) ||
    j === null ||
    j === undefined ||
    isNaN(j)
  ) {
    return 'neutral';
  }

  if (k < 20 && d < 20 && j < 20) return 'bullish'; // 超賣區間
  if (k > 80 && d > 80 && j > 80) return 'bearish'; // 超買區間
  if (k < 10 || k > 90) return 'extreme'; // 極端區間
  return 'neutral';
};

// 布林帶狀況判斷
export const calculateBollingerStatus = (
  currentPrice: number | null | undefined,
  upper: number | null | undefined,
  lower: number | null | undefined,
  middle: number | null | undefined
): IndicatorStatus => {
  if (
    currentPrice === null ||
    currentPrice === undefined ||
    isNaN(currentPrice) ||
    upper === null ||
    upper === undefined ||
    isNaN(upper) ||
    lower === null ||
    lower === undefined ||
    isNaN(lower) ||
    middle === null ||
    middle === undefined ||
    isNaN(middle) ||
    middle === 0
  ) {
    return 'neutral';
  }

  if (currentPrice <= lower) return 'bullish'; // 觸及下軌
  if (currentPrice >= upper) return 'bearish'; // 觸及上軌

  const bandWidth = ((upper - lower) / middle) * 100;
  if (bandWidth < 5) return 'extreme'; // 帶寬收窄

  return 'neutral';
};

// 綜合指標狀況計算
export const calculateIndicatorStatuses = (data: StockAnalysisDTO) => {
  return {
    rsi: calculateRSIStatus(data.rsi?.[14]),
    macd: calculateMACDStatus(
      data.macd?.dif,
      data.macd?.dea,
      data.macd?.histogram
    ),
    ma: calculateMAStatus(data.close, data.ma?.[20]),
    kdj: calculateKDJStatus(data.kdj?.k, data.kdj?.d, data.kdj?.j),
    bollinger: calculateBollingerStatus(
      data.close,
      data.bollinger?.upper,
      data.bollinger?.lower,
      data.bollinger?.middle
    ),
  };
};

// 指標數值格式化
export const formatIndicatorValue = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals);
};

// 指標狀況描述
export const getIndicatorStatusDescription = (
  indicator: string,
  status: IndicatorStatus
): string => {
  const descriptions = {
    rsi: {
      bullish: '超賣區間，可能反彈',
      bearish: '超買區間，注意回調',
      neutral: '中性區間',
      extreme: '極端區間，注意反轉',
    },
    macd: {
      bullish: '金叉信號，看漲',
      bearish: '死叉信號，看跌',
      neutral: '中性狀態',
      extreme: '強勢信號',
    },
    ma: {
      bullish: '價格高於均線，看漲',
      bearish: '價格低於均線，看跌',
      neutral: '價格接近均線',
      extreme: '偏離均線較大',
    },
    kdj: {
      bullish: '超賣區間，可能反彈',
      bearish: '超買區間，注意回調',
      neutral: '中性區間',
      extreme: '極端區間',
    },
    bollinger: {
      bullish: '觸及下軌，支撐強勁',
      bearish: '觸及上軌，壓力較大',
      neutral: '中軌附近',
      extreme: '帶寬收窄，變盤在即',
    },
  };

  return (
    descriptions[indicator as keyof typeof descriptions]?.[status] || '未知狀態'
  );
};

// 交易信號生成
export const generateTradingSignals = (data: StockAnalysisDTO): string[] => {
  const signals: string[] = [];
  const statuses = calculateIndicatorStatuses(data);

  // RSI 信號
  if (statuses.rsi === 'bullish') {
    signals.push('RSI < 30: 考慮買入機會');
  } else if (statuses.rsi === 'bearish') {
    signals.push('RSI > 70: 考慮減倉');
  }

  // MACD 信號
  if (statuses.macd === 'bullish') {
    signals.push('MACD金叉: 買入信號');
  } else if (statuses.macd === 'bearish') {
    signals.push('MACD死叉: 賣出信號');
  }

  // MA 信號
  if (statuses.ma === 'bullish') {
    signals.push('價格高於MA20: 短期看漲');
  } else if (statuses.ma === 'bearish') {
    signals.push('價格低於MA20: 短期看跌');
  }

  return signals;
};
