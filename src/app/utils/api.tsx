import {
  StockChartDTO,
  StockAnalysisDTO,
  AnalysisListDTO,
  NewsDTO,
} from '../utils/dto';

export const getRangeList = async (
  symbol: string,
  range: string
): Promise<StockChartDTO> => {
  let numericRange: string;

  switch (range) {
    case '1D':
    case '1W':
      throw new Error(
        `Intraday data (${range}) is not available. Use 1M or longer timeframes.`
      );
    case '1M':
      numericRange = '1';
      break;
    case '3M':
      numericRange = '3';
      break;
    case '6M':
      numericRange = '6';
      break;
    default:
      throw new Error(`Unknown range: ${range}`);
  }

  const res = await fetch(
    `/api/stock/range?range=${numericRange}&symbol=${symbol}`
  );
  return await res.json();
};

export const getAnalysisList = async (
  symbol: string,
  range: string
): Promise<StockAnalysisDTO[]> => {
  let numericRange: string;

  switch (range) {
    case '1M':
      numericRange = '1';
      break;
    case '3M':
      numericRange = '3';
      break;
    case '6M':
      numericRange = '6';
      break;
    default:
      throw new Error(`Unknown range: ${range}`);
  }

  const res = await fetch(
    `/api/stock/indicators?range=${numericRange}&symbol=${symbol}`
  );
  return await res.json();
};

export const getSymbolDetail = async (
  symbol: string
): Promise<AnalysisListDTO> => {
  const res = await fetch(`/api/stock/financial?symbol=${symbol}`);
  return await res.json();
};

export const getNews = async (): Promise<NewsDTO[]> => {
  const res = await fetch('/api/news');
  return await res.json();
};
