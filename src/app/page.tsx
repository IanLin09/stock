'use client';
import CountdownTimer from './components/dashboard/timer';
import DashboardList from './components/dashboard/list';
import { useState } from 'react';
import ComprehensiveArea from './components/dashboard/comprehensive';

export default function Home() {
  const [symbol, setSymbol] = useState<string>('');
  return (
    <div className="h-full grid auto-rows-auto grid-cols-3 gap-4  text-black dark:text-white p-4">
      <div className="row-span-2 border border-black dark:border-white">
        <DashboardList setSymbol={setSymbol} />
      </div>
      <div className="row-span-3 col-span-2 border border-black dark:border-white">
        <ComprehensiveArea symbol={symbol} />
      </div>
      <div className="border border-black dark:border-white">
        <CountdownTimer />
      </div>
    </div>
  );
}
