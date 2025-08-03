// パフォーマンス監視フックシステム
// 실시간 성능 지표 모니터링 및 최적화 제안

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CoreWebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint  
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercentage: number;
}

export interface PerformanceReport {
  timestamp: Date;
  coreWebVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  pageLoadTime: number;
  bundleSize: number;
  score: number; // 0-100
  recommendations: string[];
  warnings: string[];
}

// メインパフォーマンス監視フック
export const usePerformanceMonitor = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceReport[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateReport = useCallback((): PerformanceReport => {
    // Core Web Vitals取得
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const paintEntries = performance.getEntriesByType('paint');
    
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = (performance as any).getEntriesByType?.('largest-contentful-paint')?.[0]?.startTime || 0;
    
    const coreWebVitals: CoreWebVitals = {
      FCP: fcp,
      LCP: lcp,
      FID: 0, // 실제 측정은 복잡하므로 임시값
      CLS: 0, // 실제 측정은 복잡하므로 임시값
      TTFB: navigation ? navigation.responseStart - navigation.requestStart : 0
    };

    // メモリメトリクス取得
    const memory = (performance as any).memory;
    const memoryMetrics: MemoryMetrics = {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
      memoryUsagePercentage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0
    };

    // 기타 메트릭
    const pageLoadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
    
    const resources = performance.getEntriesByType('resource') as any[];
    const bundleSize = resources.reduce((total, resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        return total + (resource.transferSize || 0);
      }
      return total;
    }, 0);

    // パフォーマンススコア計算
    let score = 100;
    if (coreWebVitals.FCP > 3000) score -= 20;
    else if (coreWebVitals.FCP > 1800) score -= 10;
    
    if (coreWebVitals.LCP > 4000) score -= 25;
    else if (coreWebVitals.LCP > 2500) score -= 15;
    
    if (memoryMetrics.memoryUsagePercentage > 90) score -= 15;
    else if (memoryMetrics.memoryUsagePercentage > 70) score -= 10;

    // 推奨事項生成
    const recommendations: string[] = [];
    if (coreWebVitals.LCP > 2500) {
      recommendations.push('画像最適化: WebP形式使用推奨');
      recommendations.push('コード分割: 重要でないリソースの遅延ロード');
    }
    if (memoryMetrics.memoryUsagePercentage > 70) {
      recommendations.push('メモリ最適化: 不要なオブジェクト参照を削除');
    }
    if (bundleSize > 1024 * 1024) { // 1MB以上
      recommendations.push('バンドルサイズ削減: Tree shakingの実装');
    }

    // 警告生成
    const warnings: string[] = [];
    if (score < 50) warnings.push('パフォーマンススコアが低すぎます');
    if (memoryMetrics.memoryUsagePercentage > 90) warnings.push('メモリ使用量が危険レベルです');

    return {
      timestamp: new Date(),
      coreWebVitals,
      memoryMetrics,
      pageLoadTime,
      bundleSize,
      score: Math.max(0, score),
      recommendations,
      warnings
    };
  }, []);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // 즉시 첫 번째 리포트 생성
    const initialReport = generateReport();
    setReport(initialReport);
    setMetrics(prev => [...prev, initialReport]);

    // 5분마다 리포트 생성
    intervalRef.current = setInterval(() => {
      const newReport = generateReport();
      setReport(newReport);
      setMetrics(prev => [...prev.slice(-10), newReport]); // 최근 10개만 유지
    }, 5 * 60 * 1000);

    console.log('🚀 パフォーマンス監視開始');
  }, [isMonitoring, generateReport]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('⏹️ パフォーマンス監視停止');
  }, []);

  const optimizePerformance = useCallback(async () => {
    console.log('🔧 パフォーマンス最適化実行...');
    
    // ガベージコレクション促進
    if ((window as any).gc) {
      (window as any).gc();
    }

    // 불필요한 DOM 요소 정리
    const unusedElements = document.querySelectorAll('[data-cleanup="true"]');
    unusedElements.forEach(element => element.remove());

    // 캐시 최적화
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('old') || name.includes('deprecated')
      );
      await Promise.all(oldCaches.map(name => caches.delete(name)));
    }

    // 새로운 리포트 생성
    const optimizedReport = generateReport();
    setReport(optimizedReport);
    setMetrics(prev => [...prev.slice(-10), optimizedReport]);

    console.log('✅ パフォーマンス最適化完了');
  }, [generateReport]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    report,
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    optimizePerformance,
    generateReport
  };
};

// リアルタイムメトリクスフック
export const useRealTimeMetrics = (interval = 1000) => {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    loadTime: 0,
    resourceCount: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      const memory = (performance as any).memory;
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      const resources = performance.getEntriesByType('resource');

      setMetrics({
        memoryUsage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0,
        loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        resourceCount: resources.length
      });
    };

    updateMetrics();
    const intervalId = setInterval(updateMetrics, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return metrics;
};

// Core Web Vitals専用フック
export const useCoreWebVitals = () => {
  const [vitals, setVitals] = useState<CoreWebVitals>({
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0
  });

  useEffect(() => {
    // FCP測定
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setVitals(prev => ({ ...prev, FCP: entry.startTime }));
        }
      }
    });

    // LCP測定
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
    });

    try {
      if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
        paintObserver.observe({ type: 'paint', buffered: true });
      }
      if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // TTFB計算
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      setVitals(prev => ({ 
        ...prev, 
        TTFB: navigation.responseStart - navigation.requestStart 
      }));
    }

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
    };
  }, []);

  return vitals;
};

// パフォーマンス最適化提案フック
export const usePerformanceSuggestions = (report: PerformanceReport | null) => {
  const [suggestions, setSuggestions] = useState<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
  }[]>([]);

  useEffect(() => {
    if (!report) return;

    const newSuggestions = [];

    // LCP最適化
    if (report.coreWebVitals.LCP > 4000) {
      newSuggestions.push({
        priority: 'high' as const,
        category: 'ロード速度',
        title: '画像最適化',
        description: 'WebP形式の採用と遅延ロード実装',
        impact: 'LCP 30-50% 改善'
      });
    }

    // メモリ最適化
    if (report.memoryMetrics.memoryUsagePercentage > 80) {
      newSuggestions.push({
        priority: 'high' as const,
        category: 'メモリ',
        title: 'メモリリーク修正',
        description: '不要なオブジェクト参照の削除',
        impact: 'メモリ使用量 20-40% 削減'
      });
    }

    // バンドルサイズ
    if (report.bundleSize > 2 * 1024 * 1024) { // 2MB以上
      newSuggestions.push({
        priority: 'medium' as const,
        category: 'バンドル',
        title: 'コード分割',
        description: 'ルート別の動的インポート実装',
        impact: '初期ロード 25-35% 高速化'
      });
    }

    setSuggestions(newSuggestions);
  }, [report]);

  return suggestions;
}; 