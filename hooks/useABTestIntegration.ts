/**
 * A/Bテスト統合Hook
 * - 컴포넌트별 A/B 테스트 적용
 * - 자동 배리언트 할당
 * - 전환 이벤트 추적
 * - 실시간 성과 모니터링
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { abTestManager } from '../lib/abTestManager'
import { analytics } from '../lib/analytics'

/**
 * 사용자 ID 생성/관리
 */
const getUserId = (): string => {
  let userId = localStorage.getItem('kyou_nani_user_id')
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('kyou_nani_user_id', userId)
  }
  
  return userId
}

/**
 * A/B 테스트 설정 타입
 */
interface ABTestConfig {
  testId: string
  autoTrackConversions?: boolean
  conversionEvents?: string[]
  fallbackConfig?: Record<string, any>
}

/**
 * 메인 A/B 테스트 Hook
 */
export const useABTest = (config: ABTestConfig) => {
  const [userId] = useState(getUserId)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [testConfig, setTestConfig] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 사용자를 테스트에 할당
  useEffect(() => {
    const assignedVariant = abTestManager.assignUserToTest(config.testId, userId)
    setVariantId(assignedVariant)
    
    if (assignedVariant) {
      const variantConfig = abTestManager.getTestConfig(config.testId, assignedVariant)
      setTestConfig(variantConfig)
    } else {
      // 테스트에 할당되지 않은 경우 폴백 설정 사용
      setTestConfig(config.fallbackConfig || null)
    }
    
    setIsLoading(false)
  }, [config.testId, userId])

  // 전환 이벤트 기록
  const recordConversion = useCallback((value: number = 1, eventType?: string) => {
    if (variantId) {
      abTestManager.recordConversion(config.testId, userId, value)
      
      // 분석 이벤트도 전송
      analytics.trackEvent('user_engagement', {
        event_category: 'ab_test_conversion',
        event_label: `${config.testId}:${variantId}`,
        value
      })
      
      console.log(`🎯 A/B테스트 전환 기록: ${config.testId}:${variantId} (+${value})`)
    }
  }, [config.testId, userId, variantId])

  // 자동 전환 추적 설정
  useEffect(() => {
    if (!config.autoTrackConversions || !variantId) return

    const trackingEvents = config.conversionEvents || ['food_selection_complete']
    
    const handleAnalyticsEvent = (event: any) => {
      if (trackingEvents.includes(event.detail?.type)) {
        recordConversion(1, event.detail.type)
      }
    }

    // 커스텀 이벤트 리스너 추가
    window.addEventListener('analytics_event', handleAnalyticsEvent)
    
    return () => {
      window.removeEventListener('analytics_event', handleAnalyticsEvent)
    }
  }, [config.autoTrackConversions, config.conversionEvents, variantId, recordConversion])

  return {
    variantId,
    config: testConfig,
    isInTest: !!variantId,
    isLoading,
    recordConversion,
    userId
  }
}

/**
 * 홈페이지 레이아웃 A/B 테스트 Hook
 */
export const useHomeLayoutTest = () => {
  const { variantId, config, isInTest, recordConversion } = useABTest({
    testId: 'home_layout_test',
    autoTrackConversions: true,
    conversionEvents: ['food_selection_start'],
    fallbackConfig: {
      layout: 'original',
      ctaPosition: 'bottom',
      showWelcomeMessage: true
    }
  })

  // 레이아웃별 스타일 설정
  const layoutStyles = useMemo(() => {
    if (!config) return {}

    switch (config.layout) {
      case 'optimized':
        return {
          container: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50',
          hero: 'text-center py-16 px-6',
          cta: config.ctaPosition === 'center' ? 'mb-8' : 'mt-8',
          showPreview: config.showFoodPreview,
          welcomeMessage: config.showWelcomeMessage
        }
      default:
        return {
          container: 'min-h-screen bg-gradient-to-br from-orange-50 to-red-50',
          hero: 'text-center py-12 px-4',
          cta: 'mt-6',
          showPreview: false,
          welcomeMessage: true
        }
    }
  }, [config])

  return {
    variant: variantId,
    isInTest,
    layoutStyles,
    recordConversion
  }
}

/**
 * 음식 선택 UI A/B 테스트 Hook
 */
