// パフォーマンス監視ダッシュボード
// Core Web Vitals、メモリ使用量、最適化提案の表示

'use client';

import React, { useState, useEffect } from 'react';

interface CoreWebVitals {
  FCP: number;
  LCP: number;
  FID: number;
  CLS: number;
  TTFB: number;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercentage: number;
}

interface PerformanceReport {
  timestamp: Date;
  coreWebVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  pageLoadTime: number;
  bundleSize: number;
  score: number;
  recommendations: string[];
  warnings: string[];
}

interface PerformanceDashboardProps {
  className?: string;
  autoStart?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  autoStart = false
}) => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceReport[]>([]);

  // パフォーマンスレポート生成
  const generateReport = (): PerformanceReport => {
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const paintEntries = performance.getEntriesByType('paint');
    
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    
    const coreWebVitals: CoreWebVitals = {
      FCP: fcp,
      LCP: 0,
      FID: 0,
      CLS: 0,
      TTFB: navigation ? navigation.responseStart - navigation.requestStart : 0
    };

    const memory = (performance as any).memory;
    const memoryMetrics: MemoryMetrics = {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
      memoryUsagePercentage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0
    };

    const pageLoadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
    
    const resources = performance.getEntriesByType('resource') as any[];
    const bundleSize = resources.reduce((total: number, resource: any) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        return total + (resource.transferSize || 0);
      }
      return total;
    }, 0);

    let score = 100;
    if (coreWebVitals.FCP > 3000) score -= 20;
    if (memoryMetrics.memoryUsagePercentage > 80) score -= 15;

    const recommendations: string[] = [];
    if (coreWebVitals.FCP > 1800) recommendations.push('画像最適化推奨');
    if (memoryMetrics.memoryUsagePercentage > 70) recommendations.push('メモリ最適化必要');

    const warnings: string[] = [];
    if (score < 50) warnings.push('パフォーマンス改善が必要');

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
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    setIsMonitoring(true);
    const initialReport = generateReport();
    setReport(initialReport);
    setMetrics((prev: PerformanceReport[]) => [...prev, initialReport]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const optimizePerformance = async () => {
    if ((window as any).gc) {
      (window as any).gc();
    }
    const optimizedReport = generateReport();
    setReport(optimizedReport);
  };

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
  }, [autoStart]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`performance-dashboard ${className}`}>
      {/* ヘッダー */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          📊 パフォーマンス監視
        </h2>
        <div className="dashboard-controls">
          <button
            onClick={startMonitoring}
            disabled={isMonitoring}
            className="control-btn start-btn"
          >
            {isMonitoring ? '監視中' : '監視開始'}
          </button>
          <button
            onClick={stopMonitoring}
            disabled={!isMonitoring}
            className="control-btn stop-btn"
          >
            停止
          </button>
          <button
            onClick={optimizePerformance}
            className="control-btn optimize-btn"
          >
            最適化実行
          </button>
        </div>
      </div>

      {report && (
        <div className="dashboard-content">
          {/* スコア表示 */}
          <div className="score-section">
            <div className="score-circle">
              <div 
                className="score-value"
                style={{ color: getScoreColor(report.score) }}
              >
                {report.score}
              </div>
              <div className="score-label">パフォーマンススコア</div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="metrics-section">
            <h3 className="section-title">Core Web Vitals</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">FCP</div>
                <div className="metric-value">
                  {report.coreWebVitals.FCP.toFixed(0)}ms
                </div>
                <div className="metric-status">
                  {report.coreWebVitals.FCP < 1800 ? '良好' : '改善必要'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">TTFB</div>
                <div className="metric-value">
                  {report.coreWebVitals.TTFB.toFixed(0)}ms
                </div>
                <div className="metric-status">
                  {report.coreWebVitals.TTFB < 600 ? '良好' : '改善必要'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">ページロード</div>
                <div className="metric-value">
                  {report.pageLoadTime.toFixed(0)}ms
                </div>
                <div className="metric-status">
                  {report.pageLoadTime < 3000 ? '良好' : '改善必要'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">バンドルサイズ</div>
                <div className="metric-value">
                  {formatBytes(report.bundleSize)}
                </div>
                <div className="metric-status">
                  {report.bundleSize < 1024 * 1024 ? '良好' : '改善必要'}
                </div>
              </div>
            </div>
          </div>

          {/* メモリ使用量 */}
          <div className="memory-section">
            <h3 className="section-title">メモリ使用量</h3>
            <div className="memory-bar">
              <div 
                className="memory-fill"
                style={{ 
                  width: `${report.memoryMetrics.memoryUsagePercentage}%`,
                  backgroundColor: report.memoryMetrics.memoryUsagePercentage > 80 ? '#ef4444' : '#10b981'
                }}
              />
            </div>
            <div className="memory-details">
              <span>使用中: {formatBytes(report.memoryMetrics.usedJSHeapSize)}</span>
              <span>制限: {formatBytes(report.memoryMetrics.jsHeapSizeLimit)}</span>
              <span>{report.memoryMetrics.memoryUsagePercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* 警告 */}
          {report.warnings.length > 0 && (
            <div className="warnings-section">
              <h3 className="section-title">⚠️ 警告</h3>
              <ul className="warnings-list">
                {report.warnings.map((warning: string, index: number) => (
                  <li key={index} className="warning-item">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 推奨事項 */}
          {report.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3 className="section-title">💡 推奨事項</h3>
              <ul className="recommendations-list">
                {report.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="recommendation-item">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* タイムスタンプ */}
          <div className="timestamp">
            最終更新: {report.timestamp.toLocaleTimeString()}
          </div>
        </div>
      )}

      <style>{`
        .performance-dashboard {
          background: var(--color-surface, rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border, rgba(255, 255, 255, 0.2));
          border-radius: 16px;
          padding: 1.5rem;
          margin: 1rem 0;
          max-width: 800px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .dashboard-controls {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all var(--duration-normal, 250ms);
        }

        .start-btn {
          background: #10b981;
          color: white;
        }

        .start-btn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .stop-btn {
          background: #ef4444;
          color: white;
        }

        .stop-btn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .optimize-btn {
          background: #3b82f6;
          color: white;
        }

        .control-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .score-section {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .score-circle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: white;
          text-align: center;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 800;
        }

        .score-label {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .metrics-section,
        .memory-section,
        .warnings-section,
        .recommendations-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }

        .metric-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          background: #10b981;
          color: white;
          display: inline-block;
        }

        .memory-bar {
          width: 100%;
          height: 20px;
          background: var(--color-surface);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .memory-fill {
          height: 100%;
          transition: all var(--duration-normal, 250ms);
        }

        .memory-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .warnings-list,
        .recommendations-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .warning-item,
        .recommendation-item {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .warning-item {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: #ef4444;
          color: var(--color-text);
        }

        .recommendation-item {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
          color: var(--color-text);
        }

        .timestamp {
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 640px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .dashboard-controls {
            justify-content: center;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .memory-details {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}; 