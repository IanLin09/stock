'use client';
import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  loadTime?: number;
  renderTime?: number;
  dataSize?: number;
  isVisible?: boolean;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  dataSize?: number;
  enableLogging?: boolean;
  threshold?: number; // Log if render time exceeds this (ms)
}

export const usePerformanceMonitor = ({
  componentName,
  dataSize = 0,
  enableLogging = process.env.NODE_ENV === 'development',
  threshold = 100
}: UsePerformanceMonitorOptions) => {
  const startTimeRef = useRef<number | undefined>(undefined);
  const renderStartRef = useRef<number | undefined>(undefined);
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    dataSize
  });

  // Start timing when component mounts
  useEffect(() => {
    startTimeRef.current = performance.now();
    renderStartRef.current = performance.now();
    
    return () => {
      // Component unmount cleanup
      if (enableLogging && startTimeRef.current) {
        const totalTime = performance.now() - startTimeRef.current;
        console.log(`${componentName} total lifecycle: ${totalTime.toFixed(2)}ms`);
      }
    };
  }, [componentName, enableLogging]);

  // Mark render completion
  const markRenderComplete = useCallback(() => {
    if (!renderStartRef.current) return;
    
    const renderTime = performance.now() - renderStartRef.current;
    metricsRef.current.renderTime = renderTime;
    
    if (enableLogging) {
      if (renderTime > threshold) {
        console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
      
      if (dataSize > 0) {
        console.log(`📊 Data size: ${dataSize} items`);
      }
    }
  }, [componentName, enableLogging, threshold, dataSize]);

  // Mark data load completion
  const markDataLoaded = useCallback(() => {
    if (!startTimeRef.current) return;
    
    const loadTime = performance.now() - startTimeRef.current;
    metricsRef.current.loadTime = loadTime;
    
    if (enableLogging) {
      console.log(`📡 ${componentName} data loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, [componentName, enableLogging]);

  // Track visibility changes
  const markVisibilityChange = useCallback((isVisible: boolean) => {
    metricsRef.current.isVisible = isVisible;
    
    if (enableLogging) {
      console.log(`👁️ ${componentName} visibility: ${isVisible ? 'visible' : 'hidden'}`);
    }
  }, [componentName, enableLogging]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Performance optimization helpers
  const shouldOptimizeRender = useCallback((currentDataSize: number): boolean => {
    // Suggest optimization if data size is large or render time was slow
    return currentDataSize > 1000 || (metricsRef.current.renderTime || 0) > threshold;
  }, [threshold]);

  return {
    markRenderComplete,
    markDataLoaded,
    markVisibilityChange,
    getMetrics,
    shouldOptimizeRender,
    isSlowRender: (metricsRef.current.renderTime || 0) > threshold
  };
};

// Hook for tracking intersection observer performance
export const useIntersectionPerformance = (componentName: string) => {
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);
  const visibilityStartRef = useRef<number | undefined>(undefined);

  const createObserver = useCallback((
    callback: (isVisible: boolean) => void,
    options?: IntersectionObserverInit
  ) => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        if (isVisible && !visibilityStartRef.current) {
          visibilityStartRef.current = performance.now();
        } else if (!isVisible && visibilityStartRef.current) {
          const visibleTime = performance.now() - visibilityStartRef.current;
          console.log(`👁️ ${componentName} was visible for ${visibleTime.toFixed(2)}ms`);
          visibilityStartRef.current = undefined;
        }
        
        callback(isVisible);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    return observerRef.current;
  }, [componentName]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return { createObserver, disconnect };
};

// Utility for measuring ApexCharts performance
export const measureChartPerformance = (chartType: string) => {
  const startTime = performance.now();
  
  return {
    markComplete: () => {
      const renderTime = performance.now() - startTime;
      console.log(`📊 ${chartType} chart rendered in ${renderTime.toFixed(2)}ms`);
      return renderTime;
    }
  };
};