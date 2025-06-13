'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number  // First Contentful Paint
  lcp?: number  // Largest Contentful Paint  
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  
  // カスタムメトリック
  ttfb?: number // Time to First Byte
  loadTime?: number
  domContentLoaded?: number
  
  // リソース使用量
  memoryUsage?: number
  networkRequests?: number
  imageLoadTime?: number
}

/**
 * パフォーマンスモニタリングコンポーネント
 * - Core Web Vitals 측정
 * - 메모리 사용량 추적
 * - 네트워크 요청 모니터링
 * - 이미지 로딩 성능 분석
 */
export function PerformanceMonitor({ 
  enabled = true,
  logToConsole = false,
  onMetricsUpdate
}: {
  enabled?: boolean
  logToConsole?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let observer: PerformanceObserver | null = null

    // Core Web Vitals 측정
    const measureCoreWebVitals = () => {
      // FCP (First Contentful Paint) 측정
      const fcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              fcp: entry.startTime
            }))
          }
        })
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // LCP (Largest Contentful Paint) 측정
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID (First Input Delay) 측정
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS (Cumulative Layout Shift) 측정
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({
              ...prev,
              cls: clsValue
            }))
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Navigation Timing 측정
    const measureNavigationTiming = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as any
        
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart
        }))
      }
    }

    // 메모리 사용량 측정
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024) // MB 단위
        }))
      }
    }

    // 네트워크 요청 모니터링
    const measureNetworkRequests = () => {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let imageLoadTime = 0
        let requestCount = 0

        entries.forEach((entry) => {
          requestCount++
          
          // 이미지 로딩 시간 측정
          if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
            imageLoadTime += entry.duration
          }
        })

        setMetrics(prev => ({
          ...prev,
          networkRequests: (prev.networkRequests || 0) + requestCount,
          imageLoadTime: imageLoadTime / entries.length // 평균 이미지 로딩 시간
        }))
      })

      observer.observe({ entryTypes: ['resource'] })
    }

    // 측정 시작
    measureCoreWebVitals()
    measureNavigationTiming()
    measureMemoryUsage()
    measureNetworkRequests()

    // 주기적인 메모리 사용량 업데이트
    const memoryInterval = setInterval(measureMemoryUsage, 5000)

    return () => {
      if (observer) observer.disconnect()
      clearInterval(memoryInterval)
    }
  }, [enabled])

  // 메트릭 업데이트 시 콜백 실행
  useEffect(() => {
    if (Object.keys(metrics).length > 0) {
      onMetricsUpdate?.(metrics)
      
      if (logToConsole) {
        console.group('🚀 Performance Metrics')
        console.table(metrics)
        console.groupEnd()
      }
    }
  }, [metrics, onMetricsUpdate, logToConsole])

  // 성능 등급 계산
  const getPerformanceGrade = (metrics: PerformanceMetrics): string => {
    let score = 0
    let total = 0

    // FCP 점수 (0-2.5초: 100점, 2.5-4초: 50점, 4초+: 0점)
    if (metrics.fcp !== undefined) {
      total++
      if (metrics.fcp <= 2500) score++
      else if (metrics.fcp <= 4000) score += 0.5
    }

    // LCP 점수 (0-2.5초: 100점, 2.5-4초: 50점, 4초+: 0점)
    if (metrics.lcp !== undefined) {
      total++
      if (metrics.lcp <= 2500) score++
      else if (metrics.lcp <= 4000) score += 0.5
    }

    // FID 점수 (0-100ms: 100점, 100-300ms: 50점, 300ms+: 0점)
    if (metrics.fid !== undefined) {
      total++
      if (metrics.fid <= 100) score++
      else if (metrics.fid <= 300) score += 0.5
    }

    // CLS 점수 (0-0.1: 100점, 0.1-0.25: 50점, 0.25+: 0점)
    if (metrics.cls !== undefined) {
      total++
      if (metrics.cls <= 0.1) score++
      else if (metrics.cls <= 0.25) score += 0.5
    }

    const percentage = total > 0 ? (score / total) * 100 : 0
    
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">⚡ Performance</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          getPerformanceGrade(metrics) === 'A+' || getPerformanceGrade(metrics) === 'A' ? 'bg-green-500' :
          getPerformanceGrade(metrics) === 'B' || getPerformanceGrade(metrics) === 'C' ? 'bg-yellow-500' :
          'bg-red-500'
        }`}>
          {getPerformanceGrade(metrics)}
        </span>
      </div>
      
      <div className="space-y-1">
        {metrics.fcp && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span>{Math.round(metrics.fcp)}ms</span>
          </div>
        )}
        {metrics.lcp && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span>{Math.round(metrics.lcp)}ms</span>
          </div>
        )}
        {metrics.fid && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span>{Math.round(metrics.fid)}ms</span>
          </div>
        )}
        {metrics.cls && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span>{metrics.cls.toFixed(3)}</span>
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
  )
}

/**
 * 성능 최적화 제안 컴포넌트
 */
export function PerformanceOptimizationSuggestions({ 
  metrics 
}: { 
  metrics: PerformanceMetrics 
}) {
  const suggestions = []

  if (metrics.fcp && metrics.fcp > 2500) {
    suggestions.push('🎨 First Contentful Paint가 느립니다. 중요한 CSS를 인라인으로 포함하세요.')
  }

  if (metrics.lcp && metrics.lcp > 2500) {
    suggestions.push('📸 Largest Contentful Paint가 느립니다. 주요 이미지를 최적화하세요.')
  }

  if (metrics.fid && metrics.fid > 100) {
    suggestions.push('⚡ First Input Delay가 길습니다. JavaScript 실행을 최적화하세요.')
  }

  if (metrics.cls && metrics.cls > 0.1) {
    suggestions.push('📐 Cumulative Layout Shift가 높습니다. 이미지와 광고에 크기를 지정하세요.')
  }

  if (metrics.memoryUsage && metrics.memoryUsage > 50) {
    suggestions.push('💾 메모리 사용량이 높습니다. 불필요한 객체를 정리하세요.')
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ 모든 성능 지표가 양호합니다!
      </div>
    )
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <h4 className="font-bold mb-2">🔧 성능 최적화 제안:</h4>
      <ul className="list-disc list-inside space-y-1">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="text-sm">{suggestion}</li>
        ))}
      </ul>
    </div>
  )
}

export default PerformanceMonitor 