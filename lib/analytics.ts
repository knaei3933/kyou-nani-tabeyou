/**
 * アナリティクスシステム
 * Google Analytics 4 統合 및 사용자 행동 분석
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export type AnalyticsEventType = 
  | 'food_selection_start'
  | 'food_selection_complete'
  | 'filter_applied'
  | 'page_view'
  | 'user_engagement'
  | 'restaurant_click'
  | 'error_occurred'

export interface AnalyticsEventParams {
  event_category?: string
  event_label?: string
  value?: number
  food_id?: string
  food_name?: string
  food_category?: string
  filter_type?: string
  time_spent?: number
  device_type?: 'mobile' | 'tablet' | 'desktop'
}

export interface UserSessionData {
  sessionId: string
  startTime: number
  pageViews: number
  foodSelections: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export class AnalyticsManager {
  private gaId: string = 'G-XXXXXXXXXX'
  private isInitialized: boolean = false
  private sessionData: UserSessionData

  constructor() {
    this.sessionData = this.initializeSession()
    this.initializeGA4()
  }

  private async initializeGA4() {
    if (typeof window === 'undefined') return

    try {
      // GA4 스크립트 로드
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`
      document.head.appendChild(script)

      // gtag 초기화
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }

      window.gtag('js', new Date())
      window.gtag('config', this.gaId)

      this.isInitialized = true
      console.log('✅ Google Analytics 4 초기화 완료')
    } catch (error) {
      console.error('❌ GA4 초기화 실패:', error)
    }
  }

  private initializeSession(): UserSessionData {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      sessionId,
      startTime: Date.now(),
      pageViews: 0,
      foodSelections: 0,
      deviceType: this.getDeviceType()
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.screen.width
    if (width < 640) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  trackEvent(type: AnalyticsEventType, params: AnalyticsEventParams = {}) {
    const eventData = {
      type,
      params: {
        ...params,
        session_id: this.sessionData.sessionId,
        device_type: this.sessionData.deviceType,
        timestamp: Date.now()
      }
    }

    if (this.isInitialized && typeof window !== 'undefined') {
      window.gtag('event', type, eventData.params)
    }

    // 개발 환경에서 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData)
    }

    this.updateSessionData(type)
  }

  trackPageView(pagePath: string, pageTitle: string) {
    this.sessionData.pageViews++

    if (this.isInitialized) {
      window.gtag('config', this.gaId, {
        page_path: pagePath,
        page_title: pageTitle
      })
    }

    this.trackEvent('page_view', {
      event_category: 'navigation',
      event_label: pageTitle
    })
  }

  trackFoodSelection(foodData: {
    id: string
    name: string
    category: string
    selectionTime: number
  }) {
    this.sessionData.foodSelections++

    this.trackEvent('food_selection_complete', {
      event_category: 'food_selection',
      event_label: foodData.name,
      food_id: foodData.id,
      food_name: foodData.name,
      food_category: foodData.category,
      time_spent: foodData.selectionTime,
      value: 1
    })
  }

  trackError(error: Error, context: string) {
    this.trackEvent('error_occurred', {
      event_category: 'error',
      event_label: context,
      value: 0
    })
  }

  private updateSessionData(type: AnalyticsEventType) {
    if (type === 'food_selection_complete') {
      this.sessionData.foodSelections++
    }
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionData.sessionId,
      duration: Date.now() - this.sessionData.startTime,
      pageViews: this.sessionData.pageViews,
      foodSelections: this.sessionData.foodSelections,
      deviceType: this.sessionData.deviceType
    }
  }
}

// 전역 인스턴스
export const analytics = new AnalyticsManager()

// React Hook
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFoodSelection: analytics.trackFoodSelection.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getSessionSummary: analytics.getSessionSummary.bind(analytics)
  }
}

export default analytics 