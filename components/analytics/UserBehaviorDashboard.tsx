/**
 * ユーザー行動ダッシュボード
 * - 실시간 사용자 행동 분석
 * - 음식 선택 패턴 시각화
 * - 성과 지표 모니터링
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { analytics } from '../../lib/analytics'

/**
 * 실시간 메트릭 데이터
 */
interface RealTimeMetrics {
  activeUsers: number
  pageViews: number
  foodSelections: number
  averageSessionTime: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  topFoods: Array<{ food: string; selections: number }>
  deviceBreakdown: Record<string, number>
  hourlyActivity: Array<{ hour: number; activity: number }>
}

/**
 * 사용자 플로우 데이터
 */
interface UserFlow {
  step: string
  users: number
  dropoffRate: number
  avgTimeSpent: number
}

/**
 * Props 인터페이스
 */
interface UserBehaviorDashboardProps {
  isVisible?: boolean
  onClose?: () => void
  refreshInterval?: number
}

/**
 * 사용자 행동 대시보드 컴포넌트
 */
const UserBehaviorDashboard: React.FC<UserBehaviorDashboardProps> = ({
  isVisible = false,
  onClose,
  refreshInterval = 30000 // 30초
}) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [userFlow, setUserFlow] = useState<UserFlow[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 데이터 로드
   */
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 로컬 스토리지에서 분석 데이터 가져오기
      const analyticsData = localStorage.getItem('kyou_nani_analytics')
      const sessionData = analytics.getSessionSummary()

      if (analyticsData) {
        const events = JSON.parse(analyticsData)
        const processedMetrics = processAnalyticsData(events, selectedTimeRange)
        setMetrics(processedMetrics)
        
        const flowData = generateUserFlow(events)
        setUserFlow(flowData)
      } else {
        // 더미 데이터 (실제 환경에서는 API 호출)
        setMetrics(generateMockMetrics())
        setUserFlow(generateMockUserFlow())
      }

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 분석 데이터 처리
   */
  const processAnalyticsData = (events: any[], timeRange: string): RealTimeMetrics => {
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange]

    const recentEvents = events.filter(event => 
      now - event.timestamp < timeRangeMs
    )

    // 페이지 뷰 계산
    const pageViews = recentEvents.filter(e => e.type === 'page_view').length
    
    // 음식 선택 계산
    const foodSelections = recentEvents.filter(e => e.type === 'food_selection_complete').length
    
    // 인기 페이지
    const pageViewEvents = recentEvents.filter(e => e.type === 'page_view')
    const topPages = Object.entries(
      pageViewEvents.reduce((acc, event) => {
        const page = event.params?.event_label || 'Unknown'
        acc[page] = (acc[page] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // 인기 음식
    const foodEvents = recentEvents.filter(e => e.type === 'food_selection_complete')
    const topFoods = Object.entries(
      foodEvents.reduce((acc, event) => {
        const food = event.params?.food_name || 'Unknown'
        acc[food] = (acc[food] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([food, selections]) => ({ food, selections }))
      .sort((a, b) => b.selections - a.selections)
      .slice(0, 5)

    // 디바이스 분포
    const deviceBreakdown = recentEvents.reduce((acc, event) => {
      const device = event.params?.device_type || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 시간별 활동 (24시간)
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const hourEvents = recentEvents.filter(event => {
        const eventHour = new Date(event.timestamp).getHours()
        return eventHour === hour
      })
      return { hour, activity: hourEvents.length }
    })

    return {
      activeUsers: Math.max(1, Math.floor(pageViews / 3)), // 추정값
      pageViews,
      foodSelections,
      averageSessionTime: 180000, // 3분 (추정값)
      bounceRate: Math.max(0, Math.min(100, 100 - (foodSelections / Math.max(1, pageViews)) * 100)),
      topPages,
      topFoods,
      deviceBreakdown,
      hourlyActivity
    }
  }

  /**
   * 사용자 플로우 생성
   */
  const generateUserFlow = (events: any[]): UserFlow[] => {
    const flowSteps = [
      'ホームページ訪問',
      '食事選択開始',
      'フィルター適用',
      '食事選択完了',
      'レストラン表示',
      '配達アプリ遷移'
    ]

    return flowSteps.map((step, index) => {
      const stepEvents = events.filter(e => {
        switch (index) {
          case 0: return e.type === 'page_view'
          case 1: return e.type === 'food_selection_start'
          case 2: return e.type === 'filter_applied'
          case 3: return e.type === 'food_selection_complete'
          case 4: return e.type === 'restaurant_click'
          case 5: return e.type === 'delivery_app_redirect'
          default: return false
        }
      })

      const users = stepEvents.length
      const previousStepUsers = index > 0 ? events.filter(e => {
        switch (index - 1) {
          case 0: return e.type === 'page_view'
          case 1: return e.type === 'food_selection_start'
          case 2: return e.type === 'filter_applied'
          case 3: return e.type === 'food_selection_complete'
          case 4: return e.type === 'restaurant_click'
          default: return false
        }
      }).length : users

      const dropoffRate = previousStepUsers > 0 ? 
        Math.max(0, ((previousStepUsers - users) / previousStepUsers) * 100) : 0

      return {
        step,
        users,
        dropoffRate,
        avgTimeSpent: Math.random() * 60000 + 30000 // 30초 ~ 1분 30초 (임시)
      }
    })
  }

  /**
   * 더미 데이터 생성 (개발용)
   */
  const generateMockMetrics = (): RealTimeMetrics => ({
    activeUsers: Math.floor(Math.random() * 100) + 20,
    pageViews: Math.floor(Math.random() * 500) + 100,
    foodSelections: Math.floor(Math.random() * 50) + 10,
    averageSessionTime: Math.floor(Math.random() * 300000) + 120000,
    bounceRate: Math.floor(Math.random() * 30) + 20,
    topPages: [
      { page: 'ホームページ', views: 45 },
      { page: '食事選択', views: 32 },
      { page: '結果表示', views: 28 },
      { page: 'エリア選択', views: 15 },
      { page: '設定', views: 8 }
    ],
    topFoods: [
      { food: '🍕 ピザ', selections: 12 },
      { food: '🍜 ラーメン', selections: 10 },
      { food: '🍱 弁当', selections: 8 },
      { food: '🍔 ハンバーガー', selections: 6 },
      { food: '🍣 寿司', selections: 5 }
    ],
    deviceBreakdown: {
      mobile: 65,
      desktop: 25,
      tablet: 10
    },
    hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity: Math.floor(Math.random() * 20) + (hour >= 11 && hour <= 14 ? 30 : 5)
    }))
  })

  const generateMockUserFlow = (): UserFlow[] => [
    { step: 'ホームページ訪問', users: 100, dropoffRate: 0, avgTimeSpent: 45000 },
    { step: '食事選択開始', users: 85, dropoffRate: 15, avgTimeSpent: 120000 },
    { step: 'フィルター適用', users: 72, dropoffRate: 15.3, avgTimeSpent: 90000 },
    { step: '食事選択完了', users: 58, dropoffRate: 19.4, avgTimeSpent: 180000 },
    { step: 'レストラン表示', users: 45, dropoffRate: 22.4, avgTimeSpent: 60000 },
    { step: '配達アプリ遷移', users: 32, dropoffRate: 28.9, avgTimeSpent: 15000 }
  ]

  /**
   * 데이터 자동 새로고침
   */
  useEffect(() => {
    if (isVisible) {
      loadDashboardData()
      
      const interval = setInterval(loadDashboardData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [isVisible, selectedTimeRange, refreshInterval])

  /**
   * 포맷 유틸리티
   */
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📊 ユーザー行動ダッシュボード</h2>
              <p className="text-gray-600 mt-1">リアルタイム分析 • 自動更新中</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 시간 범위 선택 */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="1h">過去1時間</option>
                <option value="24h">過去24時間</option>
                <option value="7d">過去7日</option>
              </select>

              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">データを読み込み中...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* 주요 지표 */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="アクティブユーザー"
                  value={metrics.activeUsers.toString()}
                  icon="👥"
                  color="blue"
                />
                <MetricCard
                  title="ページビュー"
                  value={metrics.pageViews.toString()}
                  icon="📄"
                  color="green"
                />
                <MetricCard
                  title="食事選択数"
                  value={metrics.foodSelections.toString()}
                  icon="🍽️"
                  color="orange"
                />
                <MetricCard
                  title="離脱率"
                  value={formatPercentage(metrics.bounceRate)}
                  icon="📉"
                  color="red"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 사용자 플로우 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">👤 ユーザーフロー分析</h3>
                <div className="space-y-3">
                  {userFlow.map((step, index) => (
                    <div key={step.step} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{step.step}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-blue-600 font-semibold">{step.users}人</span>
                        {step.dropoffRate > 0 && (
                          <span className="text-red-500">-{formatPercentage(step.dropoffRate)}</span>
                        )}
                        <span className="text-gray-500">{formatTime(step.avgTimeSpent)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 인기 콘텐츠 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🔥 人気コンテンツ</h3>
                
                {/* 인기 페이지 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">人気ページ</h4>
                  <div className="space-y-2">
                    {metrics?.topPages.slice(0, 3).map((page, index) => (
                      <div key={page.page} className="flex justify-between items-center text-sm">
                        <span>{page.page}</span>
                        <span className="text-blue-600 font-semibold">{page.views}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 인기 음식 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">人気料理</h4>
                  <div className="space-y-2">
                    {metrics?.topFoods.slice(0, 3).map((food, index) => (
                      <div key={food.food} className="flex justify-between items-center text-sm">
                        <span>{food.food}</span>
                        <span className="text-orange-600 font-semibold">{food.selections}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 시간별 활동 차트 */}
            {metrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">⏰ 時間別アクティビティ</h3>
                <div className="grid grid-cols-12 gap-1 h-32">
                  {metrics.hourlyActivity.map((data, index) => (
                    <div
                      key={index}
                      className="bg-blue-200 rounded-sm flex flex-col justify-end relative group"
                      style={{
                        height: `${Math.max(5, (data.activity / Math.max(...metrics.hourlyActivity.map(h => h.activity))) * 100)}%`
                      }}
                    >
                      <div className="bg-blue-500 rounded-sm" style={{ height: '100%' }}></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.hour}時: {data.activity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0時</span>
                  <span>12時</span>
                  <span>23時</span>
                </div>
              </div>
            )}

            {/* 디바이스 분포 */}
            {metrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📱 デバイス分布</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(metrics.deviceBreakdown).map(([device, count]) => (
                    <div key={device} className="text-center">
                      <div className="text-2xl mb-2">
                        {device === 'mobile' ? '📱' : device === 'tablet' ? '📟' : '💻'}
                      </div>
                      <div className="text-lg font-semibold">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{device}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 메트릭 카드 컴포넌트
 */
const MetricCard: React.FC<{
  title: string
  value: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'red'
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

export default UserBehaviorDashboard 