/**
 * 画像最適化ユーティリティ
 * - URL生成
 * - プレースホルダー作成
 * - 画質最適化
 * - レスポンシブ対応
 */

// 이미지 크기 타입 정의
export type ImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type AspectRatio = '1:1' | '4:3' | '16:9' | '3:2' | '2:3'

// 디바이스별 이미지 크기 매핑
export const IMAGE_SIZES: Record<ImageSize, { width: number; height: number }> = {
  xs: { width: 64, height: 64 },
  sm: { width: 128, height: 128 },
  md: { width: 256, height: 256 },
  lg: { width: 512, height: 512 },
  xl: { width: 768, height: 768 },
  '2xl': { width: 1024, height: 1024 }
}

// 화면비별 크기 계산
export const ASPECT_RATIOS: Record<AspectRatio, (width: number) => { width: number; height: number }> = {
  '1:1': (width) => ({ width, height: width }),
  '4:3': (width) => ({ width, height: Math.round(width * 3 / 4) }),
  '16:9': (width) => ({ width, height: Math.round(width * 9 / 16) }),
  '3:2': (width) => ({ width, height: Math.round(width * 2 / 3) }),
  '2:3': (width) => ({ width, height: Math.round(width * 3 / 2) })
}

/**
 * 최적화된 이미지 URL 생성
 * @param src 원본 이미지 URL
 * @param options 최적화 옵션
 */
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  } = {}
): string {
  const {
    width = 400,
    height = 400,
    quality = 85,
    format = 'webp'
  } = options

  // 외부 이미지 최적화 서비스 URL 생성 (Cloudinary, Imagekit 등)
  if (src.startsWith('http')) {
    // 예: Unsplash 이미지 최적화
    if (src.includes('unsplash.com')) {
      const url = new URL(src)
      url.searchParams.set('w', width.toString())
      url.searchParams.set('h', height.toString())
      url.searchParams.set('q', quality.toString())
      url.searchParams.set('fm', format)
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }
    
    // 기본 외부 이미지는 Next.js Image 컴포넌트에 맡김
    return src
  }

  // 로컬 이미지는 그대로 반환 (Next.js가 자동 최적화)
  return src
}

/**
 * 블러 플레이스홀더 데이터 생성
 * @param width 이미지 너비
 * @param height 이미지 높이
 * @param color 기본 색상
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
  
  if (!canvas) {
    // 서버 사이드에서는 간단한 SVG 반환
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>`
    )}`
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

/**
 * 음식 카테고리별 색상 매핑
 */
export const FOOD_CATEGORY_COLORS: Record<string, string> = {
  '일식': '#ff6b6b',
  '중식': '#feca57',
  '양식': '#48dbfb',
  '한식': '#ff9ff3',
  '카페': '#54a0ff',
  '패스트푸드': '#5f27cd',
  '디저트': '#00d2d3',
  '기타': '#a0a0a0'
}

/**
 * 카테고리별 블러 플레이스홀더 생성
 */
export function getFoodCategoryPlaceholder(category: string): string {
  const color = FOOD_CATEGORY_COLORS[category] || FOOD_CATEGORY_COLORS['기타']
  return generateBlurDataURL(20, 20, color)
}

/**
 * 레스포시브 이미지 sizes 속성 생성
 */
export function generateResponsiveSizes(
  sizes: {
    mobile?: string
    tablet?: string
    desktop?: string
  } = {}
): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw'
  } = sizes

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`
}

/**
 * 이미지 로딩 상태 관리
 */
export interface ImageLoadState {
  loading: boolean
  error: boolean
  loaded: boolean
}

export function createImageLoadState(): ImageLoadState {
  return {
    loading: true,
    error: false,
    loaded: false
  }
}

/**
 * 이미지 미리 로드 함수
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * 이미지 배치 미리 로드
 */
export async function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * 중요 이미지 우선 로딩 설정
 */
export const PRIORITY_IMAGES = {
  HERO: true,           // 히어로 이미지
  ABOVE_FOLD: true,     // 스크롤 없이 보이는 이미지
  FEATURED: true,       // 추천 상품 이미지
  BELOW_FOLD: false     // 스크롤 후 보이는 이미지
}

/**
 * 이미지 성능 메트릭 수집
 */
export function measureImagePerformance(imageName: string) {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes(imageName)) {
        console.log(`이미지 로딩 시간 (${imageName}):`, entry.duration, 'ms')
        
        // 성능 데이터를 분석 도구에 전송 (예: Google Analytics)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'image_load_time', {
            image_name: imageName,
            load_time: entry.duration,
            custom_parameter: 'image_performance'
          })
        }
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
}

/**
 * WebP 지원 감지
 */
export function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)

  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * AVIF 지원 감지
 */
export function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)

  return new Promise((resolve) => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

export default {
  getOptimizedImageUrl,
  generateBlurDataURL,
  getFoodCategoryPlaceholder,
  generateResponsiveSizes,
  preloadImage,
  preloadImages,
  measureImagePerformance,
  supportsWebP,
  supportsAVIF
} 