import {
  StockClosePriceList,
  StockDTO,
  PreviousPriceDTO,
  PreviousPriceList,
  NewsSummaryDTO,
} from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';

const getClosePrice = async (): Promise<StockClosePriceList> => {
  const res = await fetch('/api/stock/close', { method: 'get' });
  const stocks: StockDTO[] = await res.json();
  const stocksBySymbol: StockClosePriceList = stocks.reduce<
    Record<string, StockDTO>
  >((acc, stock) => {
    acc[stock.symbol] = stock;
    return acc;
  }, {});
  return stocksBySymbol;
};

const getPreviousPrice = async (symbol: string): Promise<PreviousPriceDTO> => {
  const res = await fetch(`/api/stock/previous?symbol=${symbol}`, {
    method: 'get',
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const ClosePrices = () => {
  return useQuery<StockClosePriceList, Error>({
    queryKey: ['closePrice'],
    queryFn: () => getClosePrice(),
  });
};

export const PreviousPrice = (symbol: string) => {
  return useQuery<PreviousPriceDTO, Error>({
    queryKey: ['previousPrice', symbol],
    queryFn: () => getPreviousPrice(symbol),
    enabled: !!symbol,
  });
};

const getPreviousPrices = async (range: string): Promise<PreviousPriceList> => {
  const res = await fetch(`/api/stock/previous-prices?range=${range}`, {
    method: 'get',
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const PreviousPrices = (range: string) => {
  return useQuery<PreviousPriceList, Error>({
    queryKey: ['previousPrices', range],
    queryFn: () => getPreviousPrices(range),
    enabled: !!range,
  });
};

const getNewsSummary = async (): Promise<NewsSummaryDTO[]> => {
  const res = await fetch('/api/news/summary', { method: 'get' });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export const NewsSummary = () => {
  return useQuery<NewsSummaryDTO[], Error>({
    queryKey: ['newsSummary'],
    queryFn: () => getNewsSummary(),
    staleTime: 5 * 60 * 1000,
  });
};
