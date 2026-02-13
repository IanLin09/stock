'use client';
import type { StockAnalysisDTO } from '@/utils/dto';

type StrategyDashboardProps = {
  symbol: string;
  analysis: StockAnalysisDTO | null;
};

export default function StrategyDashboard({
  symbol,
  analysis,
}: StrategyDashboardProps) {
  if (!analysis) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading strategy analysis...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Strategy Dashboard</h2>
      <div className="text-sm text-gray-600">Symbol: {symbol}</div>
    </div>
  );
}
