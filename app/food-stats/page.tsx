// @ts-nocheck
'use client';

import { useState } from 'react';
import { GlassCard, GlassButton } from '../../components/ui/glass-card';
import { AnimatedCard } from '../../components/ui/animated-card';
import { gradientText } from '../../lib/utils';
import { 
  foods, 
  categories, 
  regions, 
  getFoodStats, 
  getPopularFoods, 
  getFoodsByCategory,
  getFoodsByRegion,
  getFoodsByTimeOfDay 
} from '../../lib/foodData';

export default function FoodStatsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const stats = getFoodStats();

  // カテゴリ別統計
  const categoryStats = categories.map(category => ({
    ...category,
    count: getFoodsByCategory(category.id).length,
    popularCount: getFoodsByCategory(category.id).filter(f => f.popular).length
  }));

  // 地域別統計
  const regionStats = regions.map(region => ({
    ...region,
    count: getFoodsByRegion(region.id).length
  }));

  // 時間帯別統計
  const timeStats = [
    { id: 'morning', name: '朝食', emoji: '🌅', foods: getFoodsByTimeOfDay('morning') },
    { id: 'lunch', name: '昼食', emoji: '☀️', foods: getFoodsByTimeOfDay('lunch') },
    { id: 'afternoon', name: 'おやつ', emoji: '🌤️', foods: getFoodsByTimeOfDay('afternoon') },
    { id: 'dinner', name: '夕食', emoji: '🌆', foods: getFoodsByTimeOfDay('dinner') },
    { id: 'late_night', name: '夜食', emoji: '🌙', foods: getFoodsByTimeOfDay('late_night') }
  ];

  // 価格帯別統計
  const priceRanges = [
    { range: '0-500円', min: 0, max: 500 },
    { range: '500-1000円', min: 500, max: 1000 },
    { range: '1000-1500円', min: 1000, max: 1500 },
    { range: '1500-2000円', min: 1500, max: 2000 },
    { range: '2000円以上', min: 2000, max: 99999 }
  ];

  const priceStats = priceRanges.map(range => ({
    ...range,
    count: foods.filter(food => {
      const prices = food.priceRange.split('-').map(p => parseInt(p));
      const avgPrice = (prices[0] + (prices[1] || prices[0])) / 2;
      return avgPrice >= range.min && avgPrice < range.max;
    }).length
  }));

  // 難易度別統計
  const difficultyStats = [
    { level: '初級', foods: foods.filter(f => f.difficulty === '初級') },
    { level: '中級', foods: foods.filter(f => f.difficulty === '中級') },
    { level: '上級', foods: foods.filter(f => f.difficulty === '上級') }
  ];

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
          📊 食事データ統計
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          拡張された食事データベースの詳細分析
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          <GlassButton
            onClick={() => window.location.href = '/'}
            variant="secondary"
            className="text-sm"
          >
            🏠 ホーム
          </GlassButton>
          <GlassButton
            onClick={() => window.location.href = '/simple-test'}
            variant="secondary"
            className="text-sm"
          >
            🍽️ 食事選択
          </GlassButton>
        </div>
      </GlassCard>

      {/* タブナビゲーション */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', name: '概要', emoji: '📈' },
            { id: 'category', name: 'カテゴリ', emoji: '🏷️' },
            { id: 'region', name: '地域', emoji: '🗾' },
            { id: 'time', name: '時間帯', emoji: '🕐' },
            { id: 'price', name: '価格', emoji: '💰' },
            { id: 'difficulty', name: '難易度', emoji: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
              }`}
            >
              {tab.emoji} {tab.name}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* コンテンツエリア */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 全体統計 */}
          <GlassCard>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🎯 全体統計</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalFoods}</div>
                <div className="text-sm text-gray-600">総料理数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalCategories}</div>
                <div className="text-sm text-gray-600">カテゴリ数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.popularFoods}</div>
                <div className="text-sm text-gray-600">人気料理数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.averagePrice}円</div>
                <div className="text-sm text-gray-600">平均価格</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{stats.regionCoverage}</div>
                <div className="text-sm text-gray-600">対応地域数</div>
              </div>
            </div>
          </GlassCard>

          {/* 人気料理トップ10 */}
          <GlassCard>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🔥 人気料理トップ10</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {getPopularFoods(10).map((food, index) => (
                <AnimatedCard key={food.id} className="text-center p-3">
                  <div className="text-2xl mb-2">{food.emoji}</div>
                  <div className="text-sm font-bold text-gray-800">{food.name}</div>
                  <div className="text-xs text-gray-600">{food.priceRange}円</div>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full mt-2">
                    #{index + 1}
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'category' && (
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🏷️ カテゴリ別統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.filter(cat => cat.id !== 'all').map(category => (
              <AnimatedCard key={category.id} className="p-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <h3 className="font-bold text-gray-800">{category.name}</h3>
                  <div className="text-sm text-gray-600 mt-2">
                    総数: <span className="font-bold text-blue-600">{category.count}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    人気: <span className="font-bold text-yellow-600">{category.popularCount}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.count / foods.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((category.count / foods.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'region' && (
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🗾 地域別統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionStats.map(region => (
              <AnimatedCard key={region.id} className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{region.name}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  対応料理数: <span className="font-bold text-blue-600">{region.count}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">特産料理:</div>
                  {region.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                {region.priceLevel && (
                  <div className="mt-2 text-xs">
                    価格帯: <span className="font-medium">{region.priceLevel}</span>
                  </div>
                )}
                {region.popularTime && (
                  <div className="text-xs">
                    人気時間: <span className="font-medium">{region.popularTime}</span>
                  </div>
                )}
              </AnimatedCard>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'time' && (
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🕐 時間帯別統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeStats.map(time => (
              <AnimatedCard key={time.id} className="p-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">{time.emoji}</div>
                  <h3 className="font-bold text-gray-800">{time.name}</h3>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {time.foods.length}
                  </div>
                  <div className="text-sm text-gray-600">対応料理数</div>
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {time.foods.slice(0, 8).map(food => (
                      <div key={food.id} className="text-lg" title={food.name}>
                        {food.emoji}
                      </div>
                    ))}
                  </div>
                  {time.foods.length > 8 && (
                    <div className="text-xs text-gray-500 mt-1">
                      他 {time.foods.length - 8}個
                    </div>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'price' && (
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">💰 価格帯別統計</h2>
          <div className="space-y-4">
            {priceStats.map(price => (
              <div key={price.range} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {price.range}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(price.count / foods.length) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {price.count}
                    </span>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600">
                  {((price.count / foods.length) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'difficulty' && (
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 難易度別統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficultyStats.map(diff => (
              <AnimatedCard key={diff.level} className="p-4">
                <div className="text-center">
                  <div className={`text-4xl mb-3 ${
                    diff.level === '初級' ? 'text-green-500' :
                    diff.level === '中級' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {diff.level === '初級' ? '🟢' : 
                     diff.level === '中級' ? '🟡' : '🔴'}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{diff.level}</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {diff.foods.length}
                  </div>
                  <div className="text-sm text-gray-600">料理数</div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-gray-500">代表的な料理:</div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {diff.foods.slice(0, 6).map(food => (
                        <span key={food.id} className="text-lg" title={food.name}>
                          {food.emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
} 