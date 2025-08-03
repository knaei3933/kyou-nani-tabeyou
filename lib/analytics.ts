/**
 * アナリティクスシステム
 * - Google Analytics 4 統合
 * - カスタムイベント追跡
 * - ユーザー行動分析
 * - パフォーマンス測定
 */

// Google Analytics 4 설정
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

/**
 * 이벤트 타입 정의
 */
export type AnalyticsEventType = 
  | 'food_selection_start'      // 음식 선택 시작
  | 'food_selection_step'       // 선택 단계별
  | 'food_selection_complete'   // 선택 완료
  | 'filter_applied'            // 필터 적용
  | 'filter_removed'            // 필터 제거
  | 'page_view'                 // 페이지 조회
  | 'user_engagement'           // 사용자 참여도
  | 'restaurant_click'          // 레스토랑 클릭
  | 'delivery_app_redirect'     // 배달앱 이동
  | 'favorite_added'            // 즐겨찾기 추가
  | 'favorite_removed'          // 즐겨찾기 제거
  | 'search_performed'          // 검색 수행
  | 'location_selected'         // 위치 선택
  | 'app_installed'             // PWA 설치
  | 'notification_clicked'      // 알림 클릭
  | 'error_occurred'            // 오류 발생

/**
 * 이벤트 파라미터 인터페이스
 */
export interface AnalyticsEventParams {
  // 기본 파라미터
  event_category?: string
  event_label?: string
  value?: number
  
  // 음식 관련
  food_id?: string
  food_name?: string
  food_category?: string
  food_emoji?: string
  
  // 필터 관련
  filter_type?: string
  filter_value?: string
  applied_filters?: string[]
  
  // 사용자 행동
  step_number?: number
  time_spent?: number
  click_position?: string
  scroll_depth?: number
  
  // 레스토랑 관련
  restaurant_id?: string
  restaurant_name?: string
  delivery_app?: string
  
  // 위치 관련
  location_area?: string
  location_lat?: number
  location_lng?: number
  
  // 디바이스 정보
  device_type?: 'mobile' | 'tablet' | 'desktop'
  screen_size?: string
  connection_type?: string
  
  // 성능 메트릭
  page_load_time?: number
  interaction_delay?: number
  
  // 오류 정보
  error_message?: string
  error_stack?: string
  error_page?: string
}

/**
 * 사용자 세션 데이터
 */
export interface UserSessionData {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  totalEngagementTime: number
  foodSelections: number
  filtersUsed: string[]
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop'
    userAgent: string
    screenSize: string
    connectionType: string
  }
  location?: {
    area: string
    coordinates?: [number, number]
  }
}

/**
 * Analytics 메인 클래스
 */
export class AnalyticsManager {
  private gaId: string
  private isInitialized: boolean = false
  private sessionData: UserSessionData
  private eventQueue: Array<{ type: AnalyticsEventType; params: AnalyticsEventParams }> = []

  constructor(gaId: string = 'G-XXXXXXXXXX') {
    this.gaId = gaId
    this.sessionData = this.initializeSession()
    this.initializeGA4()
  }

