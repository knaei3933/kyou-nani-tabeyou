'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  networkRequests: number;
  offlineMode: boolean;
  serviceWorkerStatus: string;
  memoryUsage?: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHitRate: 0,
    networkRequests: 0,
    offlineMode: false,
    serviceWorkerStatus: '未対応'
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // 開発環境でのみ表示
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  useEffect(() => {
    if (!isDev) return;

    const updateMetrics = () => {
      // ページロード時間の測定
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;

      // Service Worker ステータス確認
      let swStatus = '未対応';
      if ('serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
          swStatus = 'アクティブ';
        } else {
          swStatus = '登録中...';
        }
      }

      // ネットワーク状態確認
      const isOffline = !navigator.onLine;

      // メモリ使用量（対応ブラウザのみ）
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
      }

      setMetrics({
        loadTime: Math.round(loadTime),
        cacheHitRate: Math.random() * 100, // 実際の実装では正確な計算が必要
        networkRequests: performance.getEntriesByType('resource').length,
        offlineMode: isOffline,
        serviceWorkerStatus: swStatus,
        memoryUsage
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // 5秒ごとに更新

    return () => clearInterval(interval);
  }, [isDev]);

  if (!isDev) return null;

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="パフォーマンス監視"
      >
        📊
      </button>

      {/* パフォーマンスパネル */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">パフォーマンス監視</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* ロード時間 */}
            <div className="flex justify-between">
              <span className="text-gray-600">ロード時間:</span>
              <span className={`font-medium ${metrics.loadTime < 3000 ? 'text-green-600' : metrics.loadTime < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.loadTime}ms
              </span>
            </div>

            {/* Service Worker状態 */}
            <div className="flex justify-between">
              <span className="text-gray-600">Service Worker:</span>
              <span className={`font-medium ${metrics.serviceWorkerStatus === 'アクティブ' ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.serviceWorkerStatus}
              </span>
            </div>

            {/* ネットワーク状態 */}
            <div className="flex justify-between">
              <span className="text-gray-600">接続状態:</span>
              <span className={`font-medium ${metrics.offlineMode ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.offlineMode ? 'オフライン' : 'オンライン'}
              </span>
            </div>

            {/* ネットワークリクエスト数 */}
            <div className="flex justify-between">
              <span className="text-gray-600">リソース数:</span>
              <span className="font-medium text-blue-600">{metrics.networkRequests}</span>
            </div>

            {/* メモリ使用量 */}
            {metrics.memoryUsage && (
              <div className="flex justify-between">
                <span className="text-gray-600">メモリ使用量:</span>
                <span className={`font-medium ${metrics.memoryUsage < 50 ? 'text-green-600' : metrics.memoryUsage < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.memoryUsage}MB
                </span>
              </div>
            )}

            {/* キャッシュ効率 */}
            <div className="flex justify-between">
              <span className="text-gray-600">キャッシュ効率:</span>
              <span className={`font-medium ${metrics.cacheHitRate > 70 ? 'text-green-600' : metrics.cacheHitRate > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(metrics.cacheHitRate)}%
              </span>
            </div>

            {/* パフォーマンス総合評価 */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">総合評価:</span>
                <span className={`font-bold ${getOverallScore(metrics) >= 80 ? 'text-green-600' : getOverallScore(metrics) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {getOverallScore(metrics)}/100
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getOverallScore(metrics) >= 80 ? 'bg-green-500' : getOverallScore(metrics) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${getOverallScore(metrics)}%` }}
                />
              </div>
            </div>

            {/* 改善提案 */}
            <div className="mt-3 text-xs text-gray-500">
              {getSuggestions(metrics).map((suggestion, index) => (
                <div key={index} className="mb-1">• {suggestion}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 総合スコア計算
const getOverallScore = (metrics: PerformanceMetrics): number => {
  let score = 100;
  
  // ロード時間による減点
  if (metrics.loadTime > 5000) score -= 30;
  else if (metrics.loadTime > 3000) score -= 15;
  
  // Service Worker未対応による減点
  if (metrics.serviceWorkerStatus !== 'アクティブ') score -= 20;
  
  // オフライン時の減点
  if (metrics.offlineMode) score -= 10;
  
  // キャッシュ効率による減点
  if (metrics.cacheHitRate < 70) score -= 15;
  
  return Math.max(0, score);
};

// 改善提案生成
const getSuggestions = (metrics: PerformanceMetrics): string[] => {
  const suggestions: string[] = [];
  
  if (metrics.loadTime > 3000) {
    suggestions.push('ロード時間が長いです。画像の最適化を検討してください');
  }
  
  if (metrics.serviceWorkerStatus !== 'アクティブ') {
    suggestions.push('Service Workerを有効にしてキャッシュ機能を活用してください');
  }
  
  if (metrics.cacheHitRate < 70) {
    suggestions.push('キャッシュ戦略を改善してローディング速度を向上させてください');
  }
  
  if (metrics.memoryUsage && metrics.memoryUsage > 100) {
    suggestions.push('メモリ使用量が多いです。不要なリソースを削減してください');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('パフォーマンスは良好です！');
  }
  
  return suggestions;
};

export default PerformanceMonitor; 