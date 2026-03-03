export const dynamic = 'force-dynamic';
import DashboardPage from '@/components/dashboard/data';

export default function Home() {
  return (
    <div className="h-screen flex flex-col md:grid md:grid-rows-[calc(60.67%-12px)_calc(30.33%-12px)] md:grid-cols-3 gap-3 text-black dark:text-white p-3 overflow-hidden">
      <DashboardPage />
    </div>
  );
}
