'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

/**
 * Intersection Observer를 활용한 지연 로딩 훅
 * 화면에 보이는 요소만 로드하여 성능 최적화
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px',
  once = true
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // 이미 한 번 교차했고 once가 true면 더 이상 관찰하지 않음
    if (once && hasIntersected) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        setIsIntersecting(isVisible)
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, once, hasIntersected])

  return {
    ref,
    isIntersecting,
    hasIntersected,
    isVisible: once ? hasIntersected : isIntersecting
  }
}

/**
 * 이미지 지연 로딩 전용 훅
 * 더 세밀한 제어를 위한 특화된 훅
 */
export function useImageLazyLoading(options?: UseIntersectionObserverProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.01,
    rootMargin: '100px', // 이미지는 미리 로드
    once: true,
    ...options
  })

  return {
    ref,
    shouldLoad: isVisible
  }
}

/**
 * 컴포넌트 지연 로딩 훅
 * 무거운 컴포넌트의 렌더링을 지연시킴
 */
export function useComponentLazyLoading(options?: UseIntersectionObserverProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px', // 컴포넌트는 더 일찍 로드
    once: true,
    ...options
  })

  return {
    ref,
    shouldRender: isVisible
  }
} 