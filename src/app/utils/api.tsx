import { StockChartDTO, StockAnalysisDTO, AnalysisListDTO, NewsDTO } from '../utils/dto';

export const getRangeList = async (
  symbol: string,
  range: string
): Promise<StockChartDTO> => {
  let api = '';

  switch (range) {
    case '1D':
      api = `${process.env.NEXT_PUBLIC_API}/intraday/latest?symbol=${symbol}`;
      break;
    case '1W':
      api = `${process.env.NEXT_PUBLIC_API}/intraday/week?symbol=${symbol}`;
      break;
    case '1M':
      api = `${process.env.NEXT_PUBLIC_API}/daily/RangeData?range=1&symbol=${symbol}`;
      break;
    case '3M':
      api = `${process.env.NEXT_PUBLIC_API}/daily/RangeData?range=3&symbol=${symbol}`;

      break;
    case '6M':
      api = `${process.env.NEXT_PUBLIC_API}/daily/RangeData?range=6&symbol=${symbol}`;
      break;
  }

  const res = await fetch(api, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });

  return await res.json();
};

export const getAnalysisList = async (
  symbol: string,
  range: string
): Promise<StockAnalysisDTO[]> => {
  let api = '';

  switch (range) {
    case '1M':
      api = `${process.env.NEXT_PUBLIC_API}/indicators/range?range=1&symbol=${symbol}`;
      break;
    case '3M':
      api = `${process.env.NEXT_PUBLIC_API}/indicators/range?range=3&symbol=${symbol}`;

      break;
    case '6M':
      api = `${process.env.NEXT_PUBLIC_API}/indicators/range?range=6&symbol=${symbol}`;
      break;
  }

  const res = await fetch(api, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });

  return await res.json();
};

export const getSymbolDetail = async (
  symbol: string
): Promise<AnalysisListDTO> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/indicators/financial?symbol=${symbol}`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
      },
    }
  );

  return await res.json();
};

export const getNews = async (): Promise<NewsDTO[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/news/getNews`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });

  return await res.json();
};
