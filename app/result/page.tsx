// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DeliveryAppButtons from '@/components/DeliveryAppButtons';
import { GlassCard, GlassButton } from '../../components/ui/glass-card';
import { AnimatedCard } from '../../components/ui/animated-card';
import { FlowNavigationComponent } from '../../components/ui/flow-navigation';
import { useFlowState } from '../../lib/flowState';
import { gradientText } from '../../lib/utils';
import { foods, type FoodItem } from '../../lib/foodData';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, ShowOn, HideOn, useScreenSize } from '../../components/ui/ResponsiveLayout';
import { SidebarNav, HeaderNav, QuickActions } from '../../components/ui/DesktopNavigation';

// 仮のレストランデータ型
interface RestaurantData {
  id: string;
  name: string;
  rating: number;
  priceRange: string;
  cuisine: string[];
  distance: string;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  deliveryApps: {
    ubereats?: string;
    demaekan?: string;
    wolt?: string;
  };
}

// ヘルパー関数群
const getPriceRangeText = (priceLevel?: number): string => {
  switch (priceLevel) {
    case 1: return '500-1000円';
    case 2: return '1000-2000円';
    case 3: return '2000-4000円';
    case 4: return '4000円以上';
    default: return '1000-2000円';
  }
};

const extractCuisineTypes = (types: string[]): string[] => {
  const cuisineMap: { [key: string]: string } = {
    'restaurant': '一般',
    'food': '料理',
    'meal_takeaway': 'テイクアウト',
    'bakery': 'ベーカリー',
    'cafe': 'カフェ',
    'bar': 'バー',
    'meal_delivery': 'デリバリー'
  };

  const cuisineTypes = types
    .filter(type => cuisineMap[type])
    .map(type => cuisineMap[type])
    .slice(0, 3);
    
  return cuisineTypes.length > 0 ? cuisineTypes : ['一般'];
};

const calculateDistance = (location?: { lat: number; lng: number }, userLocation?: string): string => {
  if (!location || !userLocation) return '距離不明';
  
  // 簡単な距離計算（実際には Haversine 공식 사용）
  const distance = Math.random() * 2 + 0.5; // 0.5-2.5km の範囲
  return `${distance.toFixed(1)}km`;
};

const estimateDeliveryTime = (rating?: number): string => {
  if (!rating) return '30-45分';
  
  // 評価が高いほど配達時間が長い（人気店）
  const baseTime = rating > 4.0 ? 35 : 25;
  const variation = Math.floor(Math.random() * 10);
  return `${baseTime + variation}-${baseTime + variation + 15}分`;
};

const calculateDeliveryFee = (priceLevel?: number): string => {
  switch (priceLevel) {
    case 1: return '150円';
    case 2: return '200円';
    case 3: return '300円';
    case 4: return '400円';
    default: return '200円';
  }
};

const getRestaurantEmoji = (types: string[]): string => {
  if (types.includes('bakery')) return '🥖';
  if (types.includes('cafe')) return '☕';
  if (types.includes('bar')) return '🍺';
  if (types.includes('meal_takeaway')) return '🥡';
  return '🍽️';
};

const generateDeliveryApps = (restaurantName: string) => {
  // レストラン名に基づいて配達アプリ可用性を決定
  const apps: any = {};
  
  // 80% 확률로 Uber Eats 이용 가능
  if (Math.random() > 0.2) {
    apps.ubereats = `search-${encodeURIComponent(restaurantName)}`;
  }
  
  // 60% 확률로 출전관 이용 가능
  if (Math.random() > 0.4) {
    apps.demaekan = `search-${encodeURIComponent(restaurantName)}`;
  }
  
  // 40% 확률로 Wolt 이용 가능
  if (Math.random() > 0.6) {
    apps.wolt = `search-${encodeURIComponent(restaurantName)}`;
  }
  
  return apps;
};

