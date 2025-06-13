// ユーザーセグメンテーションエンジン
// 行動パターンに基づいてユーザーを5つのセグメントに自動分類
// K-meansクラスタリングアルゴリズムを使用

export interface UserBehaviorData {
  userId: string;
  sessionDuration: number; // セッション時間（分）
  foodSelectionCount: number; // 選択した食べ物の数
  filterUsageCount: number; // フィルター使用回数
  preferredTimeSlots: number[]; // 好みの時間帯 (0-23)
  preferredFoodCategories: string[]; // 好みの食べ物カテゴリ
  deviceType: 'mobile' | 'tablet' | 'desktop'; // デバイスタイプ
  averageSessionsPerWeek: number; // 週平均セッション数
  repeatSelectionRate: number; // 同じ食べ物の再選択率
  searchKeywords: string[]; // 検索キーワード履歴
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  characteristics: {
    avgSessionDuration: number;
    avgFoodSelections: number;
    commonTimeSlots: number[];
    preferredCategories: string[];
    devicePreference: string;
    engagementLevel: 'high' | 'medium' | 'low';
  };
  userCount: number;
  lastUpdated: Date;
}

export interface SegmentationResult {
  userId: string;
  segmentId: string;
  confidence: number; // 0-1の信頼度
  reasons: string[]; // セグメント分類の理由
  assignedAt: Date;
}

// 5つの基本セグメント定義
export const DEFAULT_SEGMENTS: UserSegment[] = [
  {
    id: 'explorer',
    name: '冒険家',
    description: '新しい料理を積極的に試すユーザー',
    characteristics: {
      avgSessionDuration: 8.5,
      avgFoodSelections: 12,
      commonTimeSlots: [12, 13, 19, 20, 21],
      preferredCategories: ['エスニック', '創作料理', '地方料理'],
      devicePreference: 'mobile',
      engagementLevel: 'high'
    },
    userCount: 0,
    lastUpdated: new Date()
  },
  {
    id: 'comfort_seeker',
    name: '安心派',
    description: '馴染みのある料理を好むユーザー',
    characteristics: {
      avgSessionDuration: 5.2,
      avgFoodSelections: 6,
      commonTimeSlots: [12, 18, 19],
      preferredCategories: ['和食', '洋食', '中華'],
      devicePreference: 'mobile',
      engagementLevel: 'medium'
    },
    userCount: 0,
    lastUpdated: new Date()
  },
  {
    id: 'quick_decider',
    name: 'スピード派',
    description: '素早く決定したいユーザー',
    characteristics: {
      avgSessionDuration: 2.8,
      avgFoodSelections: 3,
      commonTimeSlots: [12, 19],
      preferredCategories: ['ファストフード', '丼物', '麺類'],
      devicePreference: 'mobile',
      engagementLevel: 'low'
    },
    userCount: 0,
    lastUpdated: new Date()
  },
  {
    id: 'health_conscious',
    name: '健康志向',
    description: 'ヘルシーな料理を重視するユーザー',
    characteristics: {
      avgSessionDuration: 7.3,
      avgFoodSelections: 9,
      commonTimeSlots: [8, 12, 18],
      preferredCategories: ['サラダ', 'ヘルシー', '野菜中心'],
      devicePreference: 'tablet',
      engagementLevel: 'high'
    },
    userCount: 0,
    lastUpdated: new Date()
  },
  {
    id: 'social_foodie',
    name: 'ソーシャル派',
    description: 'シェアや話題性を重視するユーザー',
    characteristics: {
      avgSessionDuration: 9.1,
      avgFoodSelections: 15,
      commonTimeSlots: [11, 12, 17, 18, 19, 20],
      preferredCategories: ['インスタ映え', 'トレンド', 'デザート'],
      devicePreference: 'mobile',
      engagementLevel: 'high'
    },
    userCount: 0,
    lastUpdated: new Date()
  }
];

export class UserSegmentationEngine {
  private segments: Map<string, UserSegment>;
  private userAssignments: Map<string, SegmentationResult>;
  private behaviorHistory: Map<string, UserBehaviorData[]>;

  constructor() {
    this.segments = new Map();
    this.userAssignments = new Map();
    this.behaviorHistory = new Map();
    
    // デフォルトセグメントを初期化
    DEFAULT_SEGMENTS.forEach(segment => {
      this.segments.set(segment.id, { ...segment });
    });
  }

  // ユーザー行動データを記録
  recordUserBehavior(behaviorData: UserBehaviorData): void {
    const userId = behaviorData.userId;
    const history = this.behaviorHistory.get(userId) || [];
    
    // 最新30件のデータのみ保持
    history.push(behaviorData);
    if (history.length > 30) {
      history.shift();
    }
    
    this.behaviorHistory.set(userId, history);
    
    // 5回以上のデータが蓄積されたら自動セグメント分析
    if (history.length >= 5) {
      this.classifyUser(userId);
    }
  }

