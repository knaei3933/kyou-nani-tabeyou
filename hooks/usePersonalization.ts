// 個人化フックシステム
// リアルタイム個人化推薦とユーザーセグメント管理

import { useState, useEffect, useCallback, useMemo } from 'react';
import { userSegmentationEngine, UserBehaviorData, SegmentationResult } from '../lib/userSegmentation';
import { 
  personalizationEngine, 
  RecommendationContext, 
  RecommendationResult, 
  UserPreference,
  PersonalizationMetrics 
} from '../lib/personalizationEngine';

// リアルタイム個人化推薦フック
export const usePersonalization = (userId: string) => {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PersonalizationMetrics | null>(null);

  // 推薦を取得
  const getRecommendations = useCallback(async (
    context: RecommendationContext,
    limit: number = 10
  ) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await personalizationEngine.getPersonalizedRecommendations(context, limit);
      setRecommendations(results);

      // メトリクスも更新
      const userMetrics = personalizationEngine.getPersonalizationMetrics(userId);
      setMetrics(userMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : '推薦取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ユーザーフィードバックを記録
  const recordFeedback = useCallback((
    foodId: string, 
    rating: number, 
    feedback?: string
  ) => {
    if (!userId) return;

    personalizationEngine.learnFromFeedback(userId, foodId, rating, feedback);
    
    // メトリクスを更新
    const updatedMetrics = personalizationEngine.getPersonalizationMetrics(userId);
    setMetrics(updatedMetrics);
  }, [userId]);

  // ユーザー設定を更新
  const updatePreferences = useCallback((preferences: UserPreference) => {
    personalizationEngine.updateUserPreferences(preferences);
  }, []);

  // 推薦精度を取得
  const accuracy = useMemo(() => {
    return metrics ? metrics.acceptanceRate * 100 : 0;
  }, [metrics]);

  // 改善提案を取得
  const improvements = useMemo(() => {
    return metrics?.improvementSuggestions || [];
  }, [metrics]);

  return {
    recommendations,
    isLoading,
    error,
    metrics,
    accuracy,
    improvements,
    getRecommendations,
    recordFeedback,
    updatePreferences
  };
};

// ユーザーセグメント追跡フック
export const useUserSegment = (userId: string) => {
  const [segment, setSegment] = useState<SegmentationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [segmentHistory, setSegmentHistory] = useState<SegmentationResult[]>([]);

  // 現在のセグメントを取得
  useEffect(() => {
    if (!userId) return;

    const currentSegment = userSegmentationEngine.getUserSegment(userId);
    setSegment(currentSegment);

    // セグメント履歴も取得（ローカルストレージから）
    const history = localStorage.getItem(`segment_history_${userId}`);
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        setSegmentHistory(parsedHistory);
      } catch (error) {
        console.error('セグメント履歴の読み込みに失敗:', error);
      }
    }
  }, [userId]);

  // 行動データを記録
  const recordBehavior = useCallback((behaviorData: UserBehaviorData) => {
    if (!userId) return;

    setIsAnalyzing(true);

    try {
      userSegmentationEngine.recordUserBehavior({
        ...behaviorData,
        userId
      });

      // セグメントが変更されたかチェック
      const newSegment = userSegmentationEngine.getUserSegment(userId);
      if (newSegment && (!segment || newSegment.segmentId !== segment.segmentId)) {
        setSegment(newSegment);
        
        // セグメント変更履歴を保存
        const updatedHistory = [...segmentHistory, newSegment].slice(-10); // 最新10件保持
        setSegmentHistory(updatedHistory);
        localStorage.setItem(`segment_history_${userId}`, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('行動データの記録に失敗:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [userId, segment, segmentHistory]);

  // セグメント情報を取得
  const segmentInfo = useMemo(() => {
    if (!segment) return null;

    const segmentData = userSegmentationEngine.getSegment(segment.segmentId);
    return segmentData;
  }, [segment]);

  // セグメント統計を取得
  const [statistics, setStatistics] = useState<ReturnType<typeof userSegmentationEngine.getSegmentStatistics>>([]);

  useEffect(() => {
    const stats = userSegmentationEngine.getSegmentStatistics();
    setStatistics(stats);
  }, [segment]);

  // 手動でセグメントを再分析
  const reanalyzeSegment = useCallback(() => {
    if (!userId) return;

    setIsAnalyzing(true);
    const newSegment = userSegmentationEngine.reclassifyUser(userId);
    
    if (newSegment) {
      setSegment(newSegment);
    }
    
    setIsAnalyzing(false);
  }, [userId]);

  return {
    segment,
    segmentInfo,
    segmentHistory,
    statistics,
    isAnalyzing,
    recordBehavior,
    reanalyzeSegment
  };
};

// コンテクストベース推薦フック
export const useContextualRecommendations = (userId: string) => {
  const [currentContext, setCurrentContext] = useState<RecommendationContext | null>(null);
  const [contextualRecs, setContextualRecs] = useState<RecommendationResult[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  // 現在のコンテクストを自動取得
  useEffect(() => {
    const updateContext = async () => {
      setIsLoadingContext(true);

      try {
        // 位置情報を取得（ユーザー許可必要）
        let location: { latitude: number; longitude: number; region: string } | undefined;
        
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000 // 5分間キャッシュ
            });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: 'tokyo' // デフォルト地域、後で位置情報から判定可能
          };
        }

        // 時間帯を判定
        const now = new Date();
        const hour = now.getHours();
        const mealType = hour < 10 ? 'breakfast' :
                        hour < 15 ? 'lunch' :
                        hour < 21 ? 'dinner' : 'snack';

        const context: RecommendationContext = {
          userId,
          currentTime: now,
          location,
          mealType: mealType as RecommendationContext['mealType']
        };

        setCurrentContext(context);

        // コンテクストベース推薦を取得
        const recommendations = await personalizationEngine.getPersonalizedRecommendations(context, 5);
        setContextualRecs(recommendations.filter(rec => rec.algorithm === 'contextual' || rec.algorithm === 'hybrid'));

      } catch (error) {
        console.error('コンテクスト取得に失敗:', error);
      } finally {
        setIsLoadingContext(false);
      }
    };

    updateContext();

    // 30分ごとにコンテクストを更新
    const interval = setInterval(updateContext, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // コンテクストを手動更新
  const updateContext = useCallback((newContext: Partial<RecommendationContext>) => {
    if (!currentContext) return;

    const updatedContext = {
      ...currentContext,
      ...newContext
    };

    setCurrentContext(updatedContext);
  }, [currentContext]);

  return {
    currentContext,
    contextualRecommendations: contextualRecs,
    isLoadingContext,
    updateContext
  };
}; 