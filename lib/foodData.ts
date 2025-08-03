import foodsData from '../data/foods.json';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  popular: boolean;
  priceRange: string;
  calories: string;
  cookingTime: string;
  difficulty: string;
  regions: string[];
  description: string;
  tags: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Region {
  id: string;
  name: string;
  specialties: string[];
  priceLevel?: string;
  popularTime?: string;
}

// データ型チェックとエクスポート
export const categories: FoodCategory[] = foodsData.categories;
export const regions: Region[] = foodsData.regions;
export const foods: FoodItem[] = foodsData.foods;

// カテゴリ別フィルタリング関数
export const getFoodsByCategory = (categoryId: string): FoodItem[] => {
  if (categoryId === 'all') return foods;
  return foods.filter(food => food.category === categoryId);
};

// 人気食品取得関数
export const getPopularFoods = (limit?: number): FoodItem[] => {
  const popularFoods = foods.filter(food => food.popular);
  return limit ? popularFoods.slice(0, limit) : popularFoods;
};

// 地域別おすすめ食品
export const getFoodsByRegion = (regionId: string): FoodItem[] => {
  if (regionId === 'all') return foods;
  return foods.filter(food => 
    food.regions.includes(regionId) || food.regions.includes('all')
  );
};

// 検索機能
export const searchFoods = (query: string): FoodItem[] => {
  const lowerQuery = query.toLowerCase();
  return foods.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.description.toLowerCase().includes(lowerQuery) ||
    food.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// 価格帯別フィルタ
export const getFoodsByPriceRange = (maxPrice: number): FoodItem[] => {
  return foods.filter(food => {
    const priceRange = food.priceRange.split('-');
    const minPrice = parseInt(priceRange[0]);
    return minPrice <= maxPrice;
  });
};

// 調理時間別フィルタ
export const getFoodsByCookingTime = (maxTime: string): FoodItem[] => {
  const timeOrder = ['5分', '10分', '15分', '20分', '25分', '30分', '45分', '50分', '1時間+', '3時間+'];
  const maxIndex = timeOrder.indexOf(maxTime);
  
  return foods.filter(food => {
    const foodTimeIndex = timeOrder.indexOf(food.cookingTime);
    return foodTimeIndex <= maxIndex;
  });
};

// 難易度別フィルタ
export const getFoodsByDifficulty = (difficulty: string): FoodItem[] => {
  const difficultyOrder = ['初級', '中級', '上級'];
  const maxIndex = difficultyOrder.indexOf(difficulty);
  
  return foods.filter(food => {
    const foodDifficultyIndex = difficultyOrder.indexOf(food.difficulty);
    return foodDifficultyIndex <= maxIndex;
  });
};

// カテゴリ情報取得
export const getCategoryById = (categoryId: string): FoodCategory | undefined => {
  return categories.find(cat => cat.id === categoryId);
};

// 地域情報取得
export const getRegionById = (regionId: string): Region | undefined => {
  return regions.find(region => region.id === regionId);
};

// ランダム推奨
export const getRandomFoods = (count: number = 3): FoodItem[] => {
  const shuffled = [...foods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 統計情報
export const getFoodStats = () => {
  return {
    totalFoods: foods.length,
    totalCategories: categories.length,
    popularFoods: foods.filter(f => f.popular).length,
    averagePrice: calculateAveragePrice(),
    regionCoverage: regions.length
  };
};

const calculateAveragePrice = (): number => {
  const prices = foods.map(food => {
    const range = food.priceRange.split('-');
    const min = parseInt(range[0]);
    const max = parseInt(range[1] || range[0]);
    return (min + max) / 2;
  });
  
  return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
};

// 時間帯別おすすめ
export const getFoodsByTimeOfDay = (timeOfDay: string): FoodItem[] => {
  const timeBasedCategories = {
    morning: ['breakfast', 'beverage'],
    lunch: ['donburi', 'ramen', 'yoshoku', 'bento'],
    afternoon: ['snack', 'dessert', 'beverage'],
    dinner: ['washoku', 'meat', 'chinese', 'korean', 'hotpot'],
    late_night: ['snack', 'ramen', 'chicken']
  };
  
  const relevantCategories = timeBasedCategories[timeOfDay as keyof typeof timeBasedCategories] || [];
  return foods.filter(food => relevantCategories.includes(food.category));
}; 