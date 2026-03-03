'use client';
import ComprehensiveChart from './comprehensiveChart';
import { ClosePrices } from './closePrice';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { handleError } from '@/utils/error';
import { useIsMobile } from '@/hooks/use-responsive';
import {
  getResponsiveTextSize,
  getResponsiveSpacing,
} from '@/utils/responsive';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStockPriceStyle } from '@/utils/zustand';

type ComprehensiveAreaProps = {
  symbol: string;
};

const ComprehensiveArea = ({ symbol }: ComprehensiveAreaProps) => {
  const [range, setRange] = useState<string>('1M');
  const [plotLeft, setPlotLeft] = useState<number>(0);
  const [prevClose, setPrevClose] = useState<number | null>(null);
  const { data, isLoading, error } = ClosePrices();
  const { upColor, downColor } = useStockPriceStyle();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (error) handleError(error, { context: 'Data Fetch' });
  }, [error]);

  // Reset the previous-close reference whenever the symbol changes so stale
  // data from the old symbol is not shown while the new query is in-flight.
  useEffect(() => {
    setPrevClose(null);
  }, [symbol]);

  if (!symbol) return <></>;
  if (isLoading)
    return <p className={getResponsiveSpacing('sm')}>Loading...</p>;
  if (!data) return <p className={getResponsiveSpacing('sm')}>Loading...</p>;

  const closePrice = data[symbol]?.close ?? 0;
  const pctChange =
    prevClose != null ? ((closePrice - prevClose) / prevClose) * 100 : null;
  const pctColor =
    pctChange !== null ? (pctChange >= 0 ? upColor : downColor) : undefined;
  const pctText =
    pctChange !== null
      ? `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`
      : '';

  return (
    <div className={`flex flex-col h-full ${getResponsiveSpacing('md')}`}>
      {/* Header */}
      <div
        className={`
          ${getResponsiveSpacing('sm')}
          ${isMobile ? 'flex flex-col space-y-2' : 'flex items-center justify-between'}
        `}
      >
        {/* Left: symbol + close price + % change — indented to align with chart Y-axis */}
        <div
          className="flex items-baseline gap-3 flex-wrap"
          style={plotLeft > 0 ? { paddingLeft: plotLeft } : undefined}
        >
          <span
            data-testid="panel-symbol"
            className={`${getResponsiveTextSize('3xl')} font-bold`}
          >
            {symbol}
          </span>
          <span
            data-testid="panel-price"
            className={`${getResponsiveTextSize('2xl')} font-bold`}
          >
            {closePrice}
          </span>
          {pctText && (
            <span
              data-testid="panel-pct-change"
              className={`${getResponsiveTextSize('base')} font-medium`}
              style={{ color: pctColor }}
            >
              {pctText}
            </span>
          )}
        </div>

        {/* Right: time range tabs */}
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            {!isMobile && <TabsTrigger value="Range">Range</TabsTrigger>}
            <TabsTrigger value="1M">{t('1m')}</TabsTrigger>
            <TabsTrigger value="3M">{t('3m')}</TabsTrigger>
            <TabsTrigger value="6M">{t('6m')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart Section */}
      <div
        className={`
          flex-1 min-h-0
          ${isMobile ? 'mt-4' : 'mt-2'}
          ${getResponsiveSpacing('sm')}
        `}
      >
        <ComprehensiveChart
          closePrice={closePrice}
          symbol={symbol}
          range={range}
          onPlotOffsetChange={setPlotLeft}
          onPreviousPriceChange={setPrevClose}
        />
      </div>
    </div>
  );
};

export default ComprehensiveArea;
