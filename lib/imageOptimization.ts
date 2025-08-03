/**
 * 画像最適化ユーティリティ
 * - URL생성
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

/**
 * 최적화된 이미지 URL 생성
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

  // 외부 이미지 최적화
  if (src.startsWith('http')) {
    if (src.includes('unsplash.com')) {
      const url = new URL(src)
      url.searchParams.set('w', width.toString())
      url.searchParams.set('h', height.toString())
      url.searchParams.set('q', quality.toString())
      url.searchParams.set('fm', format)
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }
    return src
  }

  return src
}

/**
 * 블러 플레이스홀더 생성
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>`
  )}`
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
 * 레스포시브 sizes 속성 생성
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
 * 이미지 미리 로드
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

export default {
  getOptimizedImageUrl,
  generateBlurDataURL,
  getFoodCategoryPlaceholder,
  generateResponsiveSizes,
  preloadImage,
  supportsWebP
} 