export const useFoodSelectionUITest = () => {
  const { variantId, config, isInTest, recordConversion } = useABTest({
    testId: 'food_selection_ui_test',
    autoTrackConversions: true,
    conversionEvents: ['food_selection_complete'],
    fallbackConfig: {
      viewType: 'grid',
      cardsPerRow: 3,
      showEmoji: true,
      showCategory: true
    }
  })

  // UI 설정 계산
  const uiConfig = useMemo(() => {
    if (!config) return { viewType: 'grid', cardsPerRow: 3 }

    return {
      viewType: config.viewType || 'grid',
      cardsPerRow: config.cardsPerRow || 3,
      showEmoji: config.showEmoji !== false,
      showCategory: config.showCategory !== false,
      showDescription: config.showDescription || false,
      showImage: config.showImage || false,
      cardSize: config.cardSize || 'medium'
    }
  }, [config])

  // CSS 클래스 생성
  const getContainerClasses = useCallback(() => {
    switch (uiConfig.viewType) {
      case 'list':
        return 'space-y-3'
      case 'cards':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6'
      default: // grid
        return `grid grid-cols-2 md:grid-cols-${uiConfig.cardsPerRow} gap-4`
    }
  }, [uiConfig])

  const getItemClasses = useCallback(() => {
    const baseClasses = 'transition-all hover:scale-105 cursor-pointer'
    
    switch (uiConfig.viewType) {
      case 'list':
        return `${baseClasses} flex items-center p-4 bg-white rounded-lg border border-gray-200`
      case 'cards':
        const sizeClasses = uiConfig.cardSize === 'large' ? 'p-6' : 'p-4'
        return `${baseClasses} ${sizeClasses} bg-white rounded-lg border border-gray-200 shadow-sm`
      default: // grid
        return `${baseClasses} p-4 bg-white rounded-lg border border-gray-200 text-center`
    }
  }, [uiConfig])

  return {
    variant: variantId,
    isInTest,
    uiConfig,
    getContainerClasses,
    getItemClasses,
    recordConversion
  }
}

/**
 * 필터 UI A/B 테스트 Hook
 */
export const useFilterUITest = () => {
  const { variantId, config, isInTest, recordConversion } = useABTest({
    testId: 'filter_ui_test',
    autoTrackConversions: true,
    conversionEvents: ['filter_applied'],
    fallbackConfig: {
      filterPosition: 'sidebar',
      showFilterCount: true,
      collapsible: true
    }
  })

  // 필터 UI 설정
  const filterConfig = useMemo(() => {
    if (!config) return { filterPosition: 'sidebar' }

    return {
      filterPosition: config.filterPosition || 'sidebar',
      showFilterCount: config.showFilterCount !== false,
      collapsible: config.collapsible !== false,
      horizontal: config.horizontal || false,
      sticky: config.sticky || false
    }
  }, [config])

  // 필터 컨테이너 클래스
  const getFilterContainerClasses = useCallback(() => {
    const baseClasses = 'bg-white border border-gray-200 rounded-lg'
    
    switch (filterConfig.filterPosition) {
      case 'top':
        const stickyClass = filterConfig.sticky ? 'sticky top-4 z-10' : ''
        const horizontalClass = filterConfig.horizontal ? 'flex flex-wrap gap-2 p-4' : 'p-4'
        return `${baseClasses} ${stickyClass} ${horizontalClass}`
      default: // sidebar
        return `${baseClasses} p-4 space-y-4`
    }
  }, [filterConfig])

  return {
    variant: variantId,
    isInTest,
    filterConfig,
    getFilterContainerClasses,
    recordConversion
  }
}

/**
 * 성과 추적 Hook
 */
export const useABTestPerformance = (testId?: string) => {
  const [performance, setPerformance] = useState({
    totalTests: 0,
    activeTests: 0,
    completedTests: 0,
    avgImprovement: 0,
    significantResults: 0
  })

  useEffect(() => {
    const updatePerformance = () => {
      const activeTests = abTestManager.getActiveTests()
      const allTestsData = abTestManager.exportTestData()
      
      const completedResults = allTestsData.results.filter((result: any) => 
        result.isStatisticallySignificant
      )
      
      const avgImprovement = completedResults.length > 0
        ? completedResults.reduce((sum: number, result: any) => 
            sum + (result.improvementPercent || 0), 0) / completedResults.length
        : 0

      setPerformance({
        totalTests: allTestsData.tests.length,
        activeTests: activeTests.length,
        completedTests: allTestsData.results.filter((r: any) => r.isStatisticallySignificant).length,
        avgImprovement,
        significantResults: completedResults.length
      })
    }

    updatePerformance()
    
    // 주기적 업데이트
    const interval = setInterval(updatePerformance, 10000) // 10초마다
    return () => clearInterval(interval)
  }, [testId])

  return performance
}

/**
 * A/B 테스트 디버깅 Hook (개발환경용)
 */
export const useABTestDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const info = {
        userId: getUserId(),
        activeTests: abTestManager.getActiveTests(),
        testData: abTestManager.exportTestData()
      }
      setDebugInfo(info)
      
      console.group('🧪 A/B Test Debug Info')
      console.log('User ID:', info.userId)
      console.log('Active Tests:', info.activeTests)
      console.log('Test Data:', info.testData)
      console.groupEnd()
    }
  }, [])

  return debugInfo
}

export default useABTest 