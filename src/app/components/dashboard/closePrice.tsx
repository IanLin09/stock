import { StockClosePriceList, StockDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';

const getClosePrice = async (): Promise<StockClosePriceList> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/daily`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
    },
  });
  let stocks: StockDTO[] = await res.json();
  const stocksBySymbol: StockClosePriceList = stocks.reduce<
    Record<string, StockDTO>
  >((acc, stock) => {
    acc[stock.symbol] = stock;
    return acc;
  }, {});
  return stocksBySymbol;
};

export const ClosePrices = () => {
  return useQuery<StockClosePriceList, Error>({
    queryKey: ['closePrice'],
    queryFn: () => getClosePrice(),
  });
};
