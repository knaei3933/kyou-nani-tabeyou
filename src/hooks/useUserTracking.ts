/**
 * ユーザー行動追跡Hook
 * - 클릭 패턴 분석
 * - 체류 시간 측정
 * - 스크롤 깊이 추적
 * - 음식 선택 플로우 분석
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { analytics, AnalyticsEventType, AnalyticsEventParams } from '../lib/analytics'

/**
 * 사용자 행동 데이터 인터페이스
 */
export interface UserBehaviorData {
  clickCount: number
  scrollDepth: number
  timeOnPage: number
  interactionEvents: Array<{
    type: string
    timestamp: number
    element: string
    coordinates?: { x: number; y: number }
  }>
  heatmapData: Array<{
    x: number
    y: number
    clicks: number
    element: string
  }>
}

/**
 * 페이지 추적 데이터
 */
export interface PageTrackingData {
  pageName: string
  entryTime: number
  exitTime?: number
  scrollEvents: Array<{
    depth: number
    timestamp: number
  }>
  clickEvents: Array<{
    element: string
    position: { x: number; y: number }
    timestamp: number
  }>
}

/**
 * 음식 선택 플로우 데이터
 */
export interface FoodSelectionFlow {
  stepNumber: number
  stepName: string
  timeSpent: number
  filters: string[]
  backtrackCount: number
  hesitationTime: number
}

/**
 * 메인 사용자 추적 Hook
 */
