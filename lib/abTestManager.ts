/**
 * A/Bテストマネージャー
 * - 다양한 UI/UX 버전 테스트
 * - 실시간 성과 모니터링
 * - 통계적 유의성 검증
 * - 자동 승자 선택
 */

import { analytics } from './analytics'

/**
 * A/B 테스트 버전 정의
 */
export interface ABTestVariant {
  id: string
  name: string
  description: string
  weight: number // 트래픽 분배 비율 (0-100)
  config: Record<string, any>
  isControl: boolean
}

/**
 * A/B 테스트 설정
 */
export interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate: number
  endDate?: number
  targetMetric: string
  minimumSampleSize: number
  confidenceLevel: number // 95%, 99% 등
  variants: ABTestVariant[]
  results?: ABTestResults
}

/**
 * A/B 테스트 결과
 */
export interface ABTestResults {
  testId: string
  duration: number
  totalParticipants: number
  variants: Array<{
    id: string
    name: string
    participants: number
    conversions: number
    conversionRate: number
    confidenceInterval: [number, number]
    statisticalSignificance: number
    isWinner?: boolean
  }>
  winnerVariant?: string
  improvementPercent?: number
  isStatisticallySignificant: boolean
}

/**
 * 사용자 세그먼트
 */
export interface UserSegment {
  id: string
  name: string
  conditions: Array<{
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }>
}

/**
 * A/B 테스트 매니저 클래스
 */
export class ABTestManager {
  private activeTests: Map<string, ABTest> = new Map()
  private userAssignments: Map<string, Map<string, string>> = new Map() // userId -> testId -> variantId
  private testResults: Map<string, ABTestResults> = new Map()

  constructor() {
    this.loadFromStorage()
    this.setupDefaultTests()
  }

  /**
   * 기본 A/B 테스트 설정
   */
  private setupDefaultTests() {
    // 홈페이지 레이아웃 테스트
    this.createTest({
      id: 'home_layout_test',
      name: 'ホームページレイアウト最適化',
      description: '홈페이지 레이아웃과 CTA 버튼 위치 최적화',
      status: 'running',
      startDate: Date.now(),
      targetMetric: 'food_selection_start',
      minimumSampleSize: 100,
      confidenceLevel: 95,
      variants: [
        {
          id: 'control',
          name: 'オリジナル',
          description: '기존 레이아웃',
          weight: 50,
          config: {
            layout: 'original',
            ctaPosition: 'bottom',
            showWelcomeMessage: true
          },
          isControl: true
        },
        {
          id: 'optimized',
          name: '最適化バージョン',
          description: '최적화된 레이아웃',
          weight: 50,
          config: {
            layout: 'optimized',
            ctaPosition: 'center',
            showWelcomeMessage: false,
            showFoodPreview: true
          },
          isControl: false
        }
      ]
    })

    // 음식 선택 UI 테스트
    this.createTest({
      id: 'food_selection_ui_test',
      name: '食事選択UI改善',
      description: '음식 선택 인터페이스 개선',
      status: 'running',
      startDate: Date.now(),
      targetMetric: 'food_selection_complete',
      minimumSampleSize: 150,
      confidenceLevel: 95,
      variants: [
        {
          id: 'grid_view',
          name: 'グリッドビュー',
          description: '그리드 형태 선택',
          weight: 33,
          config: {
            viewType: 'grid',
            cardsPerRow: 3,
            showEmoji: true,
            showCategory: true
          },
          isControl: true
        },
        {
          id: 'list_view',
          name: 'リストビュー',
          description: '리스트 형태 선택',
          weight: 33,
          config: {
            viewType: 'list',
            showDescription: true,
            showEmoji: true,
            showCategory: false
          },
          isControl: false
        },
        {
          id: 'card_view',
          name: 'カードビュー',
          description: '카드 형태 선택',
          weight: 34,
          config: {
            viewType: 'cards',
            showImage: true,
            showEmoji: false,
            showDescription: true,
            cardSize: 'large'
          },
          isControl: false
        }
      ]
    })

    // 필터 UI 테스트
    this.createTest({
      id: 'filter_ui_test',
      name: 'フィルターUI最適化',
      description: '필터 인터페이스 최적화',
      status: 'running',
      startDate: Date.now(),
      targetMetric: 'filter_applied',
      minimumSampleSize: 80,
      confidenceLevel: 95,
      variants: [
        {
          id: 'sidebar',
          name: 'サイドバー',
          description: '사이드바 형태',
          weight: 50,
          config: {
            filterPosition: 'sidebar',
            showFilterCount: true,
            collapsible: true
          },
          isControl: true
        },
        {
          id: 'top_bar',
          name: 'トップバー',
          description: '상단바 형태',
          weight: 50,
          config: {
            filterPosition: 'top',
            showFilterCount: false,
            horizontal: true,
            sticky: true
          },
          isControl: false
        }
      ]
    })
  }

