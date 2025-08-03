// 레시피 데이터 타입 정의
export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  cookingTime: number; // 분 단위
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  imageUrl?: string;
  ingredients: RecipeIngredient[];
  tags: string[];
  cuisine: string; // '일본', '한국', '중국', '서양' 등
  createdAt: Date;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface UserFridge {
  ingredientId: string;
  name: string;
  amount: number;
  unit: string;
  expiryDate?: Date;
}

export interface UserPreferences {
  allergies: string[];
  dislikes: string[];
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  cookingLevel: 'beginner' | 'intermediate' | 'advanced';
  maxCookingTime: number; // 분
}

// 규칙 기반 추천 엔진
export class RecipeRecommendationEngine {
  private recipes: Recipe[] = [];

  constructor(recipes: Recipe[]) {
    this.recipes = recipes;
  }

  // 냉장고 재료 기반 추천
  recommendByFridge(userFridge: UserFridge[], preferences: UserPreferences): Recipe[] {
    const availableIngredients = new Set(userFridge.map(item => item.name.toLowerCase()));
    
    return this.recipes
      .filter(recipe => this.canMakeWithFridge(recipe, availableIngredients, preferences))
      .sort((a, b) => this.calculateMatchScore(b, userFridge, preferences) - 
                      this.calculateMatchScore(a, userFridge, preferences))
      .slice(0, 10);
  }

  // 상황별 추천 (시간, 난이도 기반)
  recommendBySituation(
    maxTime: number, 
    difficulty: string, 
    preferences: UserPreferences
  ): Recipe[] {
    return this.recipes
      .filter(recipe => {
        // 시간 제약
        if (recipe.cookingTime > maxTime) return false;
        
        // 난이도 제약
        if (difficulty && recipe.difficulty !== difficulty) return false;
        
        // 사용자 제약사항
        if (!this.meetsPreferences(recipe, preferences)) return false;
        
        return true;
      })
      .sort((a, b) => b.cookingTime - a.cookingTime) // 조리시간 역순
      .slice(0, 10);
  }

  // 개인화 추천 (선호도 기반)
  recommendPersonalized(preferences: UserPreferences): Recipe[] {
    return this.recipes
      .filter(recipe => this.meetsPreferences(recipe, preferences))
      .sort((a, b) => this.calculatePersonalizedScore(b, preferences) - 
                      this.calculatePersonalizedScore(a, preferences))
      .slice(0, 10);
  }

  // 냉장고 재료로 만들 수 있는지 확인
  private canMakeWithFridge(
    recipe: Recipe, 
    availableIngredients: Set<string>, 
    preferences: UserPreferences
  ): boolean {
    // 사용자 제약사항 확인
    if (!this.meetsPreferences(recipe, preferences)) return false;

    // 필수 재료 확인 (기본 조미료는 제외)
    const basicSeasonings = new Set(['소금', '후추', '간장', '설탕', '기름', '마늘', '양파']);
    const requiredIngredients = recipe.ingredients.filter(
      ing => !basicSeasonings.has(ing.name)
    );

    // 필수 재료의 50% 이상이 있어야 함
    const availableCount = requiredIngredients.filter(
      ing => availableIngredients.has(ing.name.toLowerCase())
    ).length;

    return availableCount >= Math.ceil(requiredIngredients.length * 0.5);
  }

  // 사용자 선호도 체크
  private meetsPreferences(recipe: Recipe, preferences: UserPreferences): boolean {
    // 알레르기 체크
    if (preferences.allergies.some(allergy => 
      recipe.ingredients.some(ing => ing.name.includes(allergy)) ||
      recipe.title.includes(allergy) ||
      recipe.description.includes(allergy)
    )) {
      return false;
    }

    // 싫어하는 음식 체크
    if (preferences.dislikes.some(dislike => 
      recipe.ingredients.some(ing => ing.name.includes(dislike)) ||
      recipe.title.includes(dislike)
    )) {
      return false;
    }

    // 조리 시간 체크
    if (recipe.cookingTime > preferences.maxCookingTime) {
      return false;
    }

    // 난이도 체크 (초보자는 easy, medium만)
    if (preferences.cookingLevel === 'beginner' && recipe.difficulty === 'hard') {
      return false;
    }

    return true;
  }

