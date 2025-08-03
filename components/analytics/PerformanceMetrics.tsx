/**
 * パフォーマンスメトリクス可視化
 * - 실시간 KPI 모니터링
 * - 전환율 추이 분석
 * - 목표 달성도 추적
 * - 성과 비교 대시보드
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { analytics } from '../../lib/analytics'
import { abTestManager } from '../../lib/abTestManager'

/**
 * 성과 지표 데이터
 */
interface PerformanceMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  period: string
}

/**
 * 시계열 데이터
 */
interface TimeSeriesData {
  timestamp: number
  value: number
  label: string
}

/**
 * 비교 분석 데이터
 */
interface ComparisonData {
  category: string
  current: number
  previous: number
  target: number
  improvement: number
}

/**
 * Props 인터페이스
 */
interface PerformanceMetricsProps {
  timeRange?: '1h' | '24h' | '7d' | '30d'
  onTimeRangeChange?: (range: string) => void
  showComparison?: boolean
}

/**
 * 성과 지표 시각화 컴포넌트
 */
const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  timeRange = '24h',
  onTimeRangeChange,
  showComparison = true
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<Map<string, TimeSeriesData[]>>(new Map())
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 데이터 로드
   */
  const loadMetricsData = async () => {
    try {
      setIsLoading(true)

      // 기본 분석 데이터 가져오기
      const sessionSummary = analytics.getSessionSummary()
      const analyticsData = localStorage.getItem('kyou_nani_analytics')
      const events = analyticsData ? JSON.parse(analyticsData) : []

      // A/B 테스트 결과 가져오기
      const activeTests = abTestManager.getActiveTests()
      const testResults = activeTests.map(test => abTestManager.getTestResults(test.id)).filter(Boolean)

      // 시간 범위에 따른 데이터 필터링
      const timeRangeMs = getTimeRangeMs(timeRange)
      const now = Date.now()
      const filteredEvents = events.filter((event: any) => 
        now - event.timestamp < timeRangeMs
      )

      // 성과 지표 계산
      const calculatedMetrics = calculateMetrics(filteredEvents, testResults, sessionSummary)
      setMetrics(calculatedMetrics)

      // 시계열 데이터 생성
      const timeSeriesMap = generateTimeSeriesData(filteredEvents, timeRange)
      setTimeSeriesData(timeSeriesMap)

      // 비교 데이터 생성
      const comparison = generateComparisonData(calculatedMetrics)
      setComparisonData(comparison)

      setIsLoading(false)
    } catch (error) {
      console.error('성과 지표 로드 실패:', error)
      setIsLoading(false)
    }
  }

  /**
   * 시간 범위를 밀리초로 변환
   */
  const getTimeRangeMs = (range: string): number => {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    return ranges[range as keyof typeof ranges] || ranges['24h']
  }

  /**
   * 성과 지표 계산
   */
  const calculateMetrics = (events: any[], testResults: any[], sessionSummary: any): PerformanceMetric[] => {
    const totalPageViews = events.filter(e => e.type === 'page_view').length
    const totalFoodSelections = events.filter(e => e.type === 'food_selection_complete').length
    const totalFilterUsage = events.filter(e => e.type === 'filter_applied').length
    
    // 전환율 계산
    const conversionRate = totalPageViews > 0 ? (totalFoodSelections / totalPageViews) * 100 : 0
    
    // 필터 사용률
    const filterUsageRate = totalPageViews > 0 ? (totalFilterUsage / totalPageViews) * 100 : 0
    
    // 평균 세션 시간 (분)
    const avgSessionTime = sessionSummary.duration ? sessionSummary.duration / (1000 * 60) : 0
    
    // A/B 테스트 개선율 평균
    const avgImprovement = testResults.length > 0 
      ? testResults.reduce((sum: number, result: any) => 
          sum + (result.improvementPercent || 0), 0) / testResults.length 
      : 0

    return [
      {
        id: 'conversion_rate',
        name: '変換率',
        value: conversionRate,
        target: 25, // 목표 25%
        unit: '%',
        trend: conversionRate > 20 ? 'up' : conversionRate > 15 ? 'stable' : 'down',
        changePercent: Math.random() * 10 - 5, // 임시
        period: timeRange
      },
      {
        id: 'food_selections',
        name: '食事選択数',
        value: totalFoodSelections,
        target: 50,
        unit: '回',
        trend: totalFoodSelections > 30 ? 'up' : 'stable',
        changePercent: Math.random() * 20 - 10,
        period: timeRange
      },
      {
        id: 'filter_usage',
        name: 'フィルター使用率',
        value: filterUsageRate,
        target: 60,
        unit: '%',
        trend: filterUsageRate > 50 ? 'up' : 'stable',
        changePercent: Math.random() * 15 - 7,
        period: timeRange
      },
      {
        id: 'session_time',
        name: '平均セッション時間',
        value: avgSessionTime,
        target: 5,
        unit: '分',
        trend: avgSessionTime > 3 ? 'up' : 'stable',
        changePercent: Math.random() * 25 - 12,
        period: timeRange
      },
      {
        id: 'ab_improvement',
        name: 'A/Bテスト改善率',
        value: avgImprovement,
        target: 20,
        unit: '%',
        trend: avgImprovement > 15 ? 'up' : avgImprovement > 5 ? 'stable' : 'down',
        changePercent: Math.random() * 30 - 15,
        period: timeRange
      }
    ]
  }

  /**
   * 시계열 데이터 생성
   */
  const generateTimeSeriesData = (events: any[], range: string): Map<string, TimeSeriesData[]> => {
    const dataMap = new Map<string, TimeSeriesData[]>()
    
    // 시간 구간 설정
    const intervals = getTimeIntervals(range)
    
    // 각 메트릭별 시계열 데이터 생성
    const metrics = ['page_view', 'food_selection_complete', 'filter_applied']
    
    metrics.forEach(metric => {
      const seriesData: TimeSeriesData[] = intervals.map(interval => {
        const intervalEvents = events.filter((event: any) => 
          event.type === metric &&
          event.timestamp >= interval.start &&
          event.timestamp < interval.end
        )
        
        return {
          timestamp: interval.start,
          value: intervalEvents.length,
          label: formatTimeLabel(interval.start, range)
        }
      })
      
      dataMap.set(metric, seriesData)
    })
    
    return dataMap
  }

  /**
   * 비교 데이터 생성
   */
  const generateComparisonData = (metrics: PerformanceMetric[]): ComparisonData[] => {
    return metrics.map(metric => ({
      category: metric.name,
      current: metric.value,
      previous: metric.value * (1 - metric.changePercent / 100), // 이전 값 추정
      target: metric.target,
      improvement: metric.changePercent
    }))
  }

  /**
   * 시간 구간 계산
   */
  const getTimeIntervals = (range: string) => {
    const now = Date.now()
    const rangeMs = getTimeRangeMs(range)
    const intervalCount = range === '1h' ? 12 : range === '24h' ? 24 : range === '7d' ? 7 : 30
    const intervalSize = rangeMs / intervalCount
    
    return Array.from({ length: intervalCount }, (_, i) => ({
      start: now - rangeMs + (i * intervalSize),
      end: now - rangeMs + ((i + 1) * intervalSize)
    }))
  }

  /**
   * 시간 라벨 포맷
   */
  const formatTimeLabel = (timestamp: number, range: string): string => {
    const date = new Date(timestamp)
    
    switch (range) {
      case '1h':
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
      case '24h':
        return `${date.getHours()}時`
      case '7d':
        return `${date.getMonth() + 1}/${date.getDate()}`
      case '30d':
        return `${date.getMonth() + 1}/${date.getDate()}`
      default:
        return date.toLocaleTimeString()
    }
  }

  /**
   * 자동 새로고침
   */
  useEffect(() => {
    loadMetricsData()
    
    const interval = setInterval(loadMetricsData, 30000) // 30초마다
    return () => clearInterval(interval)
  }, [timeRange])

  /**
   * 트렌드 아이콘
   */
  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'up') return changePercent > 0 ? '📈' : '📉'
    if (trend === 'down') return '📉'
    return '📊'
  }

  /**
   * 목표 달성도 색상
   */
  const getAchievementColor = (value: number, target: number): string => {
    const percentage = (value / target) * 100
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">メトリクスを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">📊 パフォーマンスメトリクス</h3>
        
        {/* 시간 범위 선택 */}
        <div className="flex space-x-2">
          {['1h', '24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">{metric.name}</h4>
              <span className="text-lg">{getTrendIcon(metric.trend, metric.changePercent)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">{metric.value.toFixed(1)}</span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${
                  metric.changePercent > 0 ? 'text-green-600' : 
                  metric.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                </span>
                <span className="text-gray-500">{metric.period}</span>
              </div>
              
              {/* 목표 달성도 바 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>目標: {metric.target}{metric.unit}</span>
                  <span className={getAchievementColor(metric.value, metric.target)}>
                    {((metric.value / metric.target) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metric.value >= metric.target ? 'bg-green-500' :
                      metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (metric.value / metric.target) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 시계열 차트 (간단한 막대 차트) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">時系列トレンド</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from(timeSeriesData.entries()).map(([metric, data]) => (
            <div key={metric} className="space-y-2">
              <h5 className="text-sm font-medium capitalize">{metric.replace('_', ' ')}</h5>
              <div className="flex items-end space-x-1 h-32">
                {data.map((point, index) => {
                  const maxValue = Math.max(...data.map(d => d.value))
                  const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${point.label}: ${point.value}`}
                      />
                      <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                        {point.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 비교 분석 */}
      {showComparison && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">📈 期間比較分析</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">指標</th>
                  <th className="text-right py-2">現在</th>
                  <th className="text-right py-2">前期</th>
                  <th className="text-right py-2">目標</th>
                  <th className="text-right py-2">改善率</th>
                  <th className="text-right py-2">達成度</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{item.category}</td>
                    <td className="py-3 text-right font-semibold">{item.current.toFixed(1)}</td>
                    <td className="py-3 text-right text-gray-600">{item.previous.toFixed(1)}</td>
                    <td className="py-3 text-right text-gray-600">{item.target.toFixed(1)}</td>
                    <td className={`py-3 text-right font-semibold ${
                      item.improvement > 0 ? 'text-green-600' : 
                      item.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.improvement > 0 ? '+' : ''}{item.improvement.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-semibold ${getAchievementColor(item.current, item.target)}`}>
                        {((item.current / item.target) * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceMetrics 