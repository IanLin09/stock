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
      <div className="border border-black dark:border-white h-full flex flex-col">
        <DashboardList setSymbol={setSymbol} />
      </div>
      <div className="row-span-2 col-span-2 border border-black dark:border-white h-full flex flex-col">
        {symbol ? (
          <>
            <div className="flex-1 min-h-0">
              <ComprehensiveArea symbol={symbol} />
            </div>
            <div className="border-t border-white/10 py-2">
              <IndicatorSummary symbol={symbol} />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            Select a symbol
          </div>
        )}
      </div>
      <div className="row-start-2 border border-black dark:border-white flex items-center justify-center p-4">
        <CountdownTimer />
      </div>
    </>
  );
};

export default DashboardPage;
