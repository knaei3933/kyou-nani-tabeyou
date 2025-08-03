'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

/**
 * 最適化された画像コンポーネント
 * - WebP自動変換
 * - 遅延読み込み
 * - プレースホルダー表示
 * - レスポンシブ対応
 * - エラーハンドリング
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fill = false,
  quality = 85,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 読み込み完了ハンドラー
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  // エラーハンドラー
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // エラー時のフォールバック画像
  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400 text-sm',
        fill ? 'absolute inset-0' : '',
        className
      )} style={{ width, height }}>
        <div className="text-center">
          <div className="text-2xl mb-1">📷</div>
          <div>画像が読み込めません</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* ローディングスケルトン */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
          fill ? 'absolute inset-0' : ''
        )} style={{ width, height }}>
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        </div>
      )}

      {/* 最適化された画像 */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        // WebP自動変換のためのformat指定
        style={{
          objectFit: 'cover',
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      />
    </div>
  )
}

/**
 * 食べ物画像専用コンポーネント
 * - 1:1 アスペクト比
 * - 美味しそうに見えるフィルター
 * - カテゴリー別最適化
 */
export function FoodImage({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizeMap = {
    sm: { width: 120, height: 120 },
    md: { width: 200, height: 200 },
    lg: { width: 300, height: 300 },
    xl: { width: 400, height: 400 }
  }

  const dimensions = sizeMap[size]

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn(
        'rounded-xl overflow-hidden shadow-lg',
        'filter brightness-105 contrast-105 saturate-110', // 美味しそうフィルター
        className
      )}
      quality={90} // 食べ物は高品質で
      sizes={`${dimensions.width}px`}
      {...props}
    />
  )
}

/**
 * レストラン画像専用コンポーネント
 * - 16:9 アスペクト比
 * - 店舗の雰囲気を重視
 */
export function RestaurantImage({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizeMap = {
    sm: { width: 240, height: 135 },
    md: { width: 320, height: 180 },
    lg: { width: 480, height: 270 },
    xl: { width: 640, height: 360 }
  }

  const dimensions = sizeMap[size]

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn(
        'rounded-lg overflow-hidden shadow-md',
        className
      )}
      quality={80}
      sizes={`(max-width: 640px) 100vw, ${dimensions.width}px`}
      {...props}
    />
  )
}

/**
 * アバター画像専用コンポーネント
 * - 円形
 * - 小さなサイズでも鮮明
 */
export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) {
  const sizeMap = {
    xs: { width: 32, height: 32 },
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 }
  }

  const dimensions = sizeMap[size]

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn(
        'rounded-full border-2 border-white shadow-sm',
        className
      )}
      quality={95} // アバターは高品質で
      sizes={`${dimensions.width}px`}
      {...props}
    />
  )
} 