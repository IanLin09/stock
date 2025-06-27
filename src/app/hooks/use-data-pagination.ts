'use client';
import { useState, useMemo, useCallback } from 'react';
import { useAnalysisBreakpoints } from './use-analysis-responsive';

interface UsePaginationOptions {
  initialPageSize?: number;
  maxItemsPerPage?: number;
  enableInfiniteScroll?: boolean;
  responsivePageSize?: boolean;
}

interface PaginationResult<T> {
  currentData: T[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  
  // Actions
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  loadMore: () => void; // For infinite scroll
  reset: () => void;
}

export const useDataPagination = <T>(
  data: T[] = [],
  options: UsePaginationOptions = {}
): PaginationResult<T> => {
  const {
    initialPageSize = 50,
    maxItemsPerPage = 200,
    enableInfiniteScroll = false,
    responsivePageSize = true
  } = options;

  const breakpoints = useAnalysisBreakpoints();
  
  // Calculate responsive page size based on screen size
  const responsiveSize = useMemo(() => {
    if (!responsivePageSize) return initialPageSize;
    
    switch (breakpoints.currentScreenSize) {
      case 'xs': return Math.min(20, initialPageSize); // Mobile: smaller pages
      case 'sm': return Math.min(30, initialPageSize); // Small tablet
      case 'md': return Math.min(50, initialPageSize); // Medium
      case 'lg': return Math.min(75, initialPageSize); // Large
      case 'xl': 
      case '2xl': return Math.min(100, initialPageSize); // Extra large
      default: return initialPageSize;
    }
  }, [breakpoints.currentScreenSize, initialPageSize, responsivePageSize]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(responsiveSize);
  const [loadedPages, setLoadedPages] = useState(1); // For infinite scroll

  // Update page size when screen size changes
  useMemo(() => {
    if (responsivePageSize) {
      setPageSizeState(responsiveSize);
    }
  }, [responsiveSize, responsivePageSize]);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // For infinite scroll, show data from page 1 to current loaded page
  const infiniteScrollEndIndex = enableInfiniteScroll 
    ? Math.min(loadedPages * pageSize, totalItems)
    : endIndex;
  
  const currentData = useMemo(() => {
    if (enableInfiniteScroll) {
      return data.slice(0, infiniteScrollEndIndex);
    }
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex, enableInfiniteScroll, infiniteScrollEndIndex]);

  // Navigation functions
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    const newSize = Math.max(1, Math.min(size, maxItemsPerPage));
    setPageSizeState(newSize);
    
    // Adjust current page to maintain roughly the same data position
    const currentStartIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(currentStartIndex / newSize) + 1;
    setCurrentPage(Math.max(1, newPage));
  }, [currentPage, pageSize, maxItemsPerPage]);

  const loadMore = useCallback(() => {
    if (enableInfiniteScroll && loadedPages < totalPages) {
      setLoadedPages(prev => prev + 1);
    }
  }, [enableInfiniteScroll, loadedPages, totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setLoadedPages(1);
    setPageSizeState(responsiveSize);
  }, [responsiveSize]);

  // Status booleans
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentData,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    startIndex,
    endIndex: enableInfiniteScroll ? infiniteScrollEndIndex : endIndex,
    
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    loadMore,
    reset
  };
};

// Hook for virtual scrolling performance optimization
export const useVirtualScrolling = <T>(
  data: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(data.length, startIndex + visibleItemCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return data.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [data, startIndex, endIndex, itemHeight]);

  const totalHeight = data.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex
  };
};

// Utility hook for optimized data loading
export const useOptimizedDataLoading = <T>(
  fetchData: () => Promise<T[]>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Don't refetch if data was loaded recently (within 30 seconds)
    if (!forceRefresh && timeSinceLastFetch < 30000 && data.length > 0) {
      return data;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      const newData = await fetchData();
      const loadTime = performance.now() - startTime;
      
      console.log(`📡 Data loaded in ${loadTime.toFixed(2)}ms (${newData.length} items)`);
      
      setData(newData);
      setLastFetchTime(now);
      return newData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load data');
      setError(error);
      console.error('Data loading error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchData, lastFetchTime, data.length, ...dependencies]);

  return {
    data,
    loading,
    error,
    loadData,
    refresh: () => loadData(true)
  };
};