'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint  
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  loadTime?: number;
  memoryUsage?: number;
}

/**
 * パフォーマンスモニタリングコンポーネント
 * Core Web Vitals 및 사용자 정의 메트릭 추적
 */
export function PerformanceMonitor({ 
  enabled = false,
  logToConsole = false 
}: {
  enabled?: boolean
  logToConsole?: boolean
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Core Web Vitals 측정
    const measureMetrics = () => {
      // Navigation Timing으로 기본 메트릭 측정
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          loadTime: navigation.loadEventEnd - navigation.navigationStart
        }));
      }

      // 메모리 사용량 측정
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024) // MB
        }));
      }
    };

    // FCP 측정
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP measurement not supported');
    }

    // 초기 측정
    measureMetrics();

    // 주기적 업데이트
    const interval = setInterval(measureMetrics, 5000);

    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (logToConsole && Object.keys(metrics).length > 0) {
      console.table(metrics);
    }
  }, [metrics, logToConsole]);

  // 성능 등급 계산
  const getGrade = (): string => {
    let score = 0;
    let total = 0;

    if (metrics.fcp !== undefined) {
      total++;
      if (metrics.fcp <= 2500) score++;
      else if (metrics.fcp <= 4000) score += 0.5;
    }

    if (metrics.loadTime !== undefined) {
      total++;
      if (metrics.loadTime <= 3000) score++;
      else if (metrics.loadTime <= 5000) score += 0.5;
    }

    const percentage = total > 0 ? (score / total) * 100 : 0;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    return 'C';
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">⚡ Performance</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          getGrade() === 'A+' || getGrade() === 'A' ? 'bg-green-500' :
          getGrade() === 'B' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {getGrade()}
        </span>
      </div>
      
      <div className="space-y-1">
        {metrics.fcp && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span>{Math.round(metrics.fcp)}ms</span>
          </div>
        )}
        {metrics.loadTime && (
          <div className="flex justify-between">
            <span>Load:</span>
            <span>{Math.round(metrics.loadTime)}ms</span>
          </div>
        )}
        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{Math.round(metrics.memoryUsage)}MB</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceMonitor; 