/**
 * バンドル最適化ユーティリティ
 * - コード分割
 * - Tree Shaking 최적화
 * - 動的インポート管理
 * - 번들 크기 분석
 */

/**
 * 라우트별 코드 분할 설정
 */
export const ROUTE_CHUNKS = {
  // 메인 페이지 - 최우선 로드
  HOME: 'home',
  
  // 음식 선택 관련
  FOOD_SELECTION: 'food-selection',
  SIMPLE_TEST: 'simple-test',
  
  // 결과 및 레스토랑
  RESULT: 'result',
  RESTAURANT: 'restaurant',
  
  // 위치 선택
  LOCATION: 'location',
  
  // 사용자 관련 (지연 로딩)
  USER: 'user',
  PROFILE: 'profile',
  
  // 관리자 (최대 지연)
  ADMIN: 'admin'
} as const

/**
 * 컴포넌트별 우선순위 설정
 */
export const COMPONENT_PRIORITY = {
  CRITICAL: 1,    // 즉시 로드 (Above the fold)
  HIGH: 2,        // 빠른 로드 (User interaction)
  MEDIUM: 3,      // 지연 로드 (Below the fold)
  LOW: 4,         // 최대 지연 (Advanced features)
  LAZY: 5         // 조건부 로드 (Admin, Settings)
} as const

/**
 * 번들 크기 모니터링 설정
 */
export interface BundleMetrics {
  totalSize: number
  chunkSizes: Record<string, number>
  loadTime: number
  cacheHitRate: number
}

/**
 * 동적 임포트 래퍼
 */
export class DynamicImportManager {
  private loadedModules = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()

  /**
   * 모듈을 조건부로 로드
   */
  async loadModule<T>(
    moduleId: string,
    importFunction: () => Promise<T>,
    condition: boolean = true
  ): Promise<T | null> {
    if (!condition) return null

    // 이미 로드된 모듈이 있다면 반환
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)
    }

    // 현재 로딩 중인 모듈이 있다면 해당 Promise 반환
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)
    }

    // 새로운 모듈 로드 시작
    const loadingPromise = importFunction()
      .then((module) => {
        this.loadedModules.set(moduleId, module)
        this.loadingPromises.delete(moduleId)
        console.log(`✅ モジュール読み込み完了: ${moduleId}`)
        return module
      })
      .catch((error) => {
        this.loadingPromises.delete(moduleId)
        console.error(`❌ モジュール読み込み失敗: ${moduleId}`, error)
        throw error
      })

    this.loadingPromises.set(moduleId, loadingPromise)
    return loadingPromise
  }

  /**
   * 우선순위에 따른 배치 로딩
   */
  async batchLoad(
    modules: Array<{
      id: string
      importFunction: () => Promise<any>
      priority: number
    }>
  ): Promise<void> {
    // 우선순위별로 정렬
    const sortedModules = modules.sort((a, b) => a.priority - b.priority)

    // 우선순위가 높은 것부터 순차 로드
    for (const module of sortedModules) {
      await this.loadModule(module.id, module.importFunction)
    }
  }

  /**
   * 사용하지 않는 모듈 정리
   */
  cleanup(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }

  /**
   * 로드된 모듈 상태 확인
   */
  getStatus(): {
    loaded: string[]
    loading: string[]
    total: number
  } {
    return {
      loaded: Array.from(this.loadedModules.keys()),
      loading: Array.from(this.loadingPromises.keys()),
      total: this.loadedModules.size + this.loadingPromises.size
    }
  }
}

/**
 * Tree Shaking 최적화를 위한 선택적 임포트
 */
export const selectiveImport = {
  /**
   * Lodash 함수 선택적 임포트
   */
  async lodash(functionName: string) {
    try {
      const module = await import(`lodash/${functionName}`)
      return module.default
    } catch (error) {
      console.warn(`Lodash 함수 ${functionName} 로드 실패:`, error)
      return null
    }
  },

  /**
   * React 아이콘 선택적 임포트
   */
  async reactIcons(iconSet: string, iconName: string) {
    try {
      const module = await import(`react-icons/${iconSet}`)
      return module[iconName]
    } catch (error) {
      console.warn(`React 아이콘 ${iconSet}/${iconName} 로드 실패:`, error)
      return null
    }
  },

  /**
   * Chart.js 컴포넌트 선택적 임포트
   */
  async chartComponent(componentName: string) {
    try {
      const module = await import('chart.js/auto')
      return module[componentName]
    } catch (error) {
      console.warn(`Chart.js 컴포넌트 ${componentName} 로드 실패:`, error)
      return null
    }
  }
}

