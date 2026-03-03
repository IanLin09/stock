'use client';
export const dynamic = 'force-dynamic';

import CountdownTimer from '@/components/dashboard/timer';
import DashboardList from '@/components/dashboard/list';
import { useState } from 'react';
import ComprehensiveArea from '@/components/dashboard/comprehensive';
import IndicatorSummary from '@/components/dashboard/IndicatorSummary';

const DashboardPage = () => {
  const [symbol, setSymbol] = useState<string>('');
  return (
    <>
      {/* Left panel — full width on mobile, col 1 row 1 on desktop */}
      <div className="md:row-span-1 border border-black dark:border-white h-[35%] md:h-full flex flex-col shrink-0">
        <DashboardList setSymbol={setSymbol} />
      </div>

      {/* Right panel — full width on mobile, col 2-3 rows 1-2 on desktop */}
      <div data-testid="right-panel" className="md:row-span-2 md:col-span-2 border border-black dark:border-white flex-1 md:h-full flex flex-col min-h-0">
        {symbol ? (
          <>
            <div className="flex-1 min-h-0" style={{ minHeight: '120px' }}>
              <ComprehensiveArea symbol={symbol} />
            </div>
            <div className="border-t border-white/10 py-1 shrink-0 overflow-y-auto max-h-[45%]">
              <IndicatorSummary symbol={symbol} />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            Select a symbol
          </div>
        )}
      </div>

      {/* Timer — hidden on mobile, col 1 row 2 on desktop */}
      <div className="md:row-start-2 hidden md:flex border border-black dark:border-white items-center justify-center p-4">
        <CountdownTimer />
      </div>
    </>
  );
};

export default DashboardPage;
