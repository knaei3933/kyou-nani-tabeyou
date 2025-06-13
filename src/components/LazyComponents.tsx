'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

/**
 * 지연 로딩 컴포넌트 정의
 * 무거운 컴포넌트들을 필요할 때만 로드하여 초기 번들 크기 최적화
 */

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
    <span className="ml-3 text-gray-600">読み込み中...</span>
  </div>
)

// 카드 스켈레톤
const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
)

// 그리드 스켈레톤
const GridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
)

/**
 * 성능 모니터링 컴포넌트 (지연 로딩)
 * 개발 환경에서만 필요하므로 지연 로딩
 */
export const LazyPerformanceMonitor = dynamic(
  () => import('./PerformanceMonitor'),
  {
    loading: () => null, // 성능 모니터는 로딩 표시 불필요
    ssr: false // 클라이언트에서만 실행
  }
)

/**
 * 플로우 완료 다이얼로그 (지연 로딩)
 * 사용자가 마지막 단계에서만 필요
 */
export const LazyFlowCompletionDialog = dynamic(
  () => import('./ui/flow-navigation').then(mod => ({ default: mod.FlowCompletionDialog })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
)

/**
 * 차트 컴포넌트 (지연 로딩)
 * 통계 페이지에서만 사용되므로 지연 로딩
 */
export const LazyChartComponent = dynamic(
  () => import('./ui/charts'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

/**
 * 이미지 갤러리 (지연 로딩)
 * 레스토랑 상세 페이지에서만 필요
 */
export const LazyImageGallery = dynamic(
  () => import('./ui/ImageGallery'),
  {
    loading: () => <CardSkeleton />,
    ssr: false
  }
)

/**
 * 지도 컴포넌트 (지연 로딩)
 * 위치 선택 페이지에서만 필요
 */
export const LazyMapComponent = dynamic(
  () => import('./ui/MapComponent'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <LoadingSpinner />
        </div>
      </div>
    ),
    ssr: false
  }
)

/**
 * 리뷰 시스템 (지연 로딩)
 * 레스토랑 상세 페이지의 리뷰 탭에서만 필요
 */
export const LazyReviewSystem = dynamic(
  () => import('./ui/ReviewSystem'),
  {
    loading: () => <GridSkeleton count={3} />,
    ssr: true // SEO를 위해 서버사이드 렌더링 허용
  }
)

/**
 * 푸시 알림 컴포넌트 (지연 로딩)
 * 사용자 설정에서만 필요
 */
export const LazyPushNotificationSetup = dynamic(
  () => import('./ui/PushNotificationSetup'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

/**
 * 고급 필터 컴포넌트 (지연 로딩)
 * 사용자가 고급 검색을 요청할 때만 로드
 */
export const LazyAdvancedFilters = dynamic(
  () => import('./ui/AdvancedFilters'),
  {
    loading: () => (
      <div className="p-4 border rounded-lg">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
)

/**
 * 사용자 프로필 컴포넌트 (지연 로딩)
 * 로그인 후에만 필요
 */
export const LazyUserProfile = dynamic(
  () => import('./user/UserProfile'),
  {
    loading: () => <CardSkeleton />,
    ssr: false
  }
)

/**
 * 결제 시스템 (지연 로딩)
 * 주문 확정 시에만 필요
 */
export const LazyPaymentSystem = dynamic(
  () => import('./payment/PaymentSystem'),
  {
    loading: () => (
      <div className="p-6 border rounded-lg">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
)

/**
 * Wrapper 컴포넌트 - Suspense와 함께 사용
 */
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

/**
 * 조건부 지연 로딩 훅
 * 특정 조건에서만 컴포넌트를 로드
 */
export const useConditionalLazyLoad = (
  condition: boolean,
  componentImport: () => Promise<any>
) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (condition && !Component && !loading) {
      setLoading(true)
      componentImport()
        .then((module) => {
          setComponent(() => module.default || module)
          setLoading(false)
        })
        .catch((error) => {
          console.error('지연 로딩 실패:', error)
          setLoading(false)
        })
    }
  }, [condition, Component, loading, componentImport])

  return { Component, loading }
}

/**
 * 번들 크기 최적화를 위한 라이브러리 지연 로딩
 */

// Lucide 아이콘 지연 로딩
export const getLucideIcon = async (iconName: string) => {
  const icons = await import('lucide-react')
  return icons[iconName as keyof typeof icons]
}

// Date-fns 함수 지연 로딩
export const getDateFnsFunction = async (functionName: string) => {
  const dateFns = await import('date-fns')
  return dateFns[functionName as keyof typeof dateFns]
}

export default {
  LazyPerformanceMonitor,
  LazyFlowCompletionDialog,
  LazyChartComponent,
  LazyImageGallery,
  LazyMapComponent,
  LazyReviewSystem,
  LazyPushNotificationSetup,
  LazyAdvancedFilters,
  LazyUserProfile,
  LazyPaymentSystem,
  LazyWrapper,
  useConditionalLazyLoad,
  getLucideIcon,
  getDateFnsFunction
} 