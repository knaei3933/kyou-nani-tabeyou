// 個人化推薦エンジン
// 協業フィルタリング + コンテンツベースのハイブリッド推薦システム
// 時間帯、天気、位置情報を考慮したスマート推薦

import { userSegmentationEngine, UserBehaviorData } from './userSegmentation';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  tags: string[];
  ingredients: string[];
  preparationTime: number; // 分
  difficulty: 'easy' | 'medium' | 'hard';
  healthScore: number; // 1-10
  popularity: number; // 1-10
  seasonality: ('spring' | 'summer' | 'autumn' | 'winter')[];
  weatherSuitability: {
    sunny: number; // 1-10
    rainy: number; // 1-10
    cold: number; // 1-10
    hot: number; // 1-10
  };
  timeOfDay: {
    breakfast: number; // 1-10
    lunch: number; // 1-10
    dinner: number; // 1-10
    snack: number; // 1-10
  };
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserPreference {
  userId: string;
  favoriteCategories: string[];
  dislikedCategories: string[];
  favoriteIngredients: string[];
  allergens: string[];
  dietaryRestrictions: string[]; // ベジタリアン、ヴィーガン、グルテンフリーなど
  spiceLevel: number; // 1-10
  healthConsciousness: number; // 1-10
  adventurousness: number; // 1-10 (新しい料理への挑戦度)
  budgetPreference: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface RecommendationContext {
  userId: string;
  currentTime: Date;
  location?: {
    latitude: number;
    longitude: number;
    region: string;
  };
  weather?: {
    temperature: number;
    condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
    humidity: number;
  };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  socialContext?: 'alone' | 'with_family' | 'with_friends' | 'date';
  timeConstraint?: number; // 利用可能時間（分）
}

export interface RecommendationResult {
  foodItem: FoodItem;
  score: number; // 0-100
  reasons: string[];
  confidence: number; // 0-1
  algorithm: 'collaborative' | 'content_based' | 'hybrid' | 'contextual';
}

export interface PersonalizationMetrics {
  userId: string;
  totalRecommendations: number;
  acceptedRecommendations: number;
  acceptanceRate: number;
  averageRating: number;
  lastInteraction: Date;
  improvementSuggestions: string[];
}

export class PersonalizationEngine {
  private userPreferences: Map<string, UserPreference>;
  private userInteractions: Map<string, { foodId: string; rating: number; timestamp: Date }[]>;
  private foodDatabase: Map<string, FoodItem>;
  private collaborativeMatrix: Map<string, Map<string, number>>; // userId -> foodId -> rating

  constructor() {
    this.userPreferences = new Map();
    this.userInteractions = new Map();
    this.foodDatabase = new Map();
    this.collaborativeMatrix = new Map();
  }

  // 食べ物データベースに項目を追加
  addFoodItem(foodItem: FoodItem): void {
    this.foodDatabase.set(foodItem.id, foodItem);
  }

  // ユーザー設定を更新
  updateUserPreferences(preferences: UserPreference): void {
    preferences.lastUpdated = new Date();
    this.userPreferences.set(preferences.userId, preferences);
  }

  // ユーザーの相互作用を記録
  recordUserInteraction(userId: string, foodId: string, rating: number): void {
    const interactions = this.userInteractions.get(userId) || [];
    interactions.push({
      foodId,
      rating,
      timestamp: new Date()
    });

    // 最新100件のみ保持
    if (interactions.length > 100) {
      interactions.shift();
    }

    this.userInteractions.set(userId, interactions);
    this.updateCollaborativeMatrix(userId, foodId, rating);
  }

  // 協業フィルタリングマトリックスを更新
  private updateCollaborativeMatrix(userId: string, foodId: string, rating: number): void {
    if (!this.collaborativeMatrix.has(userId)) {
      this.collaborativeMatrix.set(userId, new Map());
    }
    this.collaborativeMatrix.get(userId)!.set(foodId, rating);
  }

  // メイン推薦機能
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    const userId = context.userId;
    const userSegment = userSegmentationEngine.getUserSegment(userId);
    const userPrefs = this.userPreferences.get(userId);

    // 複数のアルゴリズムから推薦を取得
    const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit);
    const contentBasedRecs = await this.getContentBasedRecommendations(userId, context, limit);
    const contextualRecs = await this.getContextualRecommendations(context, limit);

    // ハイブリッド推薦: 各アルゴリズムの結果を重み付けして結合
    const hybridResults = this.combineRecommendations(
      collaborativeRecs,
      contentBasedRecs,
      contextualRecs,
      userSegment?.segmentId
    );

    // スコアでソートして上位を返す
    return hybridResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 協業フィルタリング推薦
  private async getCollaborativeRecommendations(
    userId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    const userRatings = this.collaborativeMatrix.get(userId);
    if (!userRatings || userRatings.size < 3) {
      return []; // 十分なデータがない場合
    }

    // 類似ユーザーを検索
    const similarUsers = this.findSimilarUsers(userId, 10);
    const recommendations: RecommendationResult[] = [];

    // 類似ユーザーが高評価した食べ物を推薦
    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarUserRatings = this.collaborativeMatrix.get(similarUserId);
      if (!similarUserRatings) return;

      similarUserRatings.forEach((rating, foodId) => {
        // ユーザーがまだ試していない食べ物のみ
        if (!userRatings.has(foodId) && rating >= 4) {
          const foodItem = this.foodDatabase.get(foodId);
          if (foodItem) {
            const score = rating * similarity * 10; // 0-100スケール
            recommendations.push({
              foodItem,
              score,
              reasons: [`類似ユーザーが高評価（${rating}/5）`],
              confidence: similarity,
              algorithm: 'collaborative'
            });
          }
        }
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // 類似ユーザーを検索
  private findSimilarUsers(userId: string, limit: number): { userId: string; similarity: number }[] {
    const userRatings = this.collaborativeMatrix.get(userId);
    if (!userRatings) return [];

    const similarities: { userId: string; similarity: number }[] = [];

    this.collaborativeMatrix.forEach((otherUserRatings, otherUserId) => {
      if (otherUserId === userId) return;

      const similarity = this.calculateUserSimilarity(userRatings, otherUserRatings);
      if (similarity > 0.1) { // 最小類似度閾値
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ユーザー間の類似度を計算（コサイン類似度）
  private calculateUserSimilarity(
    ratingsA: Map<string, number>,
    ratingsB: Map<string, number>
  ): number {
    const commonItems = new Set<string>();
    ratingsA.forEach((_, foodId) => {
      if (ratingsB.has(foodId)) {
        commonItems.add(foodId);
      }
    });

    if (commonItems.size < 2) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    commonItems.forEach(foodId => {
      const ratingA = ratingsA.get(foodId)!;
      const ratingB = ratingsB.get(foodId)!;
      
      dotProduct += ratingA * ratingB;
      normA += ratingA * ratingA;
      normB += ratingB * ratingB;
    });

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  // コンテンツベース推薦
  private async getContentBasedRecommendations(
    userId: string,
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationResult[]> {
    const userPrefs = this.userPreferences.get(userId);
    const userInteractions = this.userInteractions.get(userId) || [];
    
    if (!userPrefs && userInteractions.length < 3) {
      return []; // 十分なデータがない場合
    }

    const recommendations: RecommendationResult[] = [];
    const triedFoods = new Set(userInteractions.map(i => i.foodId));

    this.foodDatabase.forEach(foodItem => {
      if (triedFoods.has(foodItem.id)) return; // 既に試した食べ物はスキップ

      let score = 0;
      const reasons: string[] = [];

      // ユーザー設定に基づくスコア計算
      if (userPrefs) {
        // カテゴリマッチング
        if (userPrefs.favoriteCategories.includes(foodItem.category)) {
          score += 20;
          reasons.push(`好みのカテゴリ（${foodItem.category}）`);
        }
        if (userPrefs.dislikedCategories.includes(foodItem.category)) {
          score -= 30;
          reasons.push(`避けるカテゴリ（${foodItem.category}）`);
        }

        // 食材マッチング
        const matchingIngredients = foodItem.ingredients.filter(ingredient => 
          userPrefs.favoriteIngredients.includes(ingredient));
        if (matchingIngredients.length > 0) {
          score += matchingIngredients.length * 5;
          reasons.push(`好みの食材（${matchingIngredients.join(', ')}）`);
        }

        // アレルゲンチェック
        const hasAllergens = foodItem.ingredients.some(ingredient => 
          userPrefs.allergens.includes(ingredient));
        if (hasAllergens) {
          score -= 50;
          reasons.push('アレルゲンを含む');
        }

        // 健康志向スコア
        const healthMatch = Math.abs(userPrefs.healthConsciousness - foodItem.healthScore);
        score += (10 - healthMatch) * 2;
        if (healthMatch <= 2) {
          reasons.push('健康志向に合致');
        }

        // 冒険度スコア
        const difficultyScore = foodItem.difficulty === 'easy' ? 3 : 
                               foodItem.difficulty === 'medium' ? 6 : 9;
        const adventureMatch = Math.abs(userPrefs.adventurousness - difficultyScore);
        score += (10 - adventureMatch);
      }

      // 過去の相互作用に基づくスコア
      if (userInteractions.length > 0) {
        const similarItems = this.findSimilarFoods(foodItem, userInteractions);
        if (similarItems.length > 0) {
          const avgRating = similarItems.reduce((sum, item) => sum + item.rating, 0) / similarItems.length;
          score += avgRating * 10;
          reasons.push(`類似した料理を高評価（平均${avgRating.toFixed(1)}/5）`);
        }
      }

      if (score > 10) { // 最小スコア閾値
        recommendations.push({
          foodItem,
          score: Math.max(0, Math.min(100, score)), // 0-100に正規化
          reasons,
          confidence: 0.7,
          algorithm: 'content_based'
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // 類似した食べ物を検索
  private findSimilarFoods(
    targetFood: FoodItem,
    userInteractions: { foodId: string; rating: number; timestamp: Date }[]
  ): { foodId: string; rating: number }[] {
    const similarFoods: { foodId: string; rating: number }[] = [];

    userInteractions.forEach(interaction => {
      const food = this.foodDatabase.get(interaction.foodId);
      if (!food) return;

      let similarity = 0;

      // カテゴリ類似度
      if (food.category === targetFood.category) similarity += 0.3;
      
      // 食材類似度
      const commonIngredients = food.ingredients.filter(ingredient => 
        targetFood.ingredients.includes(ingredient));
      similarity += (commonIngredients.length / Math.max(food.ingredients.length, targetFood.ingredients.length)) * 0.4;

      // タグ類似度
      const commonTags = food.tags.filter(tag => targetFood.tags.includes(tag));
      similarity += (commonTags.length / Math.max(food.tags.length, targetFood.tags.length)) * 0.3;

      if (similarity > 0.3) { // 最小類似度閾値
        similarFoods.push({ foodId: interaction.foodId, rating: interaction.rating });
      }
    });

    return similarFoods;
  }

  // コンテクストベース推薦（時間帯、天気、場所に基づく）
  private async getContextualRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    this.foodDatabase.forEach(foodItem => {
      let score = 50; // ベーススコア
      const reasons: string[] = [];

      // 時間帯に基づくスコア
      const timeScore = foodItem.timeOfDay[context.mealType];
      score += timeScore * 5;
      if (timeScore >= 7) {
        reasons.push(`${context.mealType}に最適`);
      }

      // 天気に基づくスコア
      if (context.weather) {
        const weatherCondition = context.weather.condition;
        const temperature = context.weather.temperature;

        if (weatherCondition === 'rainy' && foodItem.weatherSuitability.rainy >= 7) {
          score += 15;
          reasons.push('雨の日にピッタリ');
        }
        if (temperature < 10 && foodItem.weatherSuitability.cold >= 7) {
          score += 20;
          reasons.push('寒い日に温まる');
        }
      }

      if (score > 40) {
        recommendations.push({
          foodItem,
          score: Math.max(0, Math.min(100, score)),
          reasons,
          confidence: 0.8,
          algorithm: 'contextual'
        });
      }
    });

    return recommendations.sort((a: RecommendationResult, b: RecommendationResult) => b.score - a.score).slice(0, limit);
  }

  // ハイブリッド推薦結果を結合
  private combineRecommendations(
    collaborativeRecs: RecommendationResult[],
    contentBasedRecs: RecommendationResult[],
    contextualRecs: RecommendationResult[],
    userSegmentId?: string
  ): RecommendationResult[] {
    const combinedResults = new Map<string, RecommendationResult>();

    // セグメント別重み調整
    const weights = this.getAlgorithmWeights(userSegmentId);

    // 協業フィルタリング結果を追加
    collaborativeRecs.forEach(rec => {
      const existingRec = combinedResults.get(rec.foodItem.id);
      if (existingRec) {
        existingRec.score += rec.score * weights.collaborative;
        existingRec.reasons.push(...rec.reasons);
        existingRec.algorithm = 'hybrid';
      } else {
        combinedResults.set(rec.foodItem.id, {
          ...rec,
          score: rec.score * weights.collaborative,
          algorithm: 'hybrid'
        });
      }
    });

    // コンテンツベース結果を追加
    contentBasedRecs.forEach(rec => {
      const existingRec = combinedResults.get(rec.foodItem.id);
      if (existingRec) {
        existingRec.score += rec.score * weights.contentBased;
        existingRec.reasons.push(...rec.reasons);
        existingRec.algorithm = 'hybrid';
      } else {
        combinedResults.set(rec.foodItem.id, {
          ...rec,
          score: rec.score * weights.contentBased,
          algorithm: 'hybrid'
        });
      }
    });

    // コンテクストベース結果を追加
    contextualRecs.forEach(rec => {
      const existingRec = combinedResults.get(rec.foodItem.id);
      if (existingRec) {
        existingRec.score += rec.score * weights.contextual;
        existingRec.reasons.push(...rec.reasons);
        existingRec.algorithm = 'hybrid';
      } else {
        combinedResults.set(rec.foodItem.id, {
          ...rec,
          score: rec.score * weights.contextual,
          algorithm: 'hybrid'
        });
      }
    });

    return Array.from(combinedResults.values());
  }

  // セグメント別アルゴリズム重み取得
  private getAlgorithmWeights(segmentId?: string): {
    collaborative: number;
    contentBased: number;
    contextual: number;
  } {
    // セグメント別の最適化された重み
    const segmentWeights: Record<string, { collaborative: number; contentBased: number; contextual: number }> = {
      explorer: { collaborative: 0.2, contentBased: 0.3, contextual: 0.5 },
      comfort_seeker: { collaborative: 0.4, contentBased: 0.4, contextual: 0.2 },
      quick_decider: { collaborative: 0.1, contentBased: 0.2, contextual: 0.7 },
      health_conscious: { collaborative: 0.3, contentBased: 0.5, contextual: 0.2 },
      social_foodie: { collaborative: 0.5, contentBased: 0.3, contextual: 0.2 }
    };

    return segmentWeights[segmentId || 'default'] || { collaborative: 0.33, contentBased: 0.33, contextual: 0.34 };
  }

  // 個人化メトリクスを取得
  getPersonalizationMetrics(userId: string): PersonalizationMetrics {
    const userInteractions = this.userInteractions.get(userId) || [];
    const totalRecommendations = userInteractions.length;
    const acceptedRecommendations = userInteractions.filter(i => i.rating >= 4).length;
    const acceptanceRate = totalRecommendations > 0 ? acceptedRecommendations / totalRecommendations : 0;
    const averageRating = totalRecommendations > 0 ? 
      userInteractions.reduce((sum, i) => sum + i.rating, 0) / totalRecommendations : 0;

    const improvementSuggestions: string[] = [];
    if (acceptanceRate < 0.6) {
      improvementSuggestions.push('より多くの好みデータを収集');
    }
    if (averageRating < 3.5) {
      improvementSuggestions.push('推薦アルゴリズムの調整が必要');
    }

    return {
      userId,
      totalRecommendations,
      acceptedRecommendations,
      acceptanceRate,
      averageRating,
      lastInteraction: userInteractions.length > 0 ? 
        userInteractions[userInteractions.length - 1].timestamp : new Date(),
      improvementSuggestions
    };
  }

  // ユーザーフィードバックから学習
  learnFromFeedback(userId: string, foodId: string, rating: number, feedback?: string): void {
    this.recordUserInteraction(userId, foodId, rating);
    
    // 低評価の場合、ユーザー設定を自動調整
    if (rating <= 2) {
      const foodItem = this.foodDatabase.get(foodId);
      const userPrefs = this.userPreferences.get(userId);
      
      if (foodItem && userPrefs) {
        // 低評価のカテゴリを避けるカテゴリに追加
        if (!userPrefs.dislikedCategories.includes(foodItem.category)) {
          userPrefs.dislikedCategories.push(foodItem.category);
        }
        
        // 低評価の食材を避ける食材に追加
        foodItem.ingredients.forEach(ingredient => {
          if (!userPrefs.allergens.includes(ingredient)) {
            // 完全にアレルゲンにするのではなく、好みの食材から除去
            const index = userPrefs.favoriteIngredients.indexOf(ingredient);
            if (index > -1) {
              userPrefs.favoriteIngredients.splice(index, 1);
            }
          }
        });
        
        this.updateUserPreferences(userPrefs);
      }
    }
  }
}

// グローバルインスタンス
export const personalizationEngine = new PersonalizationEngine(); 