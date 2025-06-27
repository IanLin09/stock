'use client';
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { NewsDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { handleError } from '@/utils/error';
import { getNews } from '@/utils/api';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';
import NewsGrid from './NewsGrid';
import NewsCardSkeleton from './NewsCardSkeleton';

const NewsData = () => {
  const { t } = useTranslation();
  const { loadMoreIncrement, getContainerClasses, fixedCardHeight } =
    useNewsLayout();
  const [limit, setLimit] = useState(loadMoreIncrement);

  const {
    data: allNews,
    isLoading,
    error,
  } = useQuery<NewsDTO[], Error>({
    queryKey: ['newsData'],
    queryFn: () => getNews(),
  });

  useEffect(() => {
    if (error) handleError(error, { context: 'Data Fetch' });
  }, [error]);

  // 骨架屏載入狀態
  if (isLoading) {
    return (
      <div className={getContainerClasses()}>
        {Array.from({ length: loadMoreIncrement }).map((_, index) => (
          <NewsCardSkeleton key={index} minHeight={fixedCardHeight} />
        ))}
      </div>
    );
  }

  const visibleNews = allNews?.slice(0, limit);
  return (
    <>
      {visibleNews && <NewsGrid news={visibleNews} />}

      {allNews && limit < allNews?.length && (
        <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
          <Button
            size="sm"
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base min-h-[44px] touch-manipulation active:scale-95 transition-transform duration-150"
            onClick={() => setLimit((prev) => prev + loadMoreIncrement)}
            aria-label={t('load_more_detail', {
              current: limit,
              total: allNews.length,
            })}
          >
            {t('load_more_remaining', { remaining: allNews.length - limit })}
          </Button>
        </div>
      )}
    </>
  );
};

export default NewsData;
