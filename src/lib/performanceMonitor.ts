// 성능 모니터링 시스템
// Core Web Vitals、メモリ使用量、ネットワーク分析

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

export interface NetworkMetrics {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps  
  latency: number; // ms
  connectionType: string;
  effectiveType: string;
}

export interface PerformanceReport {
  timestamp: Date;
  coreWebVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  networkMetrics: NetworkMetrics;
  pageLoadTime: number;
  resourceLoadTime: number;
  bundleSize: number;
  score: number; // 0-100
  recommendations: string[];
  warnings: string[];
}

export interface PerformanceThresholds {
  FCP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  memoryUsage: { warning: number; critical: number };
}

class PerformanceMonitor {
  private metrics: PerformanceReport[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private vitals: Partial<CoreWebVitals> = {};
  private isMonitoring = false;

  private thresholds: PerformanceThresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    memoryUsage: { warning: 70, critical: 90 }
  };

  constructor() {
    this.setupObservers();
  }

  // パフォーマンス観測開始
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.measureCoreWebVitals();
    this.schedulePeriodicReports();
    
    console.log('🚀 パフォーマンス監視開始');
  }

  // Core Web Vitals測定
  private measureCoreWebVitals(): void {
    // FCP (First Contentful Paint)
    this.setupPerformanceObserver('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.vitals.FCP = entry.startTime;
        }
      }
    });

    // LCP (Largest Contentful Paint)
    this.setupPerformanceObserver('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.vitals.LCP = lastEntry.startTime;
    });

    // FID (First Input Delay) - 代替としてevent timingを使用
    this.setupPerformanceObserver('event', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-input') {
          this.vitals.FID = entry.processingStart - entry.startTime;
        }
      }
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.setupPerformanceObserver('layout-shift', (entries) => {
      for (const entry of entries as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.vitals.CLS = clsValue;
    });

    // TTFB (Time to First Byte)
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      this.vitals.TTFB = navigation.responseStart - navigation.requestStart;
    }
  }

  // パフォーマンス観測器設定
  private setupPerformanceObserver(type: string, callback: (entries: any[]) => void): void {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) {
      console.warn(`Performance Observer type "${type}" is not supported`);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    try {
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.error(`Failed to observe ${type}:`, error);
    }
  }

  // メモリメトリクス取得
  private getMemoryMetrics(): MemoryMetrics {
    const memory = (performance as any).memory;
    
    if (!memory) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryUsagePercentage: 0
      };
    }

    const usedJSHeapSize = memory.usedJSHeapSize;
    const totalJSHeapSize = memory.totalJSHeapSize;
    const jsHeapSizeLimit = memory.jsHeapSizeLimit;
    const memoryUsagePercentage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

    return {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      memoryUsagePercentage
    };
  }

  // ネットワークメトリクス取得
  private getNetworkMetrics(): NetworkMetrics {
    const connection = (navigator as any).connection;
    
    if (!connection) {
      return {
        downloadSpeed: 0,
        uploadSpeed: 0,
        latency: 0,
        connectionType: 'unknown',
        effectiveType: 'unknown'
      };
    }

    return {
      downloadSpeed: connection.downlink || 0,
      uploadSpeed: connection.uplink || 0,
      latency: connection.rtt || 0,
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown'
    };
  }

  // ページロード時間計算
  private getPageLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    return navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
  }

  // リソースロード時間計算
  private getResourceLoadTime(): number {
    const resources = performance.getEntriesByType('resource') as any[];
    const totalDuration = resources.reduce((total, resource) => {
      return total + resource.duration;
    }, 0);
    return resources.length > 0 ? totalDuration / resources.length : 0;
  }

  // バンドルサイズ計算
  private getBundleSize(): number {
    const resources = performance.getEntriesByType('resource') as any[];
    return resources.reduce((total, resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        return total + (resource.transferSize || 0);
      }
      return total;
    }, 0);
  }

  // パフォーマンススコア計算
  private calculateScore(vitals: CoreWebVitals, memory: MemoryMetrics): number {
    let score = 100;

    // Core Web Vitalsスコア
    if (vitals.FCP > this.thresholds.FCP.poor) score -= 20;
    else if (vitals.FCP > this.thresholds.FCP.good) score -= 10;

    if (vitals.LCP > this.thresholds.LCP.poor) score -= 25;
    else if (vitals.LCP > this.thresholds.LCP.good) score -= 15;

    if (vitals.FID > this.thresholds.FID.poor) score -= 20;
    else if (vitals.FID > this.thresholds.FID.good) score -= 10;

    if (vitals.CLS > this.thresholds.CLS.poor) score -= 20;
    else if (vitals.CLS > this.thresholds.CLS.good) score -= 10;

    // メモリ使用量スコア
    if (memory.memoryUsagePercentage > this.thresholds.memoryUsage.critical) score -= 15;
    else if (memory.memoryUsagePercentage > this.thresholds.memoryUsage.warning) score -= 10;

    return Math.max(0, score);
  }

  // 推奨事項生成
  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = [];

    // Core Web Vitals改善提案
    if (report.coreWebVitals.LCP > this.thresholds.LCP.good) {
      recommendations.push('画像最適化: WebP形式使用、遅延読み込み実装');
      recommendations.push('リソース優先読み込み: 重要なコンテンツのpreload設定');
    }

    if (report.coreWebVitals.FID > this.thresholds.FID.good) {
      recommendations.push('JavaScript最適化: コード分割、不要な処理の削除');
      recommendations.push('メインスレッド負荷軽減: Web Workersの活用');
    }

    if (report.coreWebVitals.CLS > this.thresholds.CLS.good) {
      recommendations.push('レイアウト安定化: 画像・動画のサイズ事前指定');
      recommendations.push('フォント最適化: フォント表示の最適化設定');
    }

    // メモリ最適化
    if (report.memoryMetrics.memoryUsagePercentage > this.thresholds.memoryUsage.warning) {
      recommendations.push('メモリ最適化: 不要なオブジェクト参照の削除');
      recommendations.push('ガベージコレクション: 定期的なメモリクリーンアップ');
    }

    // ネットワーク最適化
    if (report.networkMetrics.downloadSpeed < 10) {
      recommendations.push('低速回線対応: 軽量版コンテンツの提供');
      recommendations.push('キャッシュ最適化: Service Workerの活用');
    }

    return recommendations;
  }

  // 警告生成
  private generateWarnings(report: PerformanceReport): string[] {
    const warnings: string[] = [];

    if (report.coreWebVitals.LCP > this.thresholds.LCP.poor) {
      warnings.push('重要: ページ読み込みが非常に遅いです');
    }

    if (report.memoryMetrics.memoryUsagePercentage > this.thresholds.memoryUsage.critical) {
      warnings.push('警告: メモリ使用量が限界に近づいています');
    }

    if (report.score < 50) {
      warnings.push('緊急: パフォーマンススコアが低すぎます');
    }

    return warnings;
  }

  // パフォーマンスレポート生成
  generateReport(): PerformanceReport {
    const coreWebVitals: CoreWebVitals = {
      FCP: this.vitals.FCP || 0,
      LCP: this.vitals.LCP || 0,
      FID: this.vitals.FID || 0,
      CLS: this.vitals.CLS || 0,
      TTFB: this.vitals.TTFB || 0
    };

    const memoryMetrics = this.getMemoryMetrics();
    const networkMetrics = this.getNetworkMetrics();
    const pageLoadTime = this.getPageLoadTime();
    const resourceLoadTime = this.getResourceLoadTime();
    const bundleSize = this.getBundleSize();
    const score = this.calculateScore(coreWebVitals, memoryMetrics);

    const report: PerformanceReport = {
      timestamp: new Date(),
      coreWebVitals,
      memoryMetrics,
      networkMetrics,
      pageLoadTime,
      resourceLoadTime,
      bundleSize,
      score,
      recommendations: [],
      warnings: []
    };

    report.recommendations = this.generateRecommendations(report);
    report.warnings = this.generateWarnings(report);

    this.metrics.push(report);
    return report;
  }

  // 定期レポート設定
  private schedulePeriodicReports(): void {
    // 5分ごとにレポート生成
    setInterval(() => {
      const report = this.generateReport();
      this.onReportGenerated(report);
    }, 5 * 60 * 1000);
  }

  // レポート生成時の処理
  private onReportGenerated(report: PerformanceReport): void {
    console.group('📊 パフォーマンスレポート');
    console.log('スコア:', report.score);
    console.log('Core Web Vitals:', report.coreWebVitals);
    console.log('メモリ使用率:', `${report.memoryMetrics.memoryUsagePercentage.toFixed(1)}%`);
    
    if (report.warnings.length > 0) {
      console.warn('警告:', report.warnings);
    }
    
    if (report.recommendations.length > 0) {
      console.info('推奨事項:', report.recommendations);
    }
    
    console.groupEnd();
  }

  // 最適化実行
  async optimizePerformance(): Promise<void> {
    console.log('🔧 パフォーマンス最適化開始...');

    // メモリクリーンアップ
    this.cleanupMemory();

    // 不要なリソースの削除
    this.cleanupResources();

    // キャッシュ最適化
    await this.optimizeCache();

    console.log('✅ パフォーマンス最適化完了');
  }

  // メモリクリーンアップ
  private cleanupMemory(): void {
    // ガベージコレクションの促進
    if (window.gc) {
      window.gc();
    }

    // 不要なイベントリスナーの削除
    // (実際の実装では具体的なクリーンアップロジックが必要)
  }

  // リソースクリーンアップ
  private cleanupResources(): void {
    // 不要なDOMノードの削除
    const unusedElements = document.querySelectorAll('[data-cleanup="true"]');
    unusedElements.forEach(element => element.remove());

    // 古い画像キャッシュの削除
    // (実際の実装では具体的なクリーンアップロジックが必要)
  }

  // キャッシュ最適化
  private async optimizeCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      // 古いキャッシュの削除
      const oldCaches = cacheNames.filter(name => 
        name.includes('old') || name.includes('deprecated')
      );

      await Promise.all(
        oldCaches.map(name => caches.delete(name))
      );
    }
  }

  // 監視停止
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // すべてのオブザーバーを停止
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    console.log('⏹️ パフォーマンス監視停止');
  }

  // 設定変更
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // メトリクス取得
  getMetrics(): PerformanceReport[] {
    return [...this.metrics];
  }

  // 最新レポート取得
  getLatestReport(): PerformanceReport | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // クリーンアップ
  destroy(): void {
    this.stopMonitoring();
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor(); 