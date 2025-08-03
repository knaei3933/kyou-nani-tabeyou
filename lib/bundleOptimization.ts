/**
 * バンドル最適化ユーティリティ
 * - コード分割
 * - Tree Shaking 최적화
 * - 動的インポート管理
 */

/**
 * 라우트별 코드 분할 설정
 */
export const ROUTE_CHUNKS = {
  HOME: 'home',
  FOOD_SELECTION: 'food-selection', 
  SIMPLE_TEST: 'simple-test',
  RESULT: 'result',
  RESTAURANT: 'restaurant',
  LOCATION: 'location',
  USER: 'user',
  ADMIN: 'admin'
} as const

/**
 * 컴포넌트 우선순위
 */
export const COMPONENT_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  LAZY: 5
} as const

/**
 * 동적 임포트 관리자
 */
export class DynamicImportManager {
  private loadedModules = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()

  async loadModule<T>(
    moduleId: string,
    importFunction: () => Promise<T>,
    condition: boolean = true
  ): Promise<T | null> {
    if (!condition) return null

    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)
    }

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

  cleanup(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }

  getStatus() {
    return {
      loaded: Array.from(this.loadedModules.keys()),
      loading: Array.from(this.loadingPromises.keys()),
      total: this.loadedModules.size + this.loadingPromises.size
    }
  }
}

/**
 * Tree Shaking 최적화
 */
export const selectiveImport = {
  async lodash(functionName: string) {
    try {
      const module = await import(`lodash/${functionName}`)
      return module.default
    } catch (error) {
      console.warn(`Lodash ${functionName} 로드 실패:`, error)
      return null
    }
  }
}

/**
 * 번들 분석기
 */
export class BundleAnalyzer {
  async analyzeBundleSize() {
    if (typeof window === 'undefined') {
      return {
        totalSize: 0,
        chunkSizes: {},
        loadTime: 0,
        cacheHitRate: 0
      }
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const totalSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0)
    }, 0)

    const chunkSizes: Record<string, number> = {}
    resources.forEach((resource) => {
      if (resource.name.includes('chunk') || resource.name.includes('.js')) {
        const chunkName = this.extractChunkName(resource.name)
        chunkSizes[chunkName] = (chunkSizes[chunkName] || 0) + (resource.transferSize || 0)
      }
    })

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0

    const cachedResources = resources.filter(r => r.transferSize === 0).length
    const cacheHitRate = resources.length > 0 ? (cachedResources / resources.length) * 100 : 0

    return {
      totalSize,
      chunkSizes,
      loadTime,
      cacheHitRate
    }
  }

  private extractChunkName(url: string): string {
    const match = url.match(/([^\/]+)\.chunk\.js$/)
    return match ? match[1] : 'unknown'
  }

  generateReport(metrics: any): string {
    const totalSizeMB = (metrics.totalSize / (1024 * 1024)).toFixed(2)
    const loadTimeSeconds = (metrics.loadTime / 1000).toFixed(2)

    let report = `📊 バンドル分析レポート\n`
    report += `📦 総サイズ: ${totalSizeMB}MB\n`
    report += `⏱️ 読み込み時間: ${loadTimeSeconds}秒\n`
    report += `💾 キャッシュ効率: ${metrics.cacheHitRate.toFixed(1)}%\n`

    return report
  }
}

// 전역 인스턴스
export const dynamicImportManager = new DynamicImportManager()
export const bundleAnalyzer = new BundleAnalyzer()

// 개발 도구
export const devTools = {
  async analyzeBundles() {
    if (process.env.NODE_ENV !== 'development') return

    const metrics = await bundleAnalyzer.analyzeBundleSize()
    const report = bundleAnalyzer.generateReport(metrics)
    
    console.group('🚀 Bundle Analysis')
    console.log(report)
    console.groupEnd()
  },

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