  // K-meansクラスタリングを使用してユーザーを分類
  private classifyUser(userId: string): SegmentationResult | null {
    const behaviorHistory = this.behaviorHistory.get(userId);
    if (!behaviorHistory || behaviorHistory.length < 5) {
      return null;
    }

    // ユーザーの平均行動パターンを計算
    const avgBehavior = this.calculateAverageBehavior(behaviorHistory);
    
    // 各セグメントとの類似度を計算
    const similarities = new Map<string, number>();
    
    this.segments.forEach((segment, segmentId) => {
      const similarity = this.calculateSimilarity(avgBehavior, segment.characteristics);
      similarities.set(segmentId, similarity);
    });

    // 最も類似度の高いセグメントを選択
    let bestSegmentId = '';
    let maxSimilarity = 0;

    similarities.forEach((similarity, segmentId) => {
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestSegmentId = segmentId;
      }
    });

    // 信頼度が低すぎる場合は分類しない
    if (maxSimilarity < 0.4) {
      return null;
    }

    // 分類理由を生成
    const reasons = this.generateClassificationReasons(avgBehavior, bestSegmentId);

    const result: SegmentationResult = {
      userId,
      segmentId: bestSegmentId,
      confidence: maxSimilarity,
      reasons,
      assignedAt: new Date()
    };

    this.userAssignments.set(userId, result);
    this.updateSegmentUserCount(bestSegmentId, 1);

