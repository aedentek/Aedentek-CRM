import { useEffect } from 'react';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor navigation timing
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('🚀 Page Load Performance:', {
            domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
            loadComplete: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
            totalTime: Math.round(navEntry.loadEventEnd - navEntry.startTime),
            firstContentfulPaint: 'Use Lighthouse for this metric'
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  const measureComponentLoad = (componentName: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`⚡ ${componentName} loaded in ${Math.round(endTime - startTime)}ms`);
    };
  };

  return { measureComponentLoad };
};
