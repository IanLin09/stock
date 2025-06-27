'use client';

import { NewsDTO } from '@/utils/dto';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';
import NewsCard from './NewsCard';

interface NewsGridProps {
  news: NewsDTO[];
}

const NewsGrid = ({ news }: NewsGridProps) => {
  const { t } = useTranslation();
  const { getContainerClasses, fixedCardHeight } = useNewsLayout();

  return (
    <div
      className={getContainerClasses()}
      role="list"
      aria-label={t('news_list_aria_label', { count: news.length })}
    >
      {news.map((item, index) => (
        <div key={item.id} role="listitem">
          <NewsCard
            news={item}
            minHeight={fixedCardHeight}
            aria-posinset={index + 1}
            aria-setsize={news.length}
          />
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;
