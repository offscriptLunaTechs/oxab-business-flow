
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
      
      // Log performance metrics
      console.log(`⚡ Performance: ${name} completed in ${duration.toFixed(2)}ms`);
      
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
      console.error(`❌ Performance: ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }) as T;
};

// Web Vitals monitoring
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Track LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('🎯 LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track FID (First Input Delay) - only if supported
    if ('PerformanceEventTiming' in window) {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // Use any for now since PerformanceEventTiming might not be available
          if (fidEntry.processingStart) {
            console.log('⚡ FID:', fidEntry.processingStart - fidEntry.startTime);
          }
        });
      }).observe({ entryTypes: ['first-input'] });
    }

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const layoutShiftEntry = entry as any; // Use any for layout shift entries
        if (layoutShiftEntry.hadRecentInput !== undefined && !layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
        }
      });
      console.log('📐 CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Initialize performance tracking
if (typeof window !== 'undefined') {
  trackWebVitals();
}
