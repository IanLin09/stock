export const dynamic = 'force-dynamic';
import DashboardPage from '@/components/dashboard/data';

export default function Home() {
  return (
    <div className="h-full grid auto-rows-auto grid-cols-3 gap-4  text-black dark:text-white p-4">
      <DashboardPage />
    </div>
  );
}
