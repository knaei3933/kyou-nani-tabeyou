// Google Places API統合ライブラリ

// レストランデータの型定義
export interface GoogleRestaurant {
  place_id: string;
  name: string;
  rating: number;
  price_level?: number;
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

// Places API検索パラメータ
interface SearchParams {
  location: string; // "35.6762,139.6503" (lat,lng)
  radius?: number;  // メートル（デフォルト: 3000m）
  keyword?: string; // 検索キーワード
  type?: string;    // "restaurant"
  language?: string; // "ja"
}

// Google Places API呼び出し関数
export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 周辺レストラン検索
  async searchNearbyRestaurants(params: SearchParams): Promise<GoogleRestaurant[]> {
    try {
      const {
        location,
        radius = 3000,
        keyword = '',
        type = 'restaurant',
        language = 'ja'
      } = params;

      const url = `${this.baseUrl}/nearbysearch/json?` +
        `location=${location}&` +
        `radius=${radius}&` +
        `type=${type}&` +
        `keyword=${keyword}&` +
        `language=${language}&` +
        `key=${this.apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API status: ${data.status}`);
      }

      return data.results || [];
    } catch (error) {
      console.error('Google Places API検索エラー:', error);
      throw error;
    }
  }

  // レストラン詳細情報取得
  async getRestaurantDetails(placeId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/details/json?` +
        `place_id=${placeId}&` +
        `fields=name,rating,formatted_phone_number,website,opening_hours,photos,reviews&` +
        `language=ja&` +
        `key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Place Details API status: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('レストラン詳細取得エラー:', error);
      throw error;
    }
  }

  // 写真URL生成
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${this.baseUrl}/photo?` +
      `maxwidth=${maxWidth}&` +
      `photo_reference=${photoReference}&` +
      `key=${this.apiKey}`;
  }
}

// レストランデータ変換関数
export const convertToRestaurantData = (googleRestaurant: GoogleRestaurant) => {
  return {
    id: googleRestaurant.place_id,
    name: googleRestaurant.name,
    rating: googleRestaurant.rating || 0,
    priceRange: getPriceRangeText(googleRestaurant.price_level),
    cuisine: extractCuisineTypes(googleRestaurant.types),
    distance: '取得中...',
    deliveryTime: '30-45分', // 仮の値
    deliveryFee: '200円',    // 仮の値
    image: getRestaurantEmoji(googleRestaurant.types),
    location: googleRestaurant.geometry.location,
    vicinity: googleRestaurant.vicinity,
    isOpen: googleRestaurant.opening_hours?.open_now || false,
    photos: googleRestaurant.photos || [],
    deliveryApps: {
      // 後で配達アプリIDマッピング
      ubereats: `search-${encodeURIComponent(googleRestaurant.name)}`,
      demaekan: `search-${encodeURIComponent(googleRestaurant.name)}`
    }
  };
};

// 価格帯テキスト変換
const getPriceRangeText = (priceLevel?: number): string => {
  switch (priceLevel) {
    case 1: return '500-1000円';
    case 2: return '1000-2000円';
    case 3: return '2000-4000円';
    case 4: return '4000円以上';
    default: return '価格未設定';
  }
};

// 料理タイプ抽出
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

  return types
    .filter(type => cuisineMap[type])
    .map(type => cuisineMap[type])
    .slice(0, 3); // 最大3つまで
};

// レストラン絵文字取得
const getRestaurantEmoji = (types: string[]): string => {
  if (types.includes('bakery')) return '🥖';
  if (types.includes('cafe')) return '☕';
  if (types.includes('bar')) return '🍺';
  if (types.includes('meal_takeaway')) return '🥡';
  return '🍽️'; // デフォルト
};

// ユーザー位置取得
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // エラー時は渋谷駅の座標を返す
        console.warn('位置情報取得失敗、渋谷駅を使用:', error);
        resolve({
          lat: 35.6580,  // 渋谷駅
          lng: 139.7016
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分間キャッシュ
      }
    );
  });
};

// API키 검증 함수
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const service = new GooglePlacesService(apiKey);
    // 간단한 테스트 요청
    await service.searchNearbyRestaurants({
      location: '35.6580,139.7016', // 渋谷駅
      radius: 1000,
      keyword: 'restaurant'
    });
    return true;
  } catch (error) {
    console.error('API키 검증 실패:', error);
    return false;
  }
}; 