  // 냉장고 재료 매칭 점수 계산
  private calculateMatchScore(
    recipe: Recipe, 
    userFridge: UserFridge[], 
    preferences: UserPreferences
  ): number {
    let score = 0;
    const availableIngredients = userFridge.map(item => item.name.toLowerCase());

    // 재료 매칭 점수 (40점)
    const matchedIngredients = recipe.ingredients.filter(ing => 
      availableIngredients.includes(ing.name.toLowerCase())
    );
    score += (matchedIngredients.length / recipe.ingredients.length) * 40;

    // 유통기한 급한 재료 사용 보너스 (20점)
    const urgentIngredients = userFridge.filter(item => {
      const expiry = item.expiryDate;
      if (!expiry) return false;
      const daysLeft = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 3;
    });
    const usesUrgentIngredients = urgentIngredients.some(urgent =>
      recipe.ingredients.some(ing => ing.name.toLowerCase() === urgent.name.toLowerCase())
    );
    if (usesUrgentIngredients) score += 20;

    // 선호 요리 보너스 (20점)
    if (preferences.preferredCuisines.includes(recipe.cuisine)) {
      score += 20;
    }

    // 조리 시간 점수 (20점)
    const timeScore = Math.max(0, 20 - (recipe.cookingTime / preferences.maxCookingTime) * 20);
    score += timeScore;

    return score;
  }

  // 개인화 점수 계산
  private calculatePersonalizedScore(recipe: Recipe, preferences: UserPreferences): number {
    let score = 0;

    // 선호 요리 점수 (40점)
    if (preferences.preferredCuisines.includes(recipe.cuisine)) {
      score += 40;
    }

    // 난이도 적합성 (30점)
    const difficultyScore = this.getDifficultyScore(recipe.difficulty, preferences.cookingLevel);
    score += difficultyScore;

    // 조리 시간 점수 (30점)
    const timeRatio = recipe.cookingTime / preferences.maxCookingTime;
    if (timeRatio <= 0.5) score += 30;
    else if (timeRatio <= 0.8) score += 20;
    else if (timeRatio <= 1.0) score += 10;

    return score;
  }

  private getDifficultyScore(recipeDifficulty: string, userLevel: string): number {
    const difficultyMap = {
      'beginner': { easy: 30, medium: 20, hard: 0 },
      'intermediate': { easy: 25, medium: 30, hard: 20 },
      'advanced': { easy: 20, medium: 25, hard: 30 }
    };

    return difficultyMap[userLevel as keyof typeof difficultyMap]?.[recipeDifficulty as keyof typeof difficultyMap['beginner']] || 0;
  }
}

// 샘플 레시피 데이터
export const sampleRecipes: Recipe[] = [
  {
    id: 'recipe_1',
    title: '간단한 김치볶음밥',
    description: '1인분 김치볶음밥 만들기',
    instructions: '1. 김치를 잘게 썬다\n2. 팬에 기름을 두르고 김치를 볶는다\n3. 밥을 넣고 함께 볶는다\n4. 간장으로 간을 맞춘다',
    cookingTime: 15,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'ing_1', name: '김치', amount: 100, unit: 'g', category: '채소' },
      { id: 'ing_2', name: '밥', amount: 1, unit: '공기', category: '주식' },
      { id: 'ing_3', name: '간장', amount: 1, unit: '큰술', category: '조미료' },
      { id: 'ing_4', name: '기름', amount: 1, unit: '큰술', category: '조미료' }
    ],
    tags: ['한식', '볶음', '간단'],
    cuisine: '한국',
    createdAt: new Date()
  },
  {
    id: 'recipe_2',
    title: '계란후라이',
    description: '간단한 아침식사용 계란후라이',
    instructions: '1. 팬에 기름을 두른다\n2. 계란을 깨뜨려 넣는다\n3. 소금, 후추로 간한다\n4. 기호에 따라 뒤집어서 익힌다',
    cookingTime: 5,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'ing_5', name: '계란', amount: 2, unit: '개', category: '단백질' },
      { id: 'ing_6', name: '소금', amount: 1, unit: '꼬집', category: '조미료' },
      { id: 'ing_7', name: '후추', amount: 1, unit: '꼬집', category: '조미료' },
      { id: 'ing_8', name: '기름', amount: 1, unit: '큰술', category: '조미료' }
    ],
    tags: ['서양', '계란', '아침'],
    cuisine: '서양',
    createdAt: new Date()
  }
];

// 추천 엔진 인스턴스 생성
export const recommendationEngine = new RecipeRecommendationEngine(sampleRecipes); 