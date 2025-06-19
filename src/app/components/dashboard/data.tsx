'use client';
export const dynamic = 'force-dynamic';

import CountdownTimer from '@/components/dashboard/timer';
import DashboardList from '@/components/dashboard/list';
import { useState } from 'react';
import ComprehensiveArea from '@/components/dashboard/comprehensive';

const DashboardPage = () => {
  const [symbol, setSymbol] = useState<string>('');
  return (
    <>
      <div className="row-span-2 border border-black dark:border-white">
        <DashboardList setSymbol={setSymbol} />
      </div>
      <div className="row-span-3 col-span-2 border border-black dark:border-white">
        <ComprehensiveArea symbol={symbol} />
      </div>
      <div className="border border-black dark:border-white">
        <CountdownTimer />
      </div>
    </>
  );
};

export default DashboardPage;
