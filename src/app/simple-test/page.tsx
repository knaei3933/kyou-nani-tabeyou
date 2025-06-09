// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { AnimatedCard } from '../../components/ui/animated-card';
import { GlassCard, GlassButton } from '../../components/ui/glass-card';
import { gradientText } from '../../lib/utils';
import { 
  categories, 
  foods, 
  getFoodsByCategory, 
  getPopularFoods, 
  searchFoods, 
  getFoodsByTimeOfDay,
  getFoodsByPriceRange,
  getFoodsByCookingTime,
  getFoodsByDifficulty,
  type FoodItem 
} from '../../lib/foodData';

export default function FoodSelectionPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [showOnlyPopular, setShowOnlyPopular] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [maxCookingTime, setMaxCookingTime] = useState('1時間+');
  const [maxDifficulty, setMaxDifficulty] = useState('上級');
  const [timeOfDay, setTimeOfDay] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // フィルターされた料理リスト（メモ化）
  const filteredFoods = useMemo(() => {
    let result = foods;

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      result = getFoodsByCategory(selectedCategory);
    }

    // 人気料理フィルタ
    if (showOnlyPopular) {
      result = result.filter(food => food.popular);
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const searchResult = searchFoods(searchQuery);
      result = result.filter(food => searchResult.some(s => s.id === food.id));
    }

    // 価格フィルタ
    if (showAdvancedFilters) {
      const priceFiltered = getFoodsByPriceRange(maxPrice);
      result = result.filter(food => priceFiltered.some(p => p.id === food.id));

      // 調理時間フィルタ
      const timeFiltered = getFoodsByCookingTime(maxCookingTime);
      result = result.filter(food => timeFiltered.some(t => t.id === food.id));

      // 難易度フィルタ
      const difficultyFiltered = getFoodsByDifficulty(maxDifficulty);
      result = result.filter(food => difficultyFiltered.some(d => d.id === food.id));
    }

    // 時間帯フィルタ
    if (timeOfDay !== 'all') {
      const timeBasedFoods = getFoodsByTimeOfDay(timeOfDay);
      result = result.filter(food => timeBasedFoods.some(t => t.id === food.id));
    }

    return result;
  }, [selectedCategory, showOnlyPopular, searchQuery, maxPrice, maxCookingTime, maxDifficulty, timeOfDay, showAdvancedFilters]);

  // 料理選択/解除
  const toggleFood = (foodId: string) => {
    setSelectedFoods(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  // 選択された料理処理
  const handleProceedToOptions = () => {
    if (selectedFoods.length === 0) {
      alert('料理を一つ以上選択してください！');
      return;
    }
    
    // 選択された料理情報と一緒に次のページへ
    const selectedFoodData = foods.filter(food => selectedFoods.includes(food.id));
    console.log('選択された料理:', selectedFoodData);
    
    // TODO: 次のページへルーティング（摂取方法選択）
    alert(`選択された料理: ${selectedFoodData.map(f => f.name).join(', ')}\n\n次のステップで配達・グルメ・レシピを選択できます！`);
  };

  return (
    <div style={{ 
      padding: '16px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* ヘッダー */}
      <GlassCard className="mb-6 text-center">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${gradientText}`}>
          🍽️ 今日何食べよう？
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          食べたい料理を選んでください
        </p>
        
        {/* ホームに戻るボタン */}
        <GlassButton
          onClick={() => window.location.href = '/'}
          variant="secondary"
          className="text-sm"
        >
          🏠 ホーム
        </GlassButton>
      </GlassCard>

      {/* フィルターとコントロール */}
      <GlassCard className="mb-6">
        {/* 検索バー */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 料理名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/60 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* 基本フィルタ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 人気料理トグル */}
          <label className="flex items-center cursor-pointer text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={showOnlyPopular}
              onChange={(e) => setShowOnlyPopular(e.target.checked)}
              className="mr-3 w-4 h-4"
            />
            🔥 人気料理のみ表示
          </label>

          {/* 時間帯選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              🕐 時間帯:
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="all">全時間帯</option>
              <option value="morning">朝食（6-10時）</option>
              <option value="lunch">昼食（11-15時）</option>
              <option value="afternoon">おやつ（15-18時）</option>
              <option value="dinner">夕食（18-22時）</option>
              <option value="late_night">夜食（22時以降）</option>
            </select>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <div className="mb-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-700">
            カテゴリー選択:
          </h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                {category.emoji} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 高度なフィルタトグル */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showAdvancedFilters ? '🔽' : '▶️'} 詳細フィルタ
          </button>
        </div>

        {/* 高度なフィルタ */}
        {showAdvancedFilters && (
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 価格フィルタ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 最大価格: {maxPrice}円
                </label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">200円 - 5000円</div>
              </div>

              {/* 調理時間フィルタ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⏰ 調理時間:
                </label>
                <select
                  value={maxCookingTime}
                  onChange={(e) => setMaxCookingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="5分">5分以内</option>
                  <option value="15分">15分以内</option>
                  <option value="30分">30分以内</option>
                  <option value="1時間+">1時間以内</option>
                  <option value="3時間+">制限なし</option>
                </select>
              </div>

              {/* 難易度フィルタ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📊 最大難易度:
                </label>
                <select
                  value={maxDifficulty}
                  onChange={(e) => setMaxDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="初級">初級のみ</option>
                  <option value="中級">中級まで</option>
                  <option value="上級">制限なし</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 統計と選択情報 */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-2 rounded-lg">
            <span className="font-semibold text-blue-800">
              📊 表示中: {filteredFoods.length}個 / 全{foods.length}個
            </span>
          </div>
          
          {selectedFoods.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-3 py-2 rounded-lg">
              <span className="font-semibold text-green-800">
                ✅ {selectedFoods.length}個選択中
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* 料理グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {filteredFoods.map((food) => (
          <AnimatedCard
            key={food.id}
            onClick={() => toggleFood(food.id)}
            selected={selectedFoods.includes(food.id)}
            glow={selectedFoods.includes(food.id)}
            className="text-center p-4 relative hover:scale-105 transition-transform duration-200"
          >
            {/* バッジ */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {food.popular && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  人気
                </span>
              )}
              <span className={`text-white text-xs px-2 py-1 rounded-full font-medium ${
                food.difficulty === '初級' ? 'bg-green-500' :
                food.difficulty === '中級' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {food.difficulty}
              </span>
            </div>

            {/* メイン内容 */}
            <div className="text-4xl mb-3 mt-2">
              {food.emoji}
            </div>
            <h3 className="text-sm font-bold mb-2 text-gray-800 leading-tight">
              {food.name}
            </h3>
            
            {/* 詳細情報 */}
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center justify-center gap-1">
                <span>💰</span>
                <span>{food.priceRange}円</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>⏰</span>
                <span>{food.cookingTime}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>🔥</span>
                <span>{food.calories}</span>
              </div>
            </div>

            {/* タグ */}
            {food.tags && food.tags.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap justify-center gap-1">
                  {food.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {food.tags.length > 2 && (
                    <span className="text-gray-400 text-xs">
                      +{food.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 説明（ホバー時） */}
            <div className="absolute inset-0 bg-black/80 text-white p-3 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center">
              <p className="text-xs leading-relaxed text-center">
                {food.description}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {food.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white/20 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* 進行ボタン */}
      {selectedFoods.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <GlassButton
            onClick={handleProceedToOptions}
            className="px-8 py-4 text-lg font-bold shadow-2xl"
          >
            🎯 次へ進む ({selectedFoods.length}個選択)
          </GlassButton>
        </div>
      )}

      {/* 結果がない時 */}
      {filteredFoods.length === 0 && (
        <GlassCard className="text-center py-12">
          <div className="text-5xl mb-4">😅</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            該当する料理がありません
          </h3>
          <p className="text-gray-600">
            フィルターを変更してみてください
          </p>
        </GlassCard>
      )}
    </div>
  );
} 