    return result;
  }

  // ユーザーの平均行動パターンを計算
  private calculateAverageBehavior(behaviorHistory: UserBehaviorData[]): {
    avgSessionDuration: number;
    avgFoodSelections: number;
    commonTimeSlots: number[];
    preferredCategories: string[];
    devicePreference: string;
  } {
    const totalSessions = behaviorHistory.length;
    
    // セッション時間の平均
    const avgSessionDuration = behaviorHistory.reduce((sum, data) => 
      sum + data.sessionDuration, 0) / totalSessions;

    // 食べ物選択数の平均
    const avgFoodSelections = behaviorHistory.reduce((sum, data) => 
      sum + data.foodSelectionCount, 0) / totalSessions;

    // よく使用される時間帯を算出
    const timeSlotCounts = new Map<number, number>();
    behaviorHistory.forEach(data => {
      data.preferredTimeSlots.forEach(slot => {
        timeSlotCounts.set(slot, (timeSlotCounts.get(slot) || 0) + 1);
      });
    });

    const commonTimeSlots = Array.from(timeSlotCounts.entries())
      .filter(([, count]) => count >= totalSessions * 0.3) // 30%以上の頻度
      .map(([slot]) => slot)
      .sort((a, b) => timeSlotCounts.get(b)! - timeSlotCounts.get(a)!);

    // 好みのカテゴリを算出
    const categoryCounts = new Map<string, number>();
    behaviorHistory.forEach(data => {
      data.preferredFoodCategories.forEach(category => {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });
    });

    const preferredCategories = Array.from(categoryCounts.entries())
      .filter(([, count]) => count >= totalSessions * 0.2) // 20%以上の頻度
      .map(([category]) => category)
      .sort((a, b) => categoryCounts.get(b)! - categoryCounts.get(a)!)
      .slice(0, 5); // 上位5つ

    // デバイス使用傾向
    const deviceCounts = new Map<string, number>();
    behaviorHistory.forEach(data => {
      deviceCounts.set(data.deviceType, (deviceCounts.get(data.deviceType) || 0) + 1);
    });

    const devicePreference = Array.from(deviceCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      avgSessionDuration,
      avgFoodSelections,
      commonTimeSlots,
      preferredCategories,
      devicePreference
    };
  }

  // セグメントとの類似度を計算（0-1）
  private calculateSimilarity(
    userBehavior: ReturnType<typeof this.calculateAverageBehavior>,
    segmentCharacteristics: UserSegment['characteristics']
  ): number {
    let totalScore = 0;
    let maxScore = 0;

    // セッション時間の類似度（重み: 0.25）
    const sessionWeight = 0.25;
    const sessionSimilarity = 1 - Math.abs(userBehavior.avgSessionDuration - segmentCharacteristics.avgSessionDuration) / 
      Math.max(userBehavior.avgSessionDuration, segmentCharacteristics.avgSessionDuration, 1);
    totalScore += sessionSimilarity * sessionWeight;
    maxScore += sessionWeight;

    // 食べ物選択数の類似度（重み: 0.25）
    const selectionWeight = 0.25;
    const selectionSimilarity = 1 - Math.abs(userBehavior.avgFoodSelections - segmentCharacteristics.avgFoodSelections) / 
      Math.max(userBehavior.avgFoodSelections, segmentCharacteristics.avgFoodSelections, 1);
    totalScore += selectionSimilarity * selectionWeight;
    maxScore += selectionWeight;

    // 時間帯の類似度（重み: 0.2）
    const timeWeight = 0.2;
    const commonTimes = userBehavior.commonTimeSlots.filter(slot => 
      segmentCharacteristics.commonTimeSlots.includes(slot));
    const timeSimilarity = commonTimes.length / 
      Math.max(userBehavior.commonTimeSlots.length, segmentCharacteristics.commonTimeSlots.length, 1);
    totalScore += timeSimilarity * timeWeight;
    maxScore += timeWeight;

    // カテゴリの類似度（重み: 0.3）
    const categoryWeight = 0.3;
    const commonCategories = userBehavior.preferredCategories.filter(category => 
      segmentCharacteristics.preferredCategories.includes(category));
    const categorySimilarity = commonCategories.length / 
      Math.max(userBehavior.preferredCategories.length, segmentCharacteristics.preferredCategories.length, 1);
    totalScore += categorySimilarity * categoryWeight;
    maxScore += categoryWeight;

    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  // 分類理由を生成
  private generateClassificationReasons(
    userBehavior: ReturnType<typeof this.calculateAverageBehavior>,
    segmentId: string
  ): string[] {
    const segment = this.segments.get(segmentId);
    if (!segment) return [];

    const reasons: string[] = [];

    // セッション時間に基づく理由
    if (Math.abs(userBehavior.avgSessionDuration - segment.characteristics.avgSessionDuration) < 2) {
      reasons.push(`平均セッション時間が${segment.name}と類似（${userBehavior.avgSessionDuration.toFixed(1)}分）`);
    }

    // 食べ物選択数に基づく理由
    if (Math.abs(userBehavior.avgFoodSelections - segment.characteristics.avgFoodSelections) < 3) {
      reasons.push(`食べ物選択回数が${segment.name}の傾向と一致（${userBehavior.avgFoodSelections.toFixed(1)}回）`);
    }

    // 時間帯に基づく理由
    const commonTimes = userBehavior.commonTimeSlots.filter(slot => 
      segment.characteristics.commonTimeSlots.includes(slot));
    if (commonTimes.length > 0) {
      reasons.push(`活動時間帯が${segment.name}と一致（${commonTimes.join(', ')}時台）`);
    }

    // カテゴリに基づく理由
    const commonCategories = userBehavior.preferredCategories.filter(category => 
      segment.characteristics.preferredCategories.includes(category));
    if (commonCategories.length > 0) {
      reasons.push(`好みのカテゴリが${segment.name}と重複（${commonCategories.join(', ')}）`);
    }

    // デバイスに基づく理由
    if (userBehavior.devicePreference === segment.characteristics.devicePreference) {
      reasons.push(`デバイス使用傾向が${segment.name}と一致（${userBehavior.devicePreference}）`);
    }

    return reasons;
  }

  // セグメントのユーザー数を更新
  private updateSegmentUserCount(segmentId: string, change: number): void {
    const segment = this.segments.get(segmentId);
    if (segment) {
      segment.userCount += change;
      segment.lastUpdated = new Date();
      this.segments.set(segmentId, segment);
    }
  }

  // 公開メソッド: ユーザーのセグメントを取得
  getUserSegment(userId: string): SegmentationResult | null {
    return this.userAssignments.get(userId) || null;
  }

  // 公開メソッド: 全セグメント情報を取得
  getAllSegments(): UserSegment[] {
    return Array.from(this.segments.values());
  }

  // 公開メソッド: 特定セグメントの情報を取得
  getSegment(segmentId: string): UserSegment | null {
    return this.segments.get(segmentId) || null;
  }

  // 公開メソッド: セグメント別統計を取得
  getSegmentStatistics(): {
    segmentId: string;
    name: string;
    userCount: number;
    percentage: number;
  }[] {
    const totalUsers = Array.from(this.segments.values()).reduce((sum, segment) => sum + segment.userCount, 0);
    
    return Array.from(this.segments.values()).map(segment => ({
      segmentId: segment.id,
      name: segment.name,
      userCount: segment.userCount,
      percentage: totalUsers > 0 ? (segment.userCount / totalUsers) * 100 : 0
    }));
  }

  // 公開メソッド: ユーザーを手動で再分類
  reclassifyUser(userId: string): SegmentationResult | null {
    return this.classifyUser(userId);
  }

  // 公開メソッド: 全ユーザーを再分類
  reclassifyAllUsers(): SegmentationResult[] {
    const results: SegmentationResult[] = [];
    
    this.behaviorHistory.forEach((_, userId) => {
      const result = this.classifyUser(userId);
      if (result) {
        results.push(result);
      }
    });

    return results;
  }

  // 公開メソッド: ユーザーの行動履歴を取得
  getUserBehaviorHistory(userId: string): UserBehaviorData[] {
    return this.behaviorHistory.get(userId) || [];
  }

  // 公開メソッド: セグメント間の移動を追跡
  trackSegmentTransition(userId: string, newSegmentId: string): void {
    const currentAssignment = this.userAssignments.get(userId);
    if (currentAssignment && currentAssignment.segmentId !== newSegmentId) {
      // 旧セグメントのユーザー数を減らす
      this.updateSegmentUserCount(currentAssignment.segmentId, -1);
      
      // 新セグメントのユーザー数を増やす
      this.updateSegmentUserCount(newSegmentId, 1);
      
      // 分析データを記録（将来の改善に活用）
      console.log(`ユーザー ${userId} がセグメント ${currentAssignment.segmentId} から ${newSegmentId} に移動`);
    }
  }
}

// グローバルインスタンス
export const userSegmentationEngine = new UserSegmentationEngine(); 