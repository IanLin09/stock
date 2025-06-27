import {
  useScreenSize,
  useResponsiveValue,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from '@/hooks/use-responsive';

export const useNewsLayout = () => {
  const screenSize = useScreenSize();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  // 使用 useResponsiveValue 來獲取響應式值
  const cardsPerRow = useResponsiveValue({
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  });

  const loadMoreIncrement = useResponsiveValue({
    xs: 6,
    sm: 6,
    md: 8,
    lg: 9,
    xl: 12,
    '2xl': 12,
  });

  const cardMinHeight = useResponsiveValue({
    xs: '280px',
    sm: '300px',
    md: '320px',
    lg: '360px',
    xl: '380px',
    '2xl': '400px',
  });

  const imageHeight = useResponsiveValue({
    xs: 'h-32',
    sm: 'h-36',
    md: 'h-40',
    lg: 'h-48',
    xl: 'h-52',
    '2xl': 'h-56',
  });

  const containerPadding = useResponsiveValue({
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-6',
    '2xl': 'p-8',
  });

  const gridGap = useResponsiveValue({
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-5',
    xl: 'gap-6',
    '2xl': 'gap-6',
  });

  const gridCols = useResponsiveValue({
    xs: 'grid-cols-1',
    sm: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-3',
    xl: 'grid-cols-4',
    '2xl': 'grid-cols-4',
  });

  const cardPadding = useResponsiveValue({
    xs: 'p-3',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-6',
    '2xl': 'p-8',
  });

  const titleFontSize = useResponsiveValue({
    xs: 'text-sm',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-lg',
    '2xl': 'text-xl',
  });

  const titleLineHeight = useResponsiveValue({
    xs: 'leading-5',
    sm: 'leading-5',
    md: 'leading-6',
    lg: 'leading-7',
    xl: 'leading-8',
    '2xl': 'leading-8',
  });

  const titleLineClamp = useResponsiveValue({
    xs: 'line-clamp-3',
    sm: 'line-clamp-3',
    md: 'line-clamp-3',
    lg: 'line-clamp-3',
    xl: 'line-clamp-3',
    '2xl': 'line-clamp-3',
  });

  // 字數限制配置 - 根據螢幕大小調整
  const maxCharacters = useResponsiveValue({
    xs: 80,
    sm: 90,
    md: 100,
    lg: 120,
    xl: 140,
    '2xl': 160,
  });

  // 固定高度配置 - 確保所有卡片統一高度
  const fixedCardHeight = useResponsiveValue({
    xs: '320px',
    sm: '340px',
    md: '360px',
    lg: '380px',
    xl: '400px',
    '2xl': '420px',
  });

  return {
    // 基礎響應式狀態
    screenSize,
    isMobile,
    isTablet,
    isDesktop,

    // 佈局配置
    cardsPerRow: cardsPerRow || 3,
    loadMoreIncrement: loadMoreIncrement || 9,
    cardMinHeight: cardMinHeight || '320px',

    // CSS 類名
    imageHeight: imageHeight || 'h-40',
    containerPadding: containerPadding || 'p-4',
    gridGap: gridGap || 'gap-4',
    gridCols: gridCols || 'grid-cols-3',
    cardPadding: cardPadding || 'p-4',
    titleFontSize: titleFontSize || 'text-base',
    titleLineHeight: titleLineHeight || 'leading-6',
    titleLineClamp: titleLineClamp || 'line-clamp-4',

    // 新增配置
    maxCharacters: maxCharacters || 100,
    fixedCardHeight: fixedCardHeight || '360px',

    // 工具函數
    getImageClasses: () =>
      `w-full ${imageHeight || 'h-40'} object-cover rounded-lg`,
    getCardClasses: () =>
      `rounded-xl shadow-md ${cardPadding || 'p-4'} transition-shadow duration-200 touch-manipulation active:opacity-90 md:hover:shadow-lg`,
    getTitleClasses: () =>
      `${titleFontSize || 'text-base'} ${titleLineHeight || 'leading-6'} ${titleLineClamp || 'line-clamp-3'} font-medium hover:text-primary transition-colors`,
    getContainerClasses: () =>
      `${containerPadding || 'p-4'} grid ${gridCols || 'grid-cols-3'} ${gridGap || 'gap-4'}`,
    
    // 文字截斷工具函數
    truncateText: (text: string, maxLength?: number) => {
      const limit = maxLength || maxCharacters || 100;
      if (text.length <= limit) return text;
      
      // 在最後一個完整單詞處截斷，避免截斷單詞中間
      const truncated = text.substring(0, limit);
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      
      if (lastSpaceIndex > limit * 0.8) {
        return truncated.substring(0, lastSpaceIndex) + '...';
      }
      
      return truncated + '...';
    },
  };
};