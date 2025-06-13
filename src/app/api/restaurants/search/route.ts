import { NextRequest, NextResponse } from 'next/server';
import { 
  PILOT_RESTAURANTS, 
  searchRestaurantsByFood, 
  calculateDistanceFromUser,
  generateDeliveryAppLink 
} from '@/data/restaurants';

// Google Places API サーバーサイド呼び出し
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const location = searchParams.get('location');
    const keyword = searchParams.get('keyword') || '';
    const radius = searchParams.get('radius') || '3000';
    
    if (!location) {
      return NextResponse.json(
        { error: '位置情報が必要です' },
        { status: 400 }
      );
    }

    // 環境変数からAPI키取得 (나중에 설정)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || 'demo_mode';
    
    if (apiKey === 'demo_mode') {
      // デモモード: パイロットレストランデータを使用
      const foodKeywords = keyword ? keyword.split(' ') : [];
      let restaurants = foodKeywords.length > 0 
        ? searchRestaurantsByFood(foodKeywords)
        : PILOT_RESTAURANTS.slice(0, 10); // 最大10件
      
      // ユーザー位置情報がある場合は距離計算
      if (location) {
        const [lat, lng] = location.split(',').map(Number);
        restaurants = restaurants.map(restaurant => ({
          ...restaurant,
          distance: calculateDistanceFromUser(lat, lng, restaurant)
        }));
        
        // 距離順にソート
        restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
      
      // Google Places API形式に変換
      const convertedResults = restaurants.map(restaurant => ({
        place_id: restaurant.id,
        name: restaurant.name,
        rating: restaurant.rating,
        price_level: restaurant.priceLevel,
        vicinity: restaurant.address,
        types: ['restaurant', ...restaurant.category.map(c => c.toLowerCase())],
        geometry: {
          location: restaurant.location
        },
        opening_hours: {
          open_now: isRestaurantOpen(restaurant)
        },
        deliveryApps: restaurant.deliveryApps
      }));
      
      return NextResponse.json({
        results: convertedResults,
        status: 'OK',
        pilot_mode: true
      });
    }

    // 実际 Google Places API 호출
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const url = `${baseUrl}?` +
      `location=${location}&` +
      `radius=${radius}&` +
      `type=restaurant&` +
      `keyword=${keyword}&` +
      `language=ja&` +
      `key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('レストラン検索API エラー:', error);
    return NextResponse.json(
      { error: 'レストラン検索に失敗しました' },
      { status: 500 }
    );
  }
}

// レストランの営業状況確認（簡易版）
function isRestaurantOpen(restaurant: any): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // 24時間営業の場合
  if (restaurant.openingHours?.weekday?.includes('24時間') || 
      restaurant.openingHours?.weekend?.includes('24時間')) {
    return true;
  }
  
  // 一般的な営業時間 (11:00-22:00)
  if (hour >= 11 && hour <= 22) {
    return true;
  }
  
  // 深夜営業の場合
  if (restaurant.tags?.includes('深夜営業') && hour >= 18) {
    return true;
  }
  
  return false;
}

// デモ用サンプルデータ
function getDemoRestaurants(keyword: string) {
  const allRestaurants = [
    {
      place_id: 'demo-ramen-1',
      name: 'ラーメン太郎 渋谷店',
      rating: 4.2,
      price_level: 2,
      vicinity: '渋谷区渋谷2-1-1',
      types: ['restaurant', 'food', 'establishment'],
      geometry: {
        location: { lat: 35.6580, lng: 139.7016 }
      },
      opening_hours: { open_now: true },
      photos: [{
        photo_reference: 'demo-photo-1',
        height: 400,
        width: 600
      }]
    },
    {
      place_id: 'demo-sushi-1',
      name: '寿司源 本店',
      rating: 4.5,
      price_level: 3,
      vicinity: '渋谷区恵比寿1-2-3',
      types: ['restaurant', 'food', 'establishment'],
      geometry: {
        location: { lat: 35.6465, lng: 139.7100 }
      },
      opening_hours: { open_now: true }
    },
    {
      place_id: 'demo-pizza-1',
      name: 'Pizza House マリオ',
      rating: 4.0,
      price_level: 2,
      vicinity: '新宿区新宿3-1-1',
      types: ['restaurant', 'meal_delivery', 'establishment'],
      geometry: {
        location: { lat: 35.6896, lng: 139.7006 }
      },
      opening_hours: { open_now: false }
    },
    {
      place_id: 'demo-cafe-1',
      name: 'Coffee & Cake 카페마루',
      rating: 4.3,
      price_level: 1,
      vicinity: '渋谷区表参道1-1-1',
      types: ['cafe', 'bakery', 'establishment'],
      geometry: {
        location: { lat: 35.6654, lng: 139.7126 }
      },
      opening_hours: { open_now: true }
    },
    {
      place_id: 'demo-korean-1',
      name: '韓国料理 プルコギハウス',
      rating: 4.1,
      price_level: 2,
      vicinity: '新宿区大久保2-2-2',
      types: ['restaurant', 'food', 'establishment'],
      geometry: {
        location: { lat: 35.7009, lng: 139.7015 }
      },
      opening_hours: { open_now: true }
    },
    {
      place_id: 'demo-chinese-1',
      name: '中華料理 龍鳳',
      rating: 3.9,
      price_level: 2,
      vicinity: '渋谷区円山町1-1-1',
      types: ['restaurant', 'meal_takeaway', 'establishment'],
      geometry: {
        location: { lat: 35.6553, lng: 139.6983 }
      },
      opening_hours: { open_now: true }
    }
  ];

  // キーワードでフィルタリング
  if (keyword.trim()) {
    const filtered = allRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(keyword.toLowerCase()) ||
      restaurant.vicinity.includes(keyword)
    );
    return filtered.length > 0 ? filtered : allRestaurants.slice(0, 3);
  }

  return allRestaurants;
}

// CORS 헤더 설정
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 