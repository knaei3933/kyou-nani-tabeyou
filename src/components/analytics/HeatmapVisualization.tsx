/**
 * ヒートマップビジュアライゼーション
 * - 사용자 클릭 패턴 시각화
 * - 실시간 히트맵 생성
 * - 상호작용 영역 분석
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * 히트맵 데이터 포인트
 */
interface HeatmapPoint {
  x: number
  y: number
  intensity: number
  element: string
  timestamp: number
}

/**
 * 히트맵 설정
 */
interface HeatmapConfig {
  radius: number
  maxOpacity: number
  minOpacity: number
  blur: number
  gradient: Record<string, string>
}

/**
 * Props 인터페이스
 */
interface HeatmapVisualizationProps {
  points: HeatmapPoint[]
  width?: number
  height?: number
  config?: Partial<HeatmapConfig>
  isVisible?: boolean
  onHotspotClick?: (point: HeatmapPoint) => void
}

/**
 * 기본 히트맵 설정
 */
const defaultConfig: HeatmapConfig = {
  radius: 25,
  maxOpacity: 0.8,
  minOpacity: 0.1,
  blur: 15,
  gradient: {
    '0.0': 'rgba(0, 0, 255, 0)',
    '0.2': 'rgba(0, 255, 255, 0.3)',
    '0.4': 'rgba(0, 255, 0, 0.5)',
    '0.6': 'rgba(255, 255, 0, 0.7)',
    '0.8': 'rgba(255, 165, 0, 0.8)',
    '1.0': 'rgba(255, 0, 0, 1.0)'
  }
}

/**
 * 히트맵 시각화 컴포넌트
 */
