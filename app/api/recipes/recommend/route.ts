import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine, UserFridge, UserPreferences } from '@/lib/recipe-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // 기본 사용자 선호도 (임시)
    const defaultPreferences: UserPreferences = {
      allergies: [],
      dislikes: [],
      dietaryRestrictions: [],
      preferredCuisines: ['한국', '일본'],
      cookingLevel: 'beginner',
      maxCookingTime: 30
    };

    let recommendations = [];

    switch (type) {
      case 'fridge':
        // 냉장고 재료 기반 추천
        const userFridge: UserFridge[] = data.fridge || [];
        const preferences: UserPreferences = { ...defaultPreferences, ...data.preferences };
        recommendations = recommendationEngine.recommendByFridge(userFridge, preferences);
        break;

      case 'situation':
        // 상황별 추천
        const maxTime = data.maxTime || 30;
        const difficulty = data.difficulty || '';
        const sitPreferences: UserPreferences = { ...defaultPreferences, ...data.preferences };
        recommendations = recommendationEngine.recommendBySituation(maxTime, difficulty, sitPreferences);
        break;

      case 'personalized':
        // 개인화 추천
        const persPreferences: UserPreferences = { ...defaultPreferences, ...data.preferences };
        recommendations = recommendationEngine.recommendPersonalized(persPreferences);
        break;

      default:
        return NextResponse.json({
          success: false,
          message: '올바르지 않은 추천 타입입니다.'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '레시피 추천 성공!',
      recommendations: recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '레시피 추천 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 기본 추천 레시피 조회
export async function GET() {
  try {
    const defaultPreferences: UserPreferences = {
      allergies: [],
      dislikes: [],
      dietaryRestrictions: [],
      preferredCuisines: ['한국', '일본'],
      cookingLevel: 'beginner',
      maxCookingTime: 30
    };

    const recommendations = recommendationEngine.recommendPersonalized(defaultPreferences);

    return NextResponse.json({
      success: true,
      message: '기본 추천 레시피 조회 성공!',
      recommendations: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '기본 추천 레시피 조회 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 