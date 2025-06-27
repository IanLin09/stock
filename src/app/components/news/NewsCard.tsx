'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NewsDTO } from '@/utils/dto';
import { useNewsLayout } from '@/hooks/useNewsLayout';
import { useTranslation } from 'react-i18next';

interface NewsCardProps {
  news: NewsDTO;
  minHeight?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

const NewsCard = ({
  news,
  minHeight,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
}: NewsCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const {
    getImageClasses,
    getCardClasses,
    getTitleClasses,
    fixedCardHeight,
    truncateText,
  } = useNewsLayout();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // 使用固定高度確保所有卡片統一
  const cardStyle = {
    height: minHeight || fixedCardHeight,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  // 截斷標題文字
  const truncatedHeadline = truncateText(news.headline);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(news.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl transition-all duration-200"
      onKeyDown={handleKeyDown}
      aria-label={`${t('news_read_article')}: ${truncatedHeadline}`}
      role="article"
      tabIndex={0}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
    >
      <Card className={getCardClasses()} style={cardStyle}>
        <CardHeader className="p-0 mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
          <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg overflow-hidden">
            {!imageError ? (
              <>
                {/* Loading placeholder */}
                {!imageLoaded && (
                  <div
                    className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center"
                    aria-label={t('news_image_loading')}
                    role="progressbar"
                    aria-busy="true"
                  >
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="sr-only">
                      {t('news_image_loading_detail')}
                    </span>
                  </div>
                )}

                {/* Actual image */}
                <img
                  src={news.image}
                  alt={news.headline}
                  className={`${getImageClasses()} transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              </>
            ) : (
              /* Error fallback */
              <div
                className="w-full h-full bg-gray-300 flex flex-col items-center justify-center text-gray-500"
                role="img"
                aria-label={t('news_image_error')}
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-center" aria-hidden="true">
                  {t('news_image_error')}
                </span>
                <span className="sr-only">{t('news_image_error_detail')}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-grow flex flex-col justify-start">
          <h3
            className={getTitleClasses()}
            role="heading"
            aria-level={3}
            title={news.headline}
          >
            {truncatedHeadline}
          </h3>
        </CardContent>
      </Card>
    </a>
  );
};

export default NewsCard;
