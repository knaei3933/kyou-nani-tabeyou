// スマートコンテクスト分析システム
// 位置、時間帯、天気、日付などの情報を分析して適切な食べ物を推薦

export interface LocationContext {
  latitude: number;
  longitude: number;
  region: string;
  prefecture: string;
  city: string;
  nearbyStations: string[];
  popularLocalFoods: string[];
}

export interface WeatherContext {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy';
  uvIndex: number;
  visibility: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface TimeContext {
  currentTime: Date;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isHoliday: boolean;
  isWeekend: boolean;
}

export interface SocialContext {
  eventType?: 'date' | 'family_gathering' | 'business_meeting' | 'friends_hangout' | 'solo_time' | 'celebration';
  groupSize: number;
  ageRange: 'child' | 'teenager' | 'adult' | 'senior' | 'mixed';
  occasionType?: 'celebration' | 'casual' | 'formal' | 'comfort' | 'adventure';
}

export interface ContextAnalysisResult {
  locationScore: number;
  weatherScore: number;
  timeScore: number;
  socialScore: number;
  overallScore: number;
  recommendations: string[];
  warnings: string[];
  confidence: number;
}

export class ContextAnalyzer {
  private locationData: Map<string, LocationContext>;
  private weatherCache: Map<string, { data: WeatherContext; timestamp: Date }>;
  private holidayCache: Map<string, boolean>;

  constructor() {
    this.locationData = new Map();
    this.weatherCache = new Map();
    this.holidayCache = new Map();
    this.initializeLocationData();
  }

  // 位置データを初期化
  private initializeLocationData(): void {
    // 東京都主要エリアのデータ
    const tokyoAreas: LocationContext[] = [
      {
        latitude: 35.6762,
        longitude: 139.6503,
        region: '関東',
        prefecture: '東京都',
        city: '渋谷区',
        nearbyStations: ['渋谷', '表参道', '原宿'],
        popularLocalFoods: ['もんじゃ焼き', '江戸前寿司', '深川めし', 'ちゃんこ鍋']
      },
      {
        latitude: 35.6804,
        longitude: 139.7690,
        region: '関東',
        prefecture: '東京都',
        city: '台東区',
        nearbyStations: ['浅草', '上野', '御徒町'],
        popularLocalFoods: ['天ぷら', '江戸前寿司', 'どじょう鍋', '人形焼き']
      },
      {
        latitude: 35.6586,
        longitude: 139.7454,
        region: '関東',
        prefecture: '東京都',
        city: '中央区',
        nearbyStations: ['銀座', '築地', '新橋'],
        popularLocalFoods: ['江戸前寿司', '築地の海鮮', 'もんじゃ焼き']
      }
    ];

    tokyoAreas.forEach(area => {
      const key = `${area.latitude},${area.longitude}`;
      this.locationData.set(key, area);
    });
  }

  // 総合的なコンテクスト分析
  async analyzeContext(
    location?: { latitude: number; longitude: number },
    weather?: Partial<WeatherContext>,
    socialContext?: Partial<SocialContext>
  ): Promise<ContextAnalysisResult> {
    const currentTime = new Date();
    
    // 各種コンテクストを分析
    const locationContext = location ? this.getLocationContext(location) : null;
    const weatherContext = weather ? await this.getWeatherContext(weather) : null;
    const timeContext = this.getTimeContext(currentTime);
    const socialCtx = socialContext ? this.getSocialContext(socialContext) : null;

    // スコア計算
    const locationScore = locationContext ? this.calculateLocationScore(locationContext) : 50;
    const weatherScore = weatherContext ? this.calculateWeatherScore(weatherContext, timeContext) : 50;
    const timeScore = this.calculateTimeScore(timeContext);
    const socialScore = socialCtx ? this.calculateSocialScore(socialCtx) : 50;

    // 総合スコア（重み付け平均）
    const overallScore = (locationScore * 0.2 + weatherScore * 0.3 + timeScore * 0.3 + socialScore * 0.2);

    // 推薦とアドバイス生成
    const recommendations = this.generateRecommendations(
      locationContext,
      weatherContext,
      timeContext,
      socialCtx
    );

    const warnings = this.generateWarnings(weatherContext, timeContext);

    return {
      locationScore,
      weatherScore,
      timeScore,
      socialScore,
      overallScore,
      recommendations,
      warnings,
      confidence: this.calculateConfidence(locationContext, weatherContext, timeContext, socialCtx)
    };
  }

