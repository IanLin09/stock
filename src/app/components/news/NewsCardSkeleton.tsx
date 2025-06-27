'use client';

import { Card } from '@/components/ui/card';
import { useNewsLayout } from '@/hooks/useNewsLayout';

interface NewsCardSkeletonProps {
  minHeight?: string;
}

const NewsCardSkeleton = ({ minHeight }: NewsCardSkeletonProps) => {
  const { cardMinHeight, cardPadding } = useNewsLayout();

  const cardStyle = {
    minHeight: minHeight || cardMinHeight,
  };

  return (
    <div className="animate-pulse">
      <Card
        className={`rounded-xl shadow-md ${cardPadding || 'p-4'} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
        style={cardStyle}
      >
        {/* Image skeleton */}
        <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 sm:mb-3 md:mb-4">
          <div className="w-full h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-lg" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full">
            <div className="h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4">
            <div className="h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2">
            <div className="h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewsCardSkeleton;
