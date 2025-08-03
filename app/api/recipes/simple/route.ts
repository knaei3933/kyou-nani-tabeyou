// 데이터베이스 연결 없이 작동하는 간단한 레시피 API

export async function GET() {
  try {
    // 샘플 레시피 데이터
    const sampleRecipes = [
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
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
      },
      {
        id: 'recipe_3',
        title: '라면',
        description: '간단한 1인분 라면',
        instructions: '1. 물 550ml를 끓인다\n2. 면과 스프를 넣는다\n3. 3분간 끓인다\n4. 계란을 넣어 마무리한다',
        cookingTime: 5,
        difficulty: 'easy',
        servings: 1,
        ingredients: [
          { id: 'ing_9', name: '라면', amount: 1, unit: '봉지', category: '주식' },
          { id: 'ing_10', name: '물', amount: 550, unit: 'ml', category: '기타' },
          { id: 'ing_11', name: '계란', amount: 1, unit: '개', category: '단백질' }
        ],
        tags: ['한식', '면류', '간단'],
        cuisine: '한국',
        createdAt: new Date().toISOString()
      },
      {
        id: 'recipe_4',
        title: '토스트',
        description: '간단한 아침 토스트',
        instructions: '1. 식빵을 토스터에 넣는다\n2. 2분간 굽는다\n3. 버터나 잼을 발른다',
        cookingTime: 3,
        difficulty: 'easy',
        servings: 1,
        ingredients: [
          { id: 'ing_12', name: '식빵', amount: 2, unit: '장', category: '주식' },
          { id: 'ing_13', name: '버터', amount: 1, unit: '큰술', category: '유제품' }
        ],
        tags: ['서양', '빵', '아침'],
        cuisine: '서양',
        createdAt: new Date().toISOString()
      }
    ];

    return Response.json({
      success: true,
      message: '레시피 조회 성공!',
      recipes: sampleRecipes,
      count: sampleRecipes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: '레시피 조회 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 추천 로직 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fridgeItems = [], maxTime = 30, difficulty = 'easy' } = body;

    // 샘플 데이터
    const allRecipes = [
      {
        id: 'recipe_1',
        title: '간단한 김치볶음밥',
        description: '1인분 김치볶음밥 만들기',
        cookingTime: 15,
        difficulty: 'easy',
        ingredients: [
          { name: '김치', amount: 100, unit: 'g' },
          { name: '밥', amount: 1, unit: '공기' },
          { name: '간장', amount: 1, unit: '큰술' },
          { name: '기름', amount: 1, unit: '큰술' }
        ],
        cuisine: '한국'
      },
      {
        id: 'recipe_2',
        title: '계란후라이',
        description: '간단한 아침식사용 계란후라이',
        cookingTime: 5,
        difficulty: 'easy',
        ingredients: [
          { name: '계란', amount: 2, unit: '개' },
          { name: '소금', amount: 1, unit: '꼬집' },
          { name: '기름', amount: 1, unit: '큰술' }
        ],
        cuisine: '서양'
      },
      {
        id: 'recipe_3',
        title: '라면',
        description: '간단한 1인분 라면',
        cookingTime: 5,
        difficulty: 'easy',
        ingredients: [
          { name: '라면', amount: 1, unit: '봉지' },
          { name: '물', amount: 550, unit: 'ml' },
          { name: '계란', amount: 1, unit: '개' }
        ],
        cuisine: '한국'
      }
    ];

    // 간단한 필터링 로직
    let filteredRecipes = allRecipes.filter(recipe => {
      // 시간 제약
      if (recipe.cookingTime > maxTime) return false;
      
      // 난이도 제약  
      if (difficulty && recipe.difficulty !== difficulty) return false;
      
      return true;
    });

    // 냉장고 재료가 있으면 매칭도로 정렬
    if (fridgeItems && fridgeItems.length > 0) {
      const fridgeItemNames = fridgeItems.map((item: string) => item.toLowerCase().trim());
      
      filteredRecipes = filteredRecipes
        .map(recipe => {
          const matchCount = recipe.ingredients.filter(ing => 
            fridgeItemNames.some(fridgeItem => ing.name.toLowerCase().includes(fridgeItem))
          ).length;
          
          return { ...recipe, matchScore: matchCount };
        })
        .sort((a: any, b: any) => b.matchScore - a.matchScore);
    }

    return Response.json({
      success: true,
      message: '레시피 추천 성공!',
      recommendations: filteredRecipes.slice(0, 5),
      count: filteredRecipes.length,
      filters: { maxTime, difficulty, fridgeItems },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: '레시피 추천 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 