const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({
  points,
  width = window.innerWidth,
  height = window.innerHeight,
  config = {},
  isVisible = false,
  onHotspotClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hotspots, setHotspots] = useState<Array<{
    x: number
    y: number
    radius: number
    intensity: number
    element: string
  }>>([])

  const finalConfig = { ...defaultConfig, ...config }

  /**
   * 히트맵 렌더링
   */
  useEffect(() => {
    if (!canvasRef.current || points.length === 0 || !isVisible) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height)

    // 데이터 정규화
    const maxIntensity = Math.max(...points.map(p => p.intensity))
    const normalizedPoints = points.map(point => ({
      ...point,
      normalizedIntensity: point.intensity / maxIntensity
    }))

    // 그라디언트 생성
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, finalConfig.radius)
    Object.entries(finalConfig.gradient).forEach(([stop, color]) => {
      gradient.addColorStop(parseFloat(stop), color)
    })

    // 히트맵 포인트 그리기
    ctx.globalCompositeOperation = 'multiply'
    
    normalizedPoints.forEach(point => {
      const opacity = finalConfig.minOpacity + 
        (finalConfig.maxOpacity - finalConfig.minOpacity) * point.normalizedIntensity

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, finalConfig.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    // 블러 효과 적용
    ctx.filter = `blur(${finalConfig.blur}px)`
    
    // 핫스팟 영역 계산
    const newHotspots = calculateHotspots(normalizedPoints)
    setHotspots(newHotspots)

  }, [points, width, height, isVisible, finalConfig])

  /**
   * 핫스팟 영역 계산
   */
  const calculateHotspots = (points: Array<HeatmapPoint & { normalizedIntensity: number }>) => {
    // 클러스터링 알고리즘으로 핫스팟 감지
    const clusters: Array<{
      x: number
      y: number
      radius: number
      intensity: number
      points: Array<HeatmapPoint & { normalizedIntensity: number }>
    }> = []

    points.forEach(point => {
      let addedToCluster = false

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(point.x - cluster.x, 2) + Math.pow(point.y - cluster.y, 2)
        )

        if (distance < finalConfig.radius * 2) {
          // 기존 클러스터에 추가
          cluster.points.push(point)
          cluster.x = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length
          cluster.y = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length
          cluster.intensity = Math.max(cluster.intensity, point.normalizedIntensity)
          addedToCluster = true
          break
        }
      }

      if (!addedToCluster) {
        // 새 클러스터 생성
        clusters.push({
          x: point.x,
          y: point.y,
          radius: finalConfig.radius,
          intensity: point.normalizedIntensity,
          points: [point]
        })
      }
    })

    // 강도가 높은 클러스터만 핫스팟으로 선정
    return clusters
      .filter(cluster => cluster.intensity > 0.6)
      .map(cluster => ({
        x: cluster.x,
        y: cluster.y,
        radius: cluster.radius,
        intensity: cluster.intensity,
        element: cluster.points[0].element
      }))
  }

  /**
   * 캔버스 클릭 처리
   */
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onHotspotClick) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 클릭된 핫스팟 찾기
    const clickedHotspot = hotspots.find(hotspot => {
      const distance = Math.sqrt(
        Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2)
      )
      return distance <= hotspot.radius
    })

    if (clickedHotspot) {
      const correspondingPoint = points.find(point => 
        point.element === clickedHotspot.element &&
        Math.abs(point.x - clickedHotspot.x) < 10 &&
        Math.abs(point.y - clickedHotspot.y) < 10
      )

      if (correspondingPoint) {
        onHotspotClick(correspondingPoint)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: 'transparent',
          mixBlendMode: 'multiply'
        }}
        onClick={handleCanvasClick}
      />
      
      {/* 핫스팟 라벨 */}
      {hotspots.map((hotspot, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: hotspot.x - 30,
            top: hotspot.y - 30,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            🔥 {Math.round(hotspot.intensity * 100)}%
          </div>
        </div>
      ))}

      {/* 히트맵 컨트롤 */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-2">🔥 ヒートマップ分析</h3>
        <div className="space-y-2 text-xs">
          <div>総クリック数: {points.length}</div>
          <div>ホットスポット: {hotspots.length}</div>
          <div>最高密度: {hotspots.length > 0 ? Math.round(Math.max(...hotspots.map(h => h.intensity)) * 100) : 0}%</div>
        </div>
        
        {/* 범례 */}
        <div className="mt-3">
          <div className="text-xs mb-1">密度レベル:</div>
          <div className="flex space-x-1">
            {Object.entries(finalConfig.gradient).map(([stop, color]) => (
              <div
                key={stop}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
                title={`${Math.round(parseFloat(stop) * 100)}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 히트맵 통계 컴포넌트
 */
export const HeatmapStats: React.FC<{ points: HeatmapPoint[] }> = ({ points }) => {
  const stats = React.useMemo(() => {
    if (points.length === 0) return null

    const elementCounts = points.reduce((acc, point) => {
      acc[point.element] = (acc[point.element] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sortedElements = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const avgIntensity = points.reduce((sum, p) => sum + p.intensity, 0) / points.length

    return {
      totalClicks: points.length,
      uniqueElements: Object.keys(elementCounts).length,
      averageIntensity: avgIntensity,
      topElements: sortedElements,
      timeRange: {
        start: Math.min(...points.map(p => p.timestamp)),
        end: Math.max(...points.map(p => p.timestamp))
      }
    }
  }, [points])

  if (!stats) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        📊 ヒートマップ統計
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">総クリック数</div>
            <div className="text-xl font-bold text-blue-600">{stats.totalClicks}</div>
          </div>
          <div>
            <div className="text-gray-600">要素数</div>
            <div className="text-xl font-bold text-green-600">{stats.uniqueElements}</div>
          </div>
        </div>

        <div>
          <div className="text-gray-600 text-sm mb-2">人気要素 TOP 5</div>
          <div className="space-y-1">
            {stats.topElements.slice(0, 5).map(([element, count], index) => (
              <div key={element} className="flex justify-between items-center text-sm">
                <span className="truncate flex-1 mr-2">{element}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t pt-2">
          分析期間: {new Date(stats.timeRange.start).toLocaleString()} 〜 {new Date(stats.timeRange.end).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default HeatmapVisualization 