export const useUserTracking = (pageName: string) => {
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData>({
    clickCount: 0,
    scrollDepth: 0,
    timeOnPage: 0,
    interactionEvents: [],
    heatmapData: []
  })

  const pageStartTime = useRef<number>(Date.now())
  const lastScrollTime = useRef<number>(Date.now())
  const scrollDepthRef = useRef<number>(0)
  const clickPositions = useRef<Map<string, number>>(new Map())

  // 페이지 진입 추적
  useEffect(() => {
    pageStartTime.current = Date.now()
    
    analytics.trackPageView(window.location.pathname, pageName)
    
    console.log(`📊 페이지 추적 시작: ${pageName}`)
    
    return () => {
      // 페이지 이탈 시 최종 데이터 전송
      const timeOnPage = Date.now() - pageStartTime.current
      analytics.trackEvent('user_engagement', {
        event_category: 'page_engagement',
        event_label: pageName,
        time_spent: timeOnPage,
        scroll_depth: scrollDepthRef.current
      })
    }
  }, [pageName])

  // 스크롤 깊이 추적
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
      
      if (scrollPercentage > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercentage
        
        setBehaviorData(prev => ({
          ...prev,
          scrollDepth: scrollPercentage
        }))

        // 25%, 50%, 75%, 100% 지점에서 이벤트 전송
        if ([25, 50, 75, 100].includes(scrollPercentage)) {
          analytics.trackEvent('user_engagement', {
            event_category: 'scroll_depth',
            event_label: `${scrollPercentage}%`,
            value: scrollPercentage
          })
        }
      }

      lastScrollTime.current = Date.now()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 클릭 추적
  const trackClick = useCallback((element: string, event?: MouseEvent) => {
    const timestamp = Date.now()
    const coordinates = event ? { x: event.clientX, y: event.clientY } : undefined

    // 클릭 횟수 증가
    setBehaviorData(prev => {
      const newClickCount = prev.clickCount + 1
      
      // 히트맵 데이터 업데이트
      const existingHeatmapIndex = prev.heatmapData.findIndex(
        item => item.element === element
      )
      
      let newHeatmapData = [...prev.heatmapData]
      if (existingHeatmapIndex >= 0) {
        newHeatmapData[existingHeatmapIndex].clicks++
      } else if (coordinates) {
        newHeatmapData.push({
          x: coordinates.x,
          y: coordinates.y,
          clicks: 1,
          element
        })
      }

      return {
        ...prev,
        clickCount: newClickCount,
        interactionEvents: [
          ...prev.interactionEvents,
          {
            type: 'click',
            timestamp,
            element,
            coordinates
          }
        ],
        heatmapData: newHeatmapData
      }
    })

    // 분석 이벤트 전송
    analytics.trackEvent('user_engagement', {
      event_category: 'click',
      event_label: element,
      value: 1
    })

    console.log(`🖱️ 클릭 추적: ${element}`, coordinates)
  }, [])

  // 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimeOnPage = Date.now() - pageStartTime.current
      setBehaviorData(prev => ({
        ...prev,
        timeOnPage: currentTimeOnPage
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    behaviorData,
    trackClick,
    getSessionSummary: () => analytics.getSessionSummary(),
    exportBehaviorData: () => ({
      ...behaviorData,
      pageName,
      sessionDuration: Date.now() - pageStartTime.current
    })
  }
}

/**
 * 음식 선택 플로우 전용 Hook
 */
export const useFoodSelectionTracking = () => {
  const [selectionFlow, setSelectionFlow] = useState<FoodSelectionFlow[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const stepStartTime = useRef<number>(Date.now())
  const hesitationTimer = useRef<NodeJS.Timeout | null>(null)
  const hesitationCount = useRef<number>(0)

  // 선택 단계 시작
  const startStep = useCallback((stepName: string) => {
    stepStartTime.current = Date.now()
    hesitationCount.current = 0

    analytics.trackEvent('food_selection_start', {
      event_category: 'food_selection_flow',
      event_label: stepName,
      step_number: currentStep + 1
    })

    // 망설임 감지 타이머 (5초 이상 비활성)
    if (hesitationTimer.current) {
      clearTimeout(hesitationTimer.current)
    }

    hesitationTimer.current = setTimeout(() => {
      hesitationCount.current++
      console.log(`🤔 망설임 감지: ${stepName}`)
    }, 5000)

    console.log(`🎯 음식 선택 단계 시작: ${stepName}`)
  }, [currentStep])

  // 필터 적용 추적
  const trackFilterApplication = useCallback((filterType: string, filterValue: string) => {
    analytics.trackEvent('filter_applied', {
      event_category: 'food_selection_filter',
      event_label: `${filterType}:${filterValue}`,
      filter_type: filterType
    })

    // 망설임 타이머 리셋 (활동 감지)
    if (hesitationTimer.current) {
      clearTimeout(hesitationTimer.current)
      hesitationTimer.current = setTimeout(() => {
        hesitationCount.current++
      }, 5000)
    }

    console.log(`🔍 필터 적용: ${filterType} = ${filterValue}`)
  }, [])

  // 선택 단계 완료
  const completeStep = useCallback((stepName: string, appliedFilters: string[] = []) => {
    const timeSpent = Date.now() - stepStartTime.current

    const stepData: FoodSelectionFlow = {
      stepNumber: currentStep + 1,
      stepName,
      timeSpent,
      filters: appliedFilters,
      backtrackCount: 0, // 구현 시 추가
      hesitationTime: hesitationCount.current * 5000
    }

    setSelectionFlow(prev => [...prev, stepData])
    setCurrentStep(prev => prev + 1)

    if (hesitationTimer.current) {
      clearTimeout(hesitationTimer.current)
    }

    analytics.trackEvent('food_selection_complete', {
      event_category: 'food_selection_flow',
      event_label: stepName,
      step_number: currentStep + 1,
      time_spent: timeSpent,
      applied_filters: appliedFilters
    })

    console.log(`✅ 음식 선택 단계 완료: ${stepName}`, stepData)
    
    return stepData
  }, [currentStep])

  // 최종 선택 완료
  const completeFoodSelection = useCallback((selectedFood: {
    id: string
    name: string
    category: string
    emoji: string
  }) => {
    const totalSelectionTime = selectionFlow.reduce((sum, step) => sum + step.timeSpent, 0)
    const allFilters = Array.from(new Set(selectionFlow.flatMap(step => step.filters)))

    analytics.trackFoodSelection({
      id: selectedFood.id,
      name: selectedFood.name,
      category: selectedFood.category,
      selectionTime: totalSelectionTime
    })

    const completionData = {
      selectedFood,
      selectionFlow,
      totalTime: totalSelectionTime,
      totalSteps: selectionFlow.length,
      filtersUsed: allFilters,
      averageStepTime: totalSelectionTime / selectionFlow.length
    }

    console.log('🎉 음식 선택 완료!', completionData)
    
    return completionData
  }, [selectionFlow])

  // 뒤로가기 추적
  const trackBacktrack = useCallback((fromStep: string, toStep: string) => {
    analytics.trackEvent('user_engagement', {
      event_category: 'food_selection_backtrack',
      event_label: `${fromStep} → ${toStep}`,
      value: 1
    })

    console.log(`↩️ 뒤로가기: ${fromStep} → ${toStep}`)
  }, [])

  // 정리
  useEffect(() => {
    return () => {
      if (hesitationTimer.current) {
        clearTimeout(hesitationTimer.current)
      }
    }
  }, [])

  return {
    selectionFlow,
    currentStep,
    startStep,
    completeStep,
    trackFilterApplication,
    completeFoodSelection,
    trackBacktrack,
    getFlowSummary: () => ({
      totalSteps: selectionFlow.length,
      totalTime: selectionFlow.reduce((sum, step) => sum + step.timeSpent, 0),
      averageStepTime: selectionFlow.length > 0 
        ? selectionFlow.reduce((sum, step) => sum + step.timeSpent, 0) / selectionFlow.length 
        : 0,
      filtersUsed: Array.from(new Set(selectionFlow.flatMap(step => step.filters)))
    })
  }
}

/**
 * 성능 추적 Hook
 */
export const usePerformanceTracking = () => {
  const [performanceData, setPerformanceData] = useState({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  })

  useEffect(() => {
    // Performance Observer로 Core Web Vitals 측정
    if ('PerformanceObserver' in window) {
      // LCP 측정
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        setPerformanceData(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }))

        analytics.trackEvent('user_engagement', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime)
        })
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // CLS 측정
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })

        setPerformanceData(prev => ({
          ...prev,
          cumulativeLayoutShift: clsValue
        }))
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })

      return () => {
        lcpObserver.disconnect()
        clsObserver.disconnect()
      }
    }

    // 페이지 로드 시간 측정
    const pageLoadTime = performance.now()
    setPerformanceData(prev => ({
      ...prev,
      pageLoadTime
    }))

  }, [])

  return {
    performanceData,
    trackCustomPerformance: (metricName: string, value: number) => {
      analytics.trackEvent('user_engagement', {
        event_category: 'custom_performance',
        event_label: metricName,
        value: Math.round(value)
      })
    }
  }
}

export default useUserTracking 