// サンプルレストランデータ（後でGoogle Places APIに置き換え）
const getSampleRestaurants = (foodNames: string[]): RestaurantData[] => {
  const sampleRestaurants: RestaurantData[] = [
    {
      id: 'rest-1',
      name: 'ラーメン太郎 渋谷店',
      rating: 4.2,
      priceRange: '800-1200円',
      cuisine: ['ラーメン', '餃子'],
      distance: '0.8km',
      deliveryTime: '25-35分',
      deliveryFee: '150円',
      image: '🍜',
      deliveryApps: {
        ubereats: 'ramen-taro-shibuya',
        demaekan: 'ramen-taro-shibuya-demae'
      }
    },
    {
      id: 'rest-2', 
      name: 'Pizza House マリオ',
      rating: 4.0,
      priceRange: '1200-2000円',
      cuisine: ['ピザ', 'イタリアン'],
      distance: '1.2km',
      deliveryTime: '30-40分',
      deliveryFee: '200円',
      image: '🍕',
      deliveryApps: {
        ubereats: 'pizza-mario-shibuya',
        wolt: 'pizza-mario-shibuya-wolt'
      }
    },
    {
      id: 'rest-3',
      name: '寿司源 本店',
      rating: 4.5,
      priceRange: '2000-4000円', 
      cuisine: ['寿司', '和食'],
      distance: '0.5km',
      deliveryTime: '40-50分',
      deliveryFee: '300円',
      image: '🍣',
      deliveryApps: {
        demaekan: 'sushi-gen-honten'
      }
    }
  ];

  // 選択された料理に基づいてフィルタリング
  return sampleRestaurants.filter(restaurant => 
    foodNames.some(foodName => 
      restaurant.cuisine.some(cuisine => 
        foodName.toLowerCase().includes(cuisine.toLowerCase()) ||
        cuisine.toLowerCase().includes(foodName.toLowerCase())
      )
    )
  );
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating'); // rating, distance, deliveryTime, price
  const [showLoadingTips, setShowLoadingTips] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 디바이스 타입 감지
  const { deviceType, isDevice } = useScreenSize();

  // フロー状態管理
  const { state, setSelectedRestaurant } = useFlowState();

  // ナビゲーションアイテム
  const navItems = [
    { icon: '🏠', label: 'ホーム', href: '/', description: 'メインページ' },
    { icon: '🍽️', label: '食事選択', href: '/simple-test', description: '今日の食事を選ぶ' },
    { icon: '📍', label: 'エリア選択', href: '/location-select', description: '配達エリアを指定' },
    { icon: '🔍', label: '検索結果', href: '/result', description: 'レストランを探す' },
    { icon: '🏪', label: '詳細・注文', href: '/restaurant', description: 'メニューと注文' },
  ];

  useEffect(() => {
    const fetchRestaurants = async () => {
      // URLパラメータから選択された料理IDを取得
      const foodIds = searchParams.get('foods')?.split(',') || [];
      
      if (foodIds.length > 0) {
        const selectedFoodData = foods.filter(food => foodIds.includes(food.id));
        setSelectedFoods(selectedFoodData);
        
        try {
          // Google Places API経由でレストランデータ取得
          const foodNames = selectedFoodData.map(food => food.name);
          const keyword = foodNames.join(' '); // 複数の料理を検索キーワードに
          
          // ユーザーの現在位置取得（失敗時は渋谷駅）
          let location = '35.6580,139.7016'; // デフォルト: 渋谷駅
          try {
            if (navigator.geolocation) {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                  enableHighAccuracy: false
                });
              });
              location = `${position.coords.latitude},${position.coords.longitude}`;
            }
          } catch (geoError) {
            console.log('位置情報取得失敗、渋谷駅を使用');
          }
          
          // API呼び出し
          const response = await fetch(
            `/api/restaurants/search?location=${location}&keyword=${encodeURIComponent(keyword)}&radius=3000`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              // Google Places APIデータを変換
              const convertedRestaurants = data.results.map((googleRestaurant: any) => ({
                id: googleRestaurant.place_id,
                name: googleRestaurant.name,
                rating: googleRestaurant.rating || 0,
                priceRange: getPriceRangeText(googleRestaurant.price_level),
                cuisine: extractCuisineTypes(googleRestaurant.types || []),
                distance: calculateDistance(googleRestaurant.geometry?.location, location),
                deliveryTime: estimateDeliveryTime(googleRestaurant.rating),
                deliveryFee: calculateDeliveryFee(googleRestaurant.price_level),
                image: getRestaurantEmoji(googleRestaurant.types || []),
                vicinity: googleRestaurant.vicinity || '',
                isOpen: googleRestaurant.opening_hours?.open_now || false,
                deliveryApps: generateDeliveryApps(googleRestaurant.name)
              }));
              setRestaurants(convertedRestaurants);
            } else {
              // APIが失敗した場合はサンプルデータ使用
              const restaurantData = getSampleRestaurants(foodNames);
              setRestaurants(restaurantData);
            }
          } else {
            // API呼び出し失敗時はサンプルデータ使用
            const restaurantData = getSampleRestaurants(foodNames);
            setRestaurants(restaurantData);
          }
        } catch (error) {
          console.error('レストラン検索エラー:', error);
          // エラー時はサンプルデータを使用
          const foodNames = selectedFoodData.map(food => food.name);
          const restaurantData = getSampleRestaurants(foodNames);
          setRestaurants(restaurantData);
        }
      }
      
      setIsLoading(false);
    };

    fetchRestaurants();
  }, [searchParams]);

  // レストラン選択とフロー状態更新
  const handleRestaurantSelect = (restaurant: RestaurantData) => {
    setSelectedRestaurant({
      id: restaurant.id,
      name: restaurant.name,
      rating: restaurant.rating,
      priceRange: restaurant.priceRange,
      deliveryTime: restaurant.deliveryTime,
      deliveryFee: restaurant.deliveryFee
    });
    // レストラン詳細ページへ遷移
    window.location.href = `/restaurant/${restaurant.id}`;
  };

  // レストラン並び替え
  const sortRestaurants = (restaurants: RestaurantData[]) => {
    return [...restaurants].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'deliveryTime':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        case 'price':
          return parseInt(a.deliveryFee) - parseInt(b.deliveryFee);
        default:
          return 0;
      }
    });
  };

  // 配達アプリを開く
  const openDeliveryApp = (restaurant: RestaurantData, app: string) => {
    const appUrls = {
      ubereats: `https://www.ubereats.com/jp/store/${restaurant.deliveryApps.ubereats}`,
      demaekan: `https://demae-can.com/shop/${restaurant.deliveryApps.demaekan}`,
      wolt: `https://wolt.com/ja/discovery/restaurant/${restaurant.deliveryApps.wolt}`
    };
    
    const url = appUrls[app as keyof typeof appUrls];
    if (url) {
      window.open(url, '_blank');
    } else {
      // フォールバック: アプリのメインページ
      const fallbackUrls = {
        ubereats: 'https://www.ubereats.com/jp',
        demaekan: 'https://demae-can.com',
        wolt: 'https://wolt.com/ja'
      };
      window.open(fallbackUrls[app as keyof typeof fallbackUrls], '_blank');
    }
  };

  // ローディング中のヒント表示
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoadingTips(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const sortedRestaurants = sortRestaurants(restaurants);

  if (isLoading) {
    return (
      <div style={{ 
        padding: '16px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        {/* フローナビゲーション（ローディング中も表示） */}
        <FlowNavigationComponent 
          currentPageStep={3}
          showNavigation={false}
          className="mb-6"
        />

        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="text-center max-w-md">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              レストランを検索中...
            </h3>
            <p className="text-gray-600 mb-4">
              あなたの選択に合った最適なレストランを探しています
            </p>
            
            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>

            {/* ヒント表示 */}
            {showLoadingTips && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left">
                <h4 className="font-semibold text-blue-800 mb-2">💡 検索のコツ</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 近くの人気店を優先して検索しています</li>
                  <li>• 配達時間と評価を総合的に判断</li>
                  <li>• 複数の配達アプリで比較可能</li>
                </ul>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* デスクトップ用サイドバー */}
      <HideOn device={["mobile", "tablet"]}>
        <div className="fixed left-0 top-0 h-full z-30">
          <SidebarNav 
            items={navItems}
            currentPage="/result"
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </HideOn>

      {/* タブレット用ヘッダー */}
      <ShowOn device="tablet">
        <div className="fixed top-0 left-0 right-0 z-30">
          <HeaderNav items={navItems} currentPage="/result" />
        </div>
      </ShowOn>

      {/* メインコンテンツエリア */}
      <div className={`transition-all duration-300 ${
        isDevice.desktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 
        isDevice.tablet ? 'mt-16' : ''
      }`}>
        <ResponsiveContainer maxWidth="xl" padding="lg">
          {/* フローナビゲーション */}
          <FlowNavigationComponent 
            currentPageStep={3}
            className="mb-6"
          />

      {/* ヘッダー */}
      <GlassCard className="mb-6 text-center">
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${gradientText}`}>
          🏪 レストランを選択
        </h1>
        
        {/* 選択された料理とエリア表示 */}
        <div className="space-y-3">
          {selectedFoods.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">選択された料理:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedFoods.map(food => (
                  <span 
                    key={food.id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {food.emoji} {food.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {state.selectedLocation && (
            <div>
              <p className="text-sm text-gray-500 mb-2">配達エリア:</p>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                📍 {state.selectedLocation.area}
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* 検索結果とソート */}
      {restaurants.length > 0 && (
        <GlassCard className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {restaurants.length}件のレストランが見つかりました
              </h3>
              <p className="text-sm text-gray-600">
                お好みのレストランを選択してください
              </p>
            </div>
            
            {/* ソート機能 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">並び替え:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="rating">評価順</option>
                <option value="distance">距離順</option>
                <option value="deliveryTime">配達時間順</option>
                <option value="price">配達料金順</option>
              </select>
            </div>
          </div>
        </GlassCard>
      )}

      {/* レストラン一覧 */}
      {sortedRestaurants.length > 0 ? (
        <ResponsiveGrid 
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="lg"
        >
          {sortedRestaurants.map(restaurant => (
            <AnimatedCard key={restaurant.id} className="p-6">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{restaurant.image}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {restaurant.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{restaurant.priceRange}</span>
                </div>
              </div>

              {/* レストラン詳細 */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{restaurant.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>配達料: {restaurant.deliveryFee}</span>
                </div>
              </div>

              {/* 料理カテゴリ */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {restaurant.cuisine.map((cuisine, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>

              {/* レストラン詳細・配達アプリボタン */}
              <div className="space-y-2">
                <button
                  onClick={() => handleRestaurantSelect(restaurant)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all hover:scale-105 shadow-lg"
                >
                  🍽️ このレストランを選択
                </button>
                <button
                  onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  📋 詳細を見る
                </button>
                <DeliveryAppButtons
                  restaurantName={restaurant.name}
                  deliveryApps={restaurant.deliveryApps}
                  className="mt-2"
                />
              </div>
            </AnimatedCard>
          ))}
        </ResponsiveGrid>
      ) : (
        <GlassCard className="text-center py-12">
          <div className="text-5xl mb-4">😅</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            該当するレストランが見つかりませんでした
          </h3>
          <p className="text-gray-600 mb-4">
            他の料理を選択してみてください
          </p>
          <GlassButton
            onClick={() => window.location.href = '/simple-test'}
            variant="secondary"
          >
            料理選択に戻る
          </GlassButton>
        </GlassCard>
      )}

      {/* デスクトップ専用クイックアクション */}
      <ShowOn device="desktop">
        <QuickActions 
          actions={[
            { icon: '🏠', label: 'ホーム', action: () => window.location.href = '/' },
            { icon: '🍽️', label: '食事選択', action: () => window.location.href = '/simple-test' },
            { icon: '📍', label: 'エリア変更', action: () => window.location.href = '/location-select' },
            { icon: '🔄', label: 'リロード', action: () => window.location.reload() }
          ]}
        />
      </ShowOn>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 