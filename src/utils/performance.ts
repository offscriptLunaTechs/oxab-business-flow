
import { logger } from './logger';

// Performance monitoring utilities
export const measurePerformance = <T extends (...args: any[]) => Promise<any>>(
  name: string, 
  fn: T
): T => {
  return (async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      // Log performance metrics using our centralized logger
      logger.info(`Performance: ${name} completed`, {
        duration: `${duration.toFixed(2)}ms`,
        name,
      });
      
      // Report to analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'timing_complete', {
          name: name,
          value: Math.round(duration)
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Performance: ${name} failed`, {
        duration: `${duration.toFixed(2)}ms`,
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }) as T;
};

// Web Vitals monitoring with centralized logging
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Track LCP (Largest Contentful Paint)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        logger.info('Web Vitals: LCP recorded', {
          metric: 'LCP',
          value: `${lastEntry.startTime.toFixed(2)}ms`,
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      logger.warn('LCP monitoring not supported', error);
    }

    // Track FID (First Input Delay) - only if supported
    try {
      if ('PerformanceEventTiming' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any;
            if (fidEntry.processingStart) {
              const fid = fidEntry.processingStart - fidEntry.startTime;
              logger.info('Web Vitals: FID recorded', {
                metric: 'FID',
                value: `${fid.toFixed(2)}ms`,
              });
            }
          });
        }).observe({ entryTypes: ['first-input'] });
      }
    } catch (error) {
      logger.warn('FID monitoring not supported', error);
    }

    // Track CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as any;
          if (layoutShiftEntry.hadRecentInput !== undefined && !layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
          }
        });
        logger.info('Web Vitals: CLS updated', {
          metric: 'CLS',
          value: clsValue.toFixed(4),
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.warn('CLS monitoring not supported', error);
    }
  }
};

// Initialize performance tracking
if (typeof window !== 'undefined') {
  trackWebVitals();
}