  /**
   * A/B 테스트 생성
   */
  createTest(testConfig: Omit<ABTest, 'results'>): void {
    const test: ABTest = {
      ...testConfig,
      results: undefined
    }

    this.activeTests.set(test.id, test)
    this.saveToStorage()

    console.log(`🧪 A/B테스트 생성: ${test.name}`)
  }

  /**
   * 사용자를 A/B 테스트에 할당
   */
  assignUserToTest(testId: string, userId: string, segment?: UserSegment): string | null {
    const test = this.activeTests.get(testId)
    if (!test || test.status !== 'running') {
      return null
    }

    // 이미 할당된 경우 기존 배리언트 반환
    const existingAssignment = this.userAssignments.get(userId)?.get(testId)
    if (existingAssignment) {
      return existingAssignment
    }

    // 세그먼트 조건 확인
    if (segment && !this.isUserInSegment(userId, segment)) {
      return null
    }

    // 가중치 기반 배리언트 선택
    const selectedVariant = this.selectVariantByWeight(test.variants)
    
    // 할당 저장
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map())
    }
    this.userAssignments.get(userId)!.set(testId, selectedVariant.id)

    // 분석 이벤트 전송
    analytics.trackEvent('user_engagement', {
      event_category: 'ab_test_assignment',
      event_label: `${testId}:${selectedVariant.id}`,
      value: 1
    })

    this.saveToStorage()
    
    console.log(`👤 사용자 ${userId} -> ${testId}:${selectedVariant.id} 할당`)
    
    return selectedVariant.id
  }

  /**
   * 가중치 기반 배리언트 선택
   */
  private selectVariantByWeight(variants: ABTestVariant[]): ABTestVariant {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)
    const random = Math.random() * totalWeight
    
    let cumulativeWeight = 0
    for (const variant of variants) {
      cumulativeWeight += variant.weight
      if (random <= cumulativeWeight) {
        return variant
      }
    }
    
    return variants[0] // 폴백
  }

  /**
   * 전환 이벤트 기록
   */
  recordConversion(testId: string, userId: string, metricValue: number = 1): void {
    const test = this.activeTests.get(testId)
    if (!test) return

    const variantId = this.userAssignments.get(userId)?.get(testId)
    if (!variantId) return

    // 결과 데이터 업데이트
    if (!this.testResults.has(testId)) {
      this.initializeTestResults(testId)
    }

    const results = this.testResults.get(testId)!
    const variantResult = results.variants.find(v => v.id === variantId)
    
    if (variantResult) {
      variantResult.conversions += metricValue
      variantResult.conversionRate = variantResult.conversions / variantResult.participants
    }

    // 통계적 유의성 계산
    this.updateStatisticalSignificance(testId)

    // 분석 이벤트 전송
    analytics.trackEvent('user_engagement', {
      event_category: 'ab_test_conversion',
      event_label: `${testId}:${variantId}`,
      value: metricValue
    })

    this.saveToStorage()
    
    console.log(`📈 전환 기록: ${testId}:${variantId} (+${metricValue})`)
  }

  /**
   * 테스트 결과 초기화
   */
  private initializeTestResults(testId: string): void {
    const test = this.activeTests.get(testId)!
    
    const results: ABTestResults = {
      testId,
      duration: Date.now() - test.startDate,
      totalParticipants: 0,
      variants: test.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        confidenceInterval: [0, 0],
        statisticalSignificance: 0
      })),
      isStatisticallySignificant: false
    }

    this.testResults.set(testId, results)
  }

  /**
   * 통계적 유의성 계산
   */
  private updateStatisticalSignificance(testId: string): void {
    const results = this.testResults.get(testId)
    if (!results) return

    // 참가자 수 업데이트
    results.variants.forEach(variant => {
      variant.participants = this.countParticipants(testId, variant.id)
    })

    results.totalParticipants = results.variants.reduce((sum, v) => sum + v.participants, 0)

    // 최소 샘플 사이즈 확인
    const test = this.activeTests.get(testId)!
    if (results.totalParticipants < test.minimumSampleSize) {
      return
    }

    // Control vs Test 비교 (첫 번째 vs 나머지)
    const control = results.variants.find(v => v.id === test.variants.find(tv => tv.isControl)?.id)
    const testVariants = results.variants.filter(v => v.id !== control?.id)

    if (!control || testVariants.length === 0) return

    // Z-test 수행
    testVariants.forEach(testVariant => {
      const zScore = this.calculateZScore(control, testVariant)
      const pValue = this.calculatePValue(zScore)
      
      testVariant.statisticalSignificance = (1 - pValue) * 100

      // 95% 신뢰도로 유의미한지 확인
      if (testVariant.statisticalSignificance >= test.confidenceLevel) {
        results.isStatisticallySignificant = true
        
        // 승자 결정
        if (testVariant.conversionRate > control.conversionRate) {
          results.winnerVariant = testVariant.id
          results.improvementPercent = ((testVariant.conversionRate - control.conversionRate) / control.conversionRate) * 100
          testVariant.isWinner = true
        }
      }
    })
  }

  /**
   * Z-score 계산
   */
  private calculateZScore(control: any, test: any): number {
    const p1 = control.conversionRate
    const n1 = control.participants
    const p2 = test.conversionRate
    const n2 = test.participants

    if (n1 === 0 || n2 === 0) return 0

    const pooledP = (control.conversions + test.conversions) / (n1 + n2)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2))

    if (se === 0) return 0

    return (p2 - p1) / se
  }

  /**
   * P-value 계산 (간단한 근사)
   */
  private calculatePValue(zScore: number): number {
    // 표준정규분포 근사
    const absZ = Math.abs(zScore)
    if (absZ > 6) return 0
    
    // 간단한 근사식
    return Math.exp(-0.717 * absZ - 0.416 * absZ * absZ)
  }

  /**
   * 특정 배리언트 참가자 수 계산
   */
  private countParticipants(testId: string, variantId: string): number {
    let count = 0
    for (const userAssignments of this.userAssignments.values()) {
      if (userAssignments.get(testId) === variantId) {
        count++
      }
    }
    return count
  }

  /**
   * 사용자 세그먼트 확인
   */
  private isUserInSegment(userId: string, segment: UserSegment): boolean {
    // 간단한 구현 - 실제로는 사용자 데이터와 비교
    return true
  }

  /**
   * 사용자의 배리언트 가져오기
   */
  getUserVariant(testId: string, userId: string): string | null {
    return this.userAssignments.get(userId)?.get(testId) || null
  }

  /**
   * 테스트 설정 가져오기
   */
  getTestConfig(testId: string, variantId: string): Record<string, any> | null {
    const test = this.activeTests.get(testId)
    if (!test) return null

    const variant = test.variants.find(v => v.id === variantId)
    return variant?.config || null
  }

  /**
   * 테스트 결과 가져오기
   */
  getTestResults(testId: string): ABTestResults | null {
    return this.testResults.get(testId) || null
  }

  /**
   * 활성 테스트 목록
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running')
  }

  /**
   * 테스트 종료
   */
  completeTest(testId: string): void {
    const test = this.activeTests.get(testId)
    if (test) {
      test.status = 'completed'
      test.endDate = Date.now()
      this.saveToStorage()
      
      console.log(`🏁 A/B테스트 완료: ${test.name}`)
    }
  }

  /**
   * 스토리지 저장
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('kyou_nani_ab_tests', JSON.stringify({
        tests: Array.from(this.activeTests.entries()),
        assignments: Array.from(this.userAssignments.entries()).map(([userId, tests]) => [
          userId,
          Array.from(tests.entries())
        ]),
        results: Array.from(this.testResults.entries())
      }))
    } catch (error) {
      console.warn('A/B테스트 저장 실패:', error)
    }
  }

  /**
   * 스토리지 로드
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('kyou_nani_ab_tests')
      if (!stored) return

      const data = JSON.parse(stored)
      
      // 테스트 복원
      if (data.tests) {
        this.activeTests = new Map(data.tests)
      }

      // 할당 복원
      if (data.assignments) {
        this.userAssignments = new Map(
          data.assignments.map(([userId, tests]: [string, any[]]) => [
            userId,
            new Map(tests)
          ])
        )
      }

      // 결과 복원
      if (data.results) {
        this.testResults = new Map(data.results)
      }

    } catch (error) {
      console.warn('A/B테스트 로드 실패:', error)
    }
  }

  /**
   * 테스트 데이터 내보내기
   */
  exportTestData(): any {
    return {
      tests: Array.from(this.activeTests.values()),
      results: Array.from(this.testResults.values()),
      totalParticipants: this.userAssignments.size,
      exportTime: new Date().toISOString()
    }
  }
}

// 전역 인스턴스
export const abTestManager = new ABTestManager()

// React Hook
export const useABTest = (testId: string, userId: string) => {
  const variantId = abTestManager.assignUserToTest(testId, userId)
  const config = variantId ? abTestManager.getTestConfig(testId, variantId) : null
  
  return {
    variantId,
    config,
    recordConversion: (value?: number) => abTestManager.recordConversion(testId, userId, value),
    isInTest: !!variantId
  }
}

export default abTestManager 