  // 位置コンテクストを取得
  private getLocationContext(location: { latitude: number; longitude: number }): LocationContext | null {
    const key = `${location.latitude},${location.longitude}`;
    
    // 正確な位置データがない場合は近似値を検索
    if (!this.locationData.has(key)) {
      return this.findNearestLocation(location);
    }
    
    return this.locationData.get(key) || null;
  }

  // 最寄りの位置データを検索
  private findNearestLocation(location: { latitude: number; longitude: number }): LocationContext | null {
    let nearestLocation: LocationContext | null = null;
    let minDistance = Infinity;

    this.locationData.forEach(locationData => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        locationData.latitude,
        locationData.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = locationData;
      }
    });

    return minDistance < 10 ? nearestLocation : null; // 10km以内
  }

  // 2点間の距離を計算（km）
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 度をラジアンに変換
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 天気コンテクストを取得
  private async getWeatherContext(weather: Partial<WeatherContext>): Promise<WeatherContext> {
    // 現在の月から季節を判定
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 3 && currentMonth <= 5 ? 'spring' :
                   currentMonth >= 6 && currentMonth <= 8 ? 'summer' :
                   currentMonth >= 9 && currentMonth <= 11 ? 'autumn' : 'winter';

    return {
      temperature: weather.temperature || 20,
      humidity: weather.humidity || 60,
      condition: weather.condition || 'sunny',
      uvIndex: weather.uvIndex || 5,
      visibility: weather.visibility || 10,
      season
    };
  }

  // 時間コンテクストを取得
  private getTimeContext(currentTime: Date): TimeContext {
    const hour = currentTime.getHours();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentTime.getDay()] as TimeContext['dayOfWeek'];
    
    const timeOfDay = hour < 6 ? 'night' :
                     hour < 12 ? 'morning' :
                     hour < 18 ? 'afternoon' : 'evening';

    const mealTime = hour < 10 ? 'breakfast' :
                    hour < 15 ? 'lunch' :
                    hour < 21 ? 'dinner' : 'snack';

    const isWeekend = dayOfWeek === 'saturday' || dayOfWeek === 'sunday';
    const isHoliday = this.checkHoliday(currentTime);

    return {
      currentTime,
      timeOfDay,
      mealTime,
      dayOfWeek,
      isHoliday,
      isWeekend
    };
  }

  // 祝日チェック
  private checkHoliday(date: Date): boolean {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    // キャッシュから確認
    if (this.holidayCache.has(key)) {
      return this.holidayCache.get(key)!;
    }

    // 簡単な祝日判定（実際にはより詳細な祝日データが必要）
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const isHoliday = (month === 1 && day === 1) || // 元日
                     (month === 12 && day === 25) || // クリスマス
                     (month === 5 && day === 5); // こどもの日

    this.holidayCache.set(key, isHoliday);
    return isHoliday;
  }

  // ソーシャルコンテクストを取得
  private getSocialContext(socialContext: Partial<SocialContext>): SocialContext {
    return {
      eventType: socialContext.eventType || 'solo_time',
      groupSize: socialContext.groupSize || 1,
      ageRange: socialContext.ageRange || 'adult',
      occasionType: socialContext.occasionType || 'casual'
    };
  }

  // 位置スコア計算
  private calculateLocationScore(location: LocationContext): number {
    let score = 70; // ベーススコア

    // 地域の多様性ボーナス
    if (location.popularLocalFoods.length > 3) {
      score += 15;
    }

    // 交通アクセスボーナス
    if (location.nearbyStations.length > 2) {
      score += 10;
    }

    // 観光地ボーナス
    if (location.city === '台東区' || location.city === '中央区') {
      score += 5;
    }

    return Math.min(100, score);
  }

  // 天気スコア計算
  private calculateWeatherScore(weather: WeatherContext, time: TimeContext): number {
    let score = 50; // ベーススコア

    // 温度による調整
    if (weather.temperature >= 20 && weather.temperature <= 25) {
      score += 20; // 快適な温度
    } else if (weather.temperature < 10 || weather.temperature > 30) {
      score -= 15; // 極端な温度
    }

    // 天気条件による調整
    switch (weather.condition) {
      case 'sunny':
        score += 15;
        break;
      case 'cloudy':
        score += 5;
        break;
      case 'rainy':
        score -= 10;
        break;
      case 'snowy':
        score -= 15;
        break;
    }

    // 湿度による調整
    if (weather.humidity > 80) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // 時間スコア計算
  private calculateTimeScore(time: TimeContext): number {
    let score = 60; // ベーススコア

    // 食事時間による調整
    const hour = time.currentTime.getHours();
    if ((hour >= 7 && hour <= 9) || // 朝食時間
        (hour >= 12 && hour <= 14) || // 昼食時間
        (hour >= 18 && hour <= 20)) { // 夕食時間
      score += 20;
    }

    // 週末ボーナス
    if (time.isWeekend) {
      score += 10;
    }

    // 祝日ボーナス
    if (time.isHoliday) {
      score += 15;
    }

    return Math.min(100, score);
  }

  // ソーシャルスコア計算
  private calculateSocialScore(social: SocialContext): number {
    let score = 60; // ベーススコア

    // グループサイズによる調整
    if (social.groupSize === 2) {
      score += 10; // ペア
    } else if (social.groupSize >= 3 && social.groupSize <= 6) {
      score += 15; // 小グループ
    } else if (social.groupSize > 6) {
      score += 5; // 大グループ
    }

    // イベントタイプによる調整
    switch (social.eventType) {
      case 'date':
        score += 20;
        break;
      case 'celebration':
        score += 15;
        break;
      case 'business_meeting':
        score += 10;
        break;
    }

    return Math.min(100, score);
  }

  // 推薦生成
  private generateRecommendations(
    location: LocationContext | null,
    weather: WeatherContext | null,
    time: TimeContext,
    social: SocialContext | null
  ): string[] {
    const recommendations: string[] = [];

    // 時間に基づく推薦
    if (time.mealTime === 'breakfast') {
      recommendations.push('朝食向けの軽めの食事');
    } else if (time.mealTime === 'lunch') {
      recommendations.push('ランチセットやお弁当');
    } else if (time.mealTime === 'dinner') {
      recommendations.push('夕食向けのしっかりした食事');
    }

    // 天気に基づく推薦
    if (weather) {
      if (weather.temperature < 10) {
        recommendations.push('温かい料理（鍋、ラーメン、シチューなど）');
      } else if (weather.temperature > 25) {
        recommendations.push('冷たい料理（そうめん、冷やし中華、アイスなど）');
      }

      if (weather.condition === 'rainy') {
        recommendations.push('屋内で楽しめる温かい食事');
      }
    }

    // 位置に基づく推薦
    if (location) {
      recommendations.push(`${location.city}の名物：${location.popularLocalFoods.join('、')}`);
    }

    // ソーシャルコンテクストに基づく推薦
    if (social) {
      if (social.eventType === 'date') {
        recommendations.push('ロマンチックな雰囲気の料理');
      } else if (social.eventType === 'family_gathering') {
        recommendations.push('家族向けのシェア料理');
      }
    }

    return recommendations;
  }

  // 警告生成
  private generateWarnings(
    weather: WeatherContext | null,
    time: TimeContext
  ): string[] {
    const warnings: string[] = [];

    if (weather) {
      if (weather.temperature > 35) {
        warnings.push('熱中症注意：十分な水分補給を');
      }
      if (weather.condition === 'rainy') {
        warnings.push('雨天：外出時は注意');
      }
    }

    const hour = time.currentTime.getHours();
    if (hour < 6 || hour > 22) {
      warnings.push('深夜・早朝：軽めの食事を推奨');
    }

    return warnings;
  }

  // 信頼度計算
  private calculateConfidence(
    location: LocationContext | null,
    weather: WeatherContext | null,
    time: TimeContext,
    social: SocialContext | null
  ): number {
    let confidence = 0.5; // ベース信頼度

    if (location) confidence += 0.2;
    if (weather) confidence += 0.2;
    if (social) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

// グローバルインスタンス
export const contextAnalyzer = new ContextAnalyzer(); 