  /**
   * Google Analytics 4 초기화
   */
  private async initializeGA4() {
    if (typeof window === 'undefined') return

    try {
      // GA4 스크립트 로드
      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`
      document.head.appendChild(script1)

      // gtag 초기화
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }

      window.gtag('js', new Date())
      window.gtag('config', this.gaId, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_session_id: 'session_id',
          custom_user_type: 'user_type'
        }
      })

      // 사용자 정의 매개변수 설정
      window.gtag('config', this.gaId, {
        session_id: this.sessionData.sessionId,
        user_type: this.getUserType()
      })

      this.isInitialized = true
      
      // 큐에 대기 중인 이벤트 전송
      this.flushEventQueue()
      
      console.log('✅ Google Analytics 4 초기화 완료')
    } catch (error) {
      console.error('❌ GA4 초기화 실패:', error)
    }
  }

  /**
   * 세션 초기화
   */
  private initializeSession(): UserSessionData {
    const sessionId = this.generateSessionId()
    const deviceInfo = this.getDeviceInfo()

    return {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      totalEngagementTime: 0,
      foodSelections: 0,
      filtersUsed: [],
      deviceInfo
    }
  }

  /**
   * 이벤트 추적
   */
  trackEvent(type: AnalyticsEventType, params: AnalyticsEventParams = {}) {
    const eventData = {
      type,
      params: {
        ...params,
        session_id: this.sessionData.sessionId,
        device_type: this.sessionData.deviceInfo.type,
        timestamp: Date.now()
      }
    }

    if (this.isInitialized && typeof window !== 'undefined') {
      this.sendToGA4(eventData)
      this.sendToCustomAnalytics(eventData)
    } else {
      // 초기화되지 않은 경우 큐에 추가
      this.eventQueue.push(eventData)
    }

    // 세션 데이터 업데이트
    this.updateSessionData(type, params)
    
    // 로컬 스토리지에 분석 데이터 저장
    this.saveAnalyticsData(eventData)
  }

  /**
   * Google Analytics 4로 이벤트 전송
   */
  private sendToGA4(eventData: { type: AnalyticsEventType; params: AnalyticsEventParams }) {
    try {
      window.gtag('event', eventData.type, {
        event_category: eventData.params.event_category || 'user_interaction',
        event_label: eventData.params.event_label,
        value: eventData.params.value,
        custom_parameters: eventData.params
      })
    } catch (error) {
      console.error('GA4 이벤트 전송 실패:', error)
    }
  }

  /**
   * 커스텀 분석 시스템으로 전송
   */
  private sendToCustomAnalytics(eventData: { type: AnalyticsEventType; params: AnalyticsEventParams }) {
    try {
      // 실제 환경에서는 자체 분석 서버로 전송
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Analytics Event')
        console.log('Type:', eventData.type)
        console.log('Params:', eventData.params)
        console.log('Session:', this.getSessionSummary())
        console.groupEnd()
      }

      // 향후 자체 분석 API 엔드포인트로 전송
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // })
    } catch (error) {
      console.error('커스텀 분석 전송 실패:', error)
    }
  }

  /**
   * 페이지 뷰 추적
   */
  trackPageView(pagePath: string, pageTitle: string) {
    this.sessionData.pageViews++
    this.sessionData.lastActivity = Date.now()

    if (this.isInitialized) {
      window.gtag('config', this.gaId, {
        page_path: pagePath,
        page_title: pageTitle
      })
    }

    this.trackEvent('page_view', {
      event_category: 'navigation',
      event_label: pageTitle,
      page_load_time: performance.now()
    })
  }

  /**
   * 사용자 참여도 추적
   */
  trackUserEngagement(engagementTime: number, scrollDepth: number) {
    this.sessionData.totalEngagementTime += engagementTime
    this.sessionData.lastActivity = Date.now()

    this.trackEvent('user_engagement', {
      event_category: 'engagement',
      time_spent: engagementTime,
      scroll_depth: scrollDepth,
      value: Math.floor(engagementTime / 1000) // 초 단위
    })
  }

  /**
   * 음식 선택 완료 추적
   */
  trackFoodSelection(foodData: {
    id: string
    name: string
    category: string
    emoji: string
    filters: string[]
    selectionTime: number
  }) {
    this.sessionData.foodSelections++
    this.sessionData.filtersUsed = [
      ...new Set([...this.sessionData.filtersUsed, ...foodData.filters])
    ]

    this.trackEvent('food_selection_complete', {
      event_category: 'food_selection',
      event_label: foodData.name,
      food_id: foodData.id,
      food_name: foodData.name,
      food_category: foodData.category,
      food_emoji: foodData.emoji,
      applied_filters: foodData.filters,
      time_spent: foodData.selectionTime,
      value: 1
    })
  }

  /**
   * 오류 추적
   */
  trackError(error: Error, context: string) {
    this.trackEvent('error_occurred', {
      event_category: 'error',
      event_label: context,
      error_message: error.message,
      error_stack: error.stack,
      error_page: window.location.pathname
    })
  }

  /**
   * 유틸리티 메서드들
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop' as const,
        userAgent: '',
        screenSize: '',
        connectionType: ''
      }
    }

    const screenWidth = window.screen.width
    const deviceType = screenWidth < 640 ? 'mobile' : 
                      screenWidth < 1024 ? 'tablet' : 'desktop'

    return {
      type: deviceType,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    }
  }

  private getUserType(): string {
    const visits = localStorage.getItem('kyou_nani_visits')
    const visitCount = visits ? parseInt(visits) + 1 : 1
    localStorage.setItem('kyou_nani_visits', visitCount.toString())

    if (visitCount === 1) return 'new_user'
    if (visitCount <= 3) return 'returning_user'
    return 'loyal_user'
  }

  private updateSessionData(type: AnalyticsEventType, params: AnalyticsEventParams) {
    this.sessionData.lastActivity = Date.now()

    if (type === 'food_selection_complete') {
      this.sessionData.foodSelections++
    }

    if (params.filter_type && !this.sessionData.filtersUsed.includes(params.filter_type)) {
      this.sessionData.filtersUsed.push(params.filter_type)
    }
  }

  private saveAnalyticsData(eventData: any) {
    try {
      const existingData = localStorage.getItem('kyou_nani_analytics') || '[]'
      const analyticsHistory = JSON.parse(existingData)
      
      analyticsHistory.push({
        ...eventData,
        timestamp: Date.now()
      })

      // 최근 100개 이벤트만 보관
      const recentEvents = analyticsHistory.slice(-100)
      localStorage.setItem('kyou_nani_analytics', JSON.stringify(recentEvents))
    } catch (error) {
      console.warn('분석 데이터 저장 실패:', error)
    }
  }

  private flushEventQueue() {
    while (this.eventQueue.length > 0) {
      const eventData = this.eventQueue.shift()
      if (eventData) {
        this.sendToGA4(eventData)
        this.sendToCustomAnalytics(eventData)
      }
    }
  }

  /**
   * 세션 요약 정보 반환
   */
  getSessionSummary() {
    const sessionDuration = Date.now() - this.sessionData.startTime
    
    return {
      sessionId: this.sessionData.sessionId,
      duration: sessionDuration,
      pageViews: this.sessionData.pageViews,
      foodSelections: this.sessionData.foodSelections,
      filtersUsed: this.sessionData.filtersUsed.length,
      engagementTime: this.sessionData.totalEngagementTime,
      deviceType: this.sessionData.deviceInfo.type
    }
  }

  /**
   * 분석 데이터 내보내기
   */
  exportAnalyticsData() {
    try {
      const analyticsData = localStorage.getItem('kyou_nani_analytics')
      const sessionSummary = this.getSessionSummary()
      
      return {
        session: sessionSummary,
        events: analyticsData ? JSON.parse(analyticsData) : [],
        exportTime: new Date().toISOString()
      }
    } catch (error) {
      console.error('분석 데이터 내보내기 실패:', error)
      return null
    }
  }
}

// 전역 인스턴스 생성
export const analytics = new AnalyticsManager()

// React Hook으로 사용하기 위한 편의 함수들
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserEngagement: analytics.trackUserEngagement.bind(analytics),
    trackFoodSelection: analytics.trackFoodSelection.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getSessionSummary: analytics.getSessionSummary.bind(analytics),
    exportData: analytics.exportAnalyticsData.bind(analytics)
  }
}

export default analytics 