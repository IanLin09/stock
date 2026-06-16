'use client';

import { NewsSummary } from './dataService';
import { DateTime } from 'luxon';
import type { NewsSummaryDTO } from '@/utils/dto';

const LABEL_COLORS: Record<string, string> = {
  Bullish: 'text-green-400',
  'Somewhat Bullish': 'text-emerald-400',
  Neutral: 'text-gray-400',
  'Somewhat Bearish': 'text-amber-400',
  Bearish: 'text-red-400',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green-300',
  medium: 'text-gray-300',
  low: 'text-gray-500',
};

function labelColor(label: string): string {
  return LABEL_COLORS[label] ?? 'text-gray-400';
}

function confidenceColor(confidence: string): string {
  return CONFIDENCE_COLORS[confidence] ?? 'text-gray-400';
}

function TickerRow({ item }: { item: NewsSummaryDTO }) {
  if (!item.hasData) {
    return (
      <div
        data-testid={`sentiment-no-data-${item.ticker}`}
        className="flex items-center justify-between py-1 px-1 text-xs font-mono"
      >
        <span className="w-14 font-bold text-gray-300">{item.ticker}</span>
        <span className="text-gray-600 italic">no data</span>
      </div>
    );
  }

  return (
    <div
      data-testid={`sentiment-row-${item.ticker}`}
      className="flex items-center justify-between py-1 px-1 text-xs font-mono"
    >
      <span className="w-14 font-bold text-gray-200">{item.ticker}</span>
      <span className={`w-10 text-right ${labelColor(item.label)}`}>
        {item.score.toFixed(2)}
      </span>
      <span className={`flex-1 text-center text-[10px] ${labelColor(item.label)}`}>
        {item.label}
      </span>
      <span className={`w-12 text-right text-[10px] ${confidenceColor(item.confidence)}`}>
        {item.confidence}
      </span>
      <span className="w-8 text-right text-gray-500">{item.article_count}</span>
    </div>
  );
}

const SentimentNews = () => {
  const { isLoading, isError, data } = NewsSummary();
  const updatedAt = DateTime.now().toFormat('HH:mm:ss');

  if (isLoading) {
    return (
      <div
        data-testid="sentiment-loading"
        className="flex items-center justify-center h-full text-xs font-mono text-gray-500"
      >
        Loading sentiment…
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="sentiment-error"
        className="flex items-center justify-center h-full text-xs font-mono text-red-500"
      >
        Failed to load sentiment
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        data-testid="sentiment-empty"
        className="flex items-center justify-center h-full text-xs font-mono text-gray-600"
      >
        No sentiment data
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-2 py-2 font-mono">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 px-1">
        News Sentiment
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {data.map((item) => (
          <TickerRow key={item.ticker} item={item} />
        ))}
      </div>
      <div
        data-testid="sentiment-updated"
        className="text-[9px] text-gray-600 text-right pt-1 border-t border-gray-800 mt-1"
      >
        updated {updatedAt}
      </div>
    </div>
  );
};

export default SentimentNews;
