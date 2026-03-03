'use client';

import { useQuery } from '@tanstack/react-query';
import { getSymbolDetail } from '@/utils/api';
import {
  calculateIndicatorStatuses,
  formatIndicatorValue,
} from '@/utils/indicatorCalculations';
import { IndicatorStatus } from '@/utils/dto';
import { useIsMobile } from '@/hooks/use-responsive';

interface IndicatorSummaryProps {
  symbol: string;
}

const badgeColors: Record<IndicatorStatus, string> = {
  bullish: 'bg-green-500/20 text-green-400',
  bearish: 'bg-red-500/20 text-red-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  extreme: 'bg-yellow-500/20 text-yellow-400',
};

export default function IndicatorSummary({ symbol }: IndicatorSummaryProps) {
  const isMobile = useIsMobile();
  const { data, isLoading } = useQuery({
    queryKey: ['analysisList', symbol],
    queryFn: () => getSymbolDetail(symbol),
    enabled: !!symbol,
  });

  if (!symbol) return null;

  if (isLoading || !data) {
    return (
      <div
        data-testid="indicator-summary-loading"
        className="flex items-center justify-center h-full text-gray-500 text-sm"
      >
        Loading indicators…
      </div>
    );
  }

  const { indicators } = data;
  const statuses = calculateIndicatorStatuses(indicators);
  const fmt = (v: number | null | undefined) => formatIndicatorValue(v);

  return (
    <div
      data-testid="indicator-summary"
      className="overflow-y-auto px-4 py-2 space-y-1"
    >
      {/* RSI */}
      <div
        data-testid="indicator-row-rsi"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">RSI</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {fmt(indicators.rsi?.[14])}
        </span>
        <span
          data-testid="signal-badge-rsi"
          className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.rsi]}`}
        >
          {statuses.rsi}
        </span>
      </div>

      {/* MACD */}
      <div
        data-testid="indicator-row-macd"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">MACD</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `D:${fmt(indicators.macd?.dif)} A:${fmt(indicators.macd?.dea)} H:${fmt(indicators.macd?.histogram)}`
            : `DIF ${fmt(indicators.macd?.dif)} / DEA ${fmt(indicators.macd?.dea)} / Hist ${fmt(indicators.macd?.histogram)}`}
        </span>
        <span
          data-testid="signal-badge-macd"
          className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.macd]}`}
        >
          {statuses.macd}
        </span>
      </div>

      {/* MA */}
      <div
        data-testid="indicator-row-ma"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">MA</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          MA20 {fmt(indicators.ma?.[20])}
        </span>
        <span
          data-testid="signal-badge-ma"
          className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.ma]}`}
        >
          {statuses.ma}
        </span>
      </div>

      {/* KDJ */}
      <div
        data-testid="indicator-row-kdj"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">KDJ</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `K:${fmt(indicators.kdj?.k)} D:${fmt(indicators.kdj?.d)} J:${fmt(indicators.kdj?.j)}`
            : `K ${fmt(indicators.kdj?.k)} / D ${fmt(indicators.kdj?.d)} / J ${fmt(indicators.kdj?.j)}`}
        </span>
        <span
          data-testid="signal-badge-kdj"
          className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.kdj]}`}
        >
          {statuses.kdj}
        </span>
      </div>

      {/* Bollinger */}
      <div
        data-testid="indicator-row-bollinger"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">Bollinger</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          {isMobile
            ? `U:${fmt(indicators.bollinger?.upper)} M:${fmt(indicators.bollinger?.middle)} L:${fmt(indicators.bollinger?.lower)}`
            : `Upper ${fmt(indicators.bollinger?.upper)} / Mid ${fmt(indicators.bollinger?.middle)} / Lower ${fmt(indicators.bollinger?.lower)}`}
        </span>
        <span
          data-testid="signal-badge-bollinger"
          className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full shrink-0 ${badgeColors[statuses.bollinger]}`}
        >
          {statuses.bollinger}
        </span>
      </div>

      {/* EMA — no badge */}
      <div
        data-testid="indicator-row-ema"
        className="flex items-center text-sm gap-2"
      >
        <span className="w-16 md:w-20 text-gray-500 shrink-0 text-xs md:text-sm">EMA</span>
        <span className="flex-1 text-gray-300 text-xs md:text-sm">
          EMA5 {fmt(indicators.ema?.[5])}
        </span>
      </div>
    </div>
  );
}
