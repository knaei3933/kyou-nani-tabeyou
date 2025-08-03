/**
 * A/Bテストダッシュボード
 * - 실시간 A/B 테스트 모니터링
 * - 통계적 유의성 분석
 * - 성과 지표 시각화
 * - 자동 승자 선택
 */

'use client'

import React, { useState, useEffect } from 'react'
import { abTestManager, ABTest, ABTestResults } from '../../lib/abTestManager'

/**
 * Props 인터페이스
 */
interface ABTestDashboardProps {
  isVisible?: boolean
  onClose?: () => void
  refreshInterval?: number
}

/**
 * A/B 테스트 대시보드 컴포넌트
 */
const ABTestDashboard: React.FC<ABTestDashboardProps> = ({
  isVisible = false,
  onClose,
  refreshInterval = 15000 // 15초
}) => {
  const [activeTests, setActiveTests] = useState<ABTest[]>([])
  const [testResults, setTestResults] = useState<Map<string, ABTestResults>>(new Map())
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 데이터 로드
   */
  const loadDashboardData = () => {
    try {
      const tests = abTestManager.getActiveTests()
      setActiveTests(tests)

      const resultsMap = new Map<string, ABTestResults>()
      tests.forEach(test => {
        const results = abTestManager.getTestResults(test.id)
        if (results) {
          resultsMap.set(test.id, results)
        }
      })
      setTestResults(resultsMap)

      if (tests.length > 0 && !selectedTest) {
        setSelectedTest(tests[0].id)
      }

      setIsLoading(false)
      console.log('📊 A/B테스트 대시보드 데이터 업데이트')
    } catch (error) {
      console.error('A/B테스트 대시보드 로드 실패:', error)
      setIsLoading(false)
    }
  }

  /**
   * 자동 새로고침
   */
  useEffect(() => {
    if (isVisible) {
      loadDashboardData()
      
      const interval = setInterval(loadDashboardData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [isVisible, refreshInterval])

  /**
   * 신뢰도 색상 결정
   */
  const getConfidenceColor = (significance: number): string => {
    if (significance >= 95) return 'text-green-600'
    if (significance >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  /**
   * 상태 배지 색상
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * 승률 계산
   */
  const calculateWinProbability = (results: ABTestResults, variantId: string): number => {
    const variant = results.variants.find(v => v.id === variantId)
    if (!variant) return 0

    // 베이지안 추정을 통한 승률 계산 (간단한 근사)
    const alpha = variant.conversions + 1
    const beta = variant.participants - variant.conversions + 1
    
    // 베타 분포의 평균
    return (alpha / (alpha + beta)) * 100
  }

  if (!isVisible) return null

  const selectedTestData = selectedTest ? activeTests.find(t => t.id === selectedTest) : null
  const selectedResults = selectedTest ? testResults.get(selectedTest) : null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🧪 A/Bテストダッシュボード</h2>
              <p className="text-gray-600 mt-1">リアルタイム実験分析 • 自動更新中</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                🔄 更新
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">実験データを読み込み中...</p>
          </div>
        ) : (
          <div className="flex">
            {/* 사이드바 - 테스트 목록 */}
            <div className="w-80 border-r border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">実行中の実験</h3>
              
              {activeTests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🔬</div>
                  <p>実行中の実験がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTests.map(test => {
                    const results = testResults.get(test.id)
                    const isSelected = selectedTest === test.id
                    
                    return (
                      <div
                        key={test.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTest(test.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{test.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3">{test.description}</p>
                        
                        {results && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>参加者:</span>
                              <span className="font-semibold">{results.totalParticipants}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>期間:</span>
                              <span>{Math.floor(results.duration / (1000 * 60 * 60 * 24))}日</span>
                            </div>
                            {results.isStatisticallySignificant && (
                              <div className="flex items-center justify-between text-xs">
                                <span>勝者:</span>
                                <span className="text-green-600 font-semibold">🏆 確定</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 p-6">
              {selectedTestData && selectedResults ? (
                <div className="space-y-6">
                  {/* 테스트 개요 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{selectedTestData.name}</h3>
                        <p className="text-gray-600 mt-1">{selectedTestData.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">目標指標</div>
                        <div className="font-semibold">{selectedTestData.targetMetric}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedResults.totalParticipants}</div>
                        <div className="text-sm text-gray-600">総参加者</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{Math.floor(selectedResults.duration / (1000 * 60 * 60 * 24))}</div>
                        <div className="text-sm text-gray-600">実行日数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedTestData.variants.length}</div>
                        <div className="text-sm text-gray-600">バリエーション</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          selectedResults.isStatisticallySignificant ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {selectedResults.isStatisticallySignificant ? '✅' : '⏳'}
                        </div>
                        <div className="text-sm text-gray-600">統計的有意性</div>
                      </div>
                    </div>
                  </div>

                  {/* 배리언트 비교 */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-lg font-semibold">バリエーション比較</h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">参加者</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">コンバージョン</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">変換率</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">信頼度</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">勝率</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状態</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedResults.variants.map(variant => {
                            const originalVariant = selectedTestData.variants.find(v => v.id === variant.id)
                            const winProbability = calculateWinProbability(selectedResults, variant.id)
                            
                            return (
                              <tr key={variant.id} className={variant.isWinner ? 'bg-green-50' : ''}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="font-medium">{variant.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {originalVariant?.isControl && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                            コントロール
                                          </span>
                                        )}
                                        {variant.isWinner && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            🏆 勝者
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold">{variant.participants}</td>
                                <td className="px-6 py-4 text-center font-semibold">{variant.conversions}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="font-semibold">{(variant.conversionRate * 100).toFixed(2)}%</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`font-semibold ${getConfidenceColor(variant.statisticalSignificance)}`}>
                                    {variant.statisticalSignificance.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center">
                                    <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${winProbability}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-semibold">{winProbability.toFixed(0)}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {variant.participants >= selectedTestData.minimumSampleSize ? (
                                    <span className="text-green-600">✅ 十分</span>
                                  ) : (
                                    <span className="text-yellow-600">⏳ 収集中</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 성과 개선 정보 */}
                  {selectedResults.isStatisticallySignificant && selectedResults.improvementPercent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">🎉</div>
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">実験完了！</h4>
                          <p className="text-green-700">
                            {selectedResults.winnerVariant}が勝者として確定されました。
                            <strong className="ml-1">
                              {selectedResults.improvementPercent > 0 ? '+' : ''}{selectedResults.improvementPercent.toFixed(2)}%
                            </strong>
                            の改善を達成！
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => abTestManager.completeTest(selectedTest!)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          実験を終了
                        </button>
                        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                          レポート出力
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 실시간 차트 (시간별 전환율 추이) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">時系列パフォーマンス</h4>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📈</div>
                        <p>時系列チャートは開発中です</p>
                        <p className="text-sm">リアルタイム変換率の推移を表示予定</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <div className="text-6xl mb-4">🧪</div>
                  <h3 className="text-xl font-semibold mb-2">実験を選択してください</h3>
                  <p>左側の実験リストから詳細を確認したい実験を選択してください</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A/B 테스트 요약 카드 컴포넌트
 */
export const ABTestSummaryCard: React.FC<{
  test: ABTest
  results?: ABTestResults
  onClick?: () => void
}> = ({ test, results, onClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{test.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs ${
          test.status === 'running' ? 'bg-green-100 text-green-800' :
          test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {test.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
      
      {results && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold">{results.totalParticipants}</div>
            <div className="text-gray-500">参加者</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{test.variants.length}</div>
            <div className="text-gray-500">バリエーション</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${
              results.isStatisticallySignificant ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {results.isStatisticallySignificant ? '完了' : '実行中'}
            </div>
            <div className="text-gray-500">状態</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ABTestDashboard 