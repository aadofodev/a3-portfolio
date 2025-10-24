/* Web Vitals Monitoring
 * 
 * Tracks Core Web Vitals metrics and sends them to analytics
 * Based on Google's web-vitals library
 */

(function() {
    'use strict';
    
    const __DEV__ = false; // Set to true for development logging

    // Store metrics
    const metrics = {
        LCP: null,  // Largest Contentful Paint
        FID: null,  // First Input Delay
        CLS: null,  // Cumulative Layout Shift
        FCP: null,  // First Contentful Paint
        TTFB: null  // Time to First Byte
    };

    // Report metric to analytics (customize this function)
    function sendToAnalytics(metric) {
        if (__DEV__) {
            console.log('Web Vital:', metric.name, metric.value, metric);
        }
        
        // TODO: Send to your analytics service
        // Example for Google Analytics 4:
        // gtag('event', metric.name, {
        //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        //     metric_id: metric.id,
        //     metric_value: metric.value,
        //     metric_delta: metric.delta
        // });
    }

    // Largest Contentful Paint (LCP)
    function getLCP() {
        let lcp = null;
        
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            lcp = {
                name: 'LCP',
                value: lastEntry.renderTime || lastEntry.loadTime,
                id: generateUniqueId(),
                delta: lastEntry.renderTime || lastEntry.loadTime,
                entries: [lastEntry]
            };
            
            metrics.LCP = lcp;
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && lcp) {
                sendToAnalytics(lcp);
                observer.disconnect();
            }
        });
    }

    // First Input Delay (FID)
    function getFID() {
        const observer = new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            
            const fid = {
                name: 'FID',
                value: firstInput.processingStart - firstInput.startTime,
                id: generateUniqueId(),
                delta: firstInput.processingStart - firstInput.startTime,
                entries: [firstInput]
            };
            
            metrics.FID = fid;
            sendToAnalytics(fid);
            observer.disconnect();
        });
        
        observer.observe({ type: 'first-input', buffered: true });
    }

    // Cumulative Layout Shift (CLS)
    function getCLS() {
        let clsValue = 0;
        let clsEntries = [];
        
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push(entry);
                }
            }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                const cls = {
                    name: 'CLS',
                    value: clsValue,
                    id: generateUniqueId(),
                    delta: clsValue,
                    entries: clsEntries
                };
                
                metrics.CLS = cls;
                sendToAnalytics(cls);
                observer.disconnect();
            }
        });
    }

    // First Contentful Paint (FCP)
    function getFCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            for (const entry of entries) {
                if (entry.name === 'first-contentful-paint') {
                    const fcp = {
                        name: 'FCP',
                        value: entry.startTime,
                        id: generateUniqueId(),
                        delta: entry.startTime,
                        entries: [entry]
                    };
                    
                    metrics.FCP = fcp;
                    sendToAnalytics(fcp);
                    observer.disconnect();
                }
            }
        });
        
        observer.observe({ type: 'paint', buffered: true });
    }

    // Time to First Byte (TTFB)
    function getTTFB() {
        if (!performance.timing) return;
        
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        
        if (navigationEntry) {
            const ttfb = {
                name: 'TTFB',
                value: navigationEntry.responseStart - navigationEntry.requestStart,
                id: generateUniqueId(),
                delta: navigationEntry.responseStart - navigationEntry.requestStart,
                entries: [navigationEntry]
            };
            
            metrics.TTFB = ttfb;
            sendToAnalytics(ttfb);
        }
    }

    // Generate unique ID for each metric
    function generateUniqueId() {
        return `v3-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Public API to get current metrics
    window.getWebVitals = function() {
        return { ...metrics };
    };

    // Initialize all metrics
    function initWebVitals() {
        if (!('PerformanceObserver' in window)) {
            if (__DEV__) console.warn('PerformanceObserver not supported');
            return;
        }
        
        getLCP();
        getFID();
        getCLS();
        getFCP();
        
        if (document.readyState === 'complete') {
            getTTFB();
        } else {
            window.addEventListener('load', getTTFB);
        }
        
        if (__DEV__) {
            console.log('Web Vitals monitoring initialized');
        }
    }

    // Start monitoring when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWebVitals);
    } else {
        initWebVitals();
    }

    // Display metrics in console on demand (development only)
    if (__DEV__) {
        window.showWebVitals = function() {
            console.table(metrics);
        };
    }
})();