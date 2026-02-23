import { StockClosePriceList, StockDTO, PreviousPriceDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';

const getClosePrice = async (): Promise<StockClosePriceList> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/daily`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/daily/previous?symbol=${symbol}&range=1D`,
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