/**
 * 번들 크기 분석기
 */
export class BundleAnalyzer {
  /**
   * 번들 크기 측정
   */
  async analyzeBundleSize(): Promise<BundleMetrics> {
    if (typeof window === 'undefined') {
      return {
        totalSize: 0,
        chunkSizes: {},
        loadTime: 0,
        cacheHitRate: 0
      }
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const resources = performance.getEntriesByType('resource')

    // 총 리소스 크기 계산
    const totalSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0)
    }, 0)

    // 청크별 크기 분석
    const chunkSizes: Record<string, number> = {}
    resources.forEach((resource) => {
      if (resource.name.includes('chunk') || resource.name.includes('.js')) {
        const chunkName = this.extractChunkName(resource.name)
        chunkSizes[chunkName] = (chunkSizes[chunkName] || 0) + (resource.transferSize || 0)
      }
    })

    // 로드 시간 계산
    const loadTime = navigation.loadEventEnd - navigation.navigationStart

    // 캐시 적중률 계산 (간소화된 버전)
    const cachedResources = resources.filter(r => r.transferSize === 0).length
    const cacheHitRate = (cachedResources / resources.length) * 100

    return {
      totalSize,
      chunkSizes,
      loadTime,
      cacheHitRate
    }
  }

  /**
   * 청크 이름 추출
   */
  private extractChunkName(url: string): string {
    const match = url.match(/([^\/]+)\.chunk\.js$/)
    return match ? match[1] : 'unknown'
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(metrics: BundleMetrics): string {
    const totalSizeMB = (metrics.totalSize / (1024 * 1024)).toFixed(2)
    const loadTimeSeconds = (metrics.loadTime / 1000).toFixed(2)

    let report = `📊 バンドル分析レポート\n`
    report += `🔄 総サイズ: ${totalSizeMB}MB\n`
    report += `⏱️ 読み込み時間: ${loadTimeSeconds}秒\n`
    report += `📦 キャッシュ効率: ${metrics.cacheHitRate.toFixed(1)}%\n\n`

    report += `📈 チャンク別サイズ:\n`
    Object.entries(metrics.chunkSizes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([chunk, size]) => {
        const sizeMB = (size / (1024 * 1024)).toFixed(2)
        report += `  ${chunk}: ${sizeMB}MB\n`
      })

    // 최적화 제안
    report += `\n💡 最適化提案:\n`
    if (metrics.totalSize > 5 * 1024 * 1024) {
      report += `  • 총 번들 크기가 5MB를 초과합니다. 코드 분할을 고려하세요.\n`
    }
    if (metrics.loadTime > 3000) {
      report += `  • 로드 시간이 3초를 초과합니다. 중요하지 않은 코드의 지연 로딩을 검토하세요.\n`
    }
    if (metrics.cacheHitRate < 50) {
      report += `  • 캐시 적중률이 낮습니다. 캐싱 전략을 개선하세요.\n`
    }

    return report
  }
}

/**
 * 전역 인스턴스
 */
export const dynamicImportManager = new DynamicImportManager()
export const bundleAnalyzer = new BundleAnalyzer()

/**
 * 개발 도구 - 번들 크기 모니터링
 */
export const devTools = {
  /**
   * 번들 분석 실행
   */
  async analyzeBundles() {
    if (process.env.NODE_ENV !== 'development') return

    const metrics = await bundleAnalyzer.analyzeBundleSize()
    const report = bundleAnalyzer.generateReport(metrics)
    
    console.group('🚀 Bundle Analysis')
    console.log(report)
    console.table(metrics.chunkSizes)
    console.groupEnd()
  },

  /**
   * 동적 임포트 상태 확인
   */
  checkImportStatus() {
    if (process.env.NODE_ENV !== 'development') return

    const status = dynamicImportManager.getStatus()
    console.log('📦 Dynamic Import Status:', status)
  }
}

export default {
  ROUTE_CHUNKS,
  COMPONENT_PRIORITY,
  DynamicImportManager,
  selectiveImport,
  BundleAnalyzer,
  dynamicImportManager,
  bundleAnalyzer,
  devTools
} 