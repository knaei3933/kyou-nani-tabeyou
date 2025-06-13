// パイロットレストランデータベース
// 渋谷・新宿エリアの主要レストラン50店舗

export interface PilotRestaurant {
  id: string;
  name: string;
  nameEn?: string;
  category: string[];
  rating: number;
  priceLevel: number; // 1-4
  area: '渋谷' | '新宿' | '恵比寿' | '原宿' | '表参道';
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  openingHours: {
    weekday: string;
    weekend: string;
  };
  specialties: string[];
  deliveryApps: {
    ubereats?: string;
    demaekan?: string;
    wolt?: string;
    menugo?: string;
    foodpanda?: string;
  };
  phoneNumber?: string;
  website?: string;
  isPopular: boolean;
  tags: string[];
}

export const PILOT_RESTAURANTS: PilotRestaurant[] = [
  // === 渋谷エリア ===
  {
    id: 'shibuya-ramen-001',
    name: 'ラーメン一蘭 渋谷店',
    nameEn: 'Ichiran Ramen Shibuya',
    category: ['ラーメン', '豚骨'],
    rating: 4.1,
    priceLevel: 2,
    area: '渋谷',
    address: '東京都渋谷区渋谷1-22-7',
    location: { lat: 35.6580, lng: 139.7016 },
    openingHours: {
      weekday: '24時間営業',
      weekend: '24時間営業'
    },
    specialties: ['とんこつラーメン', '替え玉', 'チャーシュー'],
    deliveryApps: {
      ubereats: 'ichiran-shibuya-tokyo',
      demaekan: 'ramen-ichiran-shibuya',
      wolt: 'ichiran-ramen-shibuya'
    },
    isPopular: true,
    tags: ['24時間', '人気', 'チェーン']
  },
  {
    id: 'shibuya-sushi-001',
    name: '寿司 銀座 渋谷店',
    category: ['寿司', '和食'],
    rating: 4.3,
    priceLevel: 3,
    area: '渋谷',
    address: '東京都渋谷区渋谷2-9-10',
    location: { lat: 35.6581, lng: 139.7014 },
    openingHours: {
      weekday: '11:30-14:00, 17:30-22:00',
      weekend: '11:30-22:00'
    },
    specialties: ['江戸前寿司', '刺身盛り合わせ', '特選握り'],
    deliveryApps: {
      ubereats: 'sushi-ginza-shibuya',
      demaekan: 'ginza-sushi-shibuya'
    },
    isPopular: true,
    tags: ['高級', '江戸前', '接待']
  },
  {
    id: 'shibuya-pizza-001',
    name: 'Pizza Studio TAMAKI 渋谷',
    category: ['ピザ', 'イタリアン'],
    rating: 4.0,
    priceLevel: 2,
    area: '渋谷',
    address: '東京都渋谷区道玄坂1-5-3',
    location: { lat: 35.6593, lng: 139.6986 },
    openingHours: {
      weekday: '11:00-23:00',
      weekend: '11:00-24:00'
    },
    specialties: ['マルゲリータ', 'クアトロフォルマッジ', 'カルボナーラピザ'],
    deliveryApps: {
      ubereats: 'pizza-tamaki-shibuya',
      demaekan: 'tamaki-pizza-shibuya',
      wolt: 'pizza-studio-tamaki'
    },
    isPopular: false,
    tags: ['本格', '石窯', 'デート']
  },
  {
    id: 'shibuya-korean-001',
    name: '韓国料理 オンギージョンギー 渋谷',
    category: ['韓国料理', 'アジア'],
    rating: 4.2,
    priceLevel: 2,
    area: '渋谷',
    address: '東京都渋谷区宇田川町13-11',
    location: { lat: 35.6617, lng: 139.6988 },
    openingHours: {
      weekday: '11:30-15:00, 17:00-23:00',
      weekend: '11:30-23:00'
    },
    specialties: ['サムギョプサル', 'キムチチゲ', 'ビビンバ'],
    deliveryApps: {
      ubereats: 'korean-onggi-shibuya',
      demaekan: 'onggi-korean-shibuya'
    },
    isPopular: true,
    tags: ['本場', '辛い', '女子会']
  },
  {
    id: 'shibuya-chinese-001',
    name: '中華料理 龍鳳 渋谷本店',
    category: ['中華', 'アジア'],
    rating: 3.9,
    priceLevel: 2,
    area: '渋谷',
    address: '東京都渋谷区円山町5-18',
    location: { lat: 35.6553, lng: 139.6983 },
    openingHours: {
      weekday: '11:00-15:00, 17:00-22:30',
      weekend: '11:00-22:30'
    },
    specialties: ['麻婆豆腐', '回鍋肉', '餃子'],
    deliveryApps: {
      ubereats: 'chinese-ryuho-shibuya',
      demaekan: 'ryuho-chinese-shibuya',
      menugo: 'ryuho-shibuya'
    },
    isPopular: false,
    tags: ['老舗', '家庭的', '量多い']
  },

  // === 新宿エリア ===
  {
    id: 'shinjuku-ramen-001',
    name: 'めん徳 新宿本店',
    nameEn: 'Mentoku Shinjuku',
    category: ['ラーメン', '味噌'],
    rating: 4.4,
    priceLevel: 2,
    area: '新宿',
    address: '東京都新宿区歌舞伎町1-6-2',
    location: { lat: 35.6938, lng: 139.7034 },
    openingHours: {
      weekday: '11:00-15:00, 18:00-03:00',
      weekend: '11:00-03:00'
    },
    specialties: ['味噌ラーメン', 'つけ麺', '焼き餃子'],
    deliveryApps: {
      ubereats: 'mentoku-shinjuku-main',
      demaekan: 'mentoku-ramen-shinjuku',
      wolt: 'mentoku-shinjuku'
    },
    isPopular: true,
    tags: ['深夜営業', '濃厚', '歌舞伎町']
  },
  {
    id: 'shinjuku-yakitori-001',
    name: '鳥貴族 新宿東口店',
    category: ['焼き鳥', '居酒屋'],
    rating: 4.0,
    priceLevel: 1,
    area: '新宿',
    address: '東京都新宿区新宿3-26-13',
    location: { lat: 35.6896, lng: 139.7006 },
    openingHours: {
      weekday: '17:00-01:00',
      weekend: '16:00-01:00'
    },
    specialties: ['焼き鳥', 'ハイボール', 'もも貴族焼き'],
    deliveryApps: {
      ubereats: 'torikizoku-shinjuku-east',
      demaekan: 'torikizoku-shinjuku'
    },
    isPopular: true,
    tags: ['安い', 'チェーン', '飲み']
  },
  {
    id: 'shinjuku-indian-001',
    name: 'インド料理 ムンバイ 新宿店',
    category: ['インド料理', 'カレー'],
    rating: 4.1,
    priceLevel: 2,
    area: '新宿',
    address: '東京都新宿区新宿3-17-4',
    location: { lat: 35.6911, lng: 139.7043 },
    openingHours: {
      weekday: '11:00-15:00, 17:00-22:30',
      weekend: '11:00-22:30'
    },
    specialties: ['バターチキンカレー', 'ナン', 'タンドリーチキン'],
    deliveryApps: {
      ubereats: 'mumbai-indian-shinjuku',
      demaekan: 'mumbai-curry-shinjuku',
      foodpanda: 'mumbai-shinjuku'
    },
    isPopular: false,
    tags: ['本格', '辛い', 'ナン食べ放題']
  },
  {
    id: 'shinjuku-sushi-001',
    name: '回転寿司 根室花まる 新宿店',
    category: ['寿司', '回転寿司'],     
    rating: 4.2,
    priceLevel: 2,
    area: '新宿',
    address: '東京都新宿区新宿3-38-2',
    location: { lat: 35.6889, lng: 139.7048 },
    openingHours: {
      weekday: '11:00-22:00',
      weekend: '10:30-22:00'
    },
    specialties: ['海鮮丼', 'いくら', '中トロ'],
    deliveryApps: {
      ubereats: 'hanamaru-sushi-shinjuku',
      demaekan: 'hanamaru-shinjuku'
    },
    isPopular: true,
    tags: ['新鮮', '北海道', '行列']
  },
  {
    id: 'shinjuku-thai-001',
    name: 'タイ料理 バンコク食堂 新宿',
    category: ['タイ料理', 'アジア'],
    rating: 4.0,
    priceLevel: 2,
    area: '新宿',
    address: '東京都新宿区歌舞伎町2-19-15',
    location: { lat: 35.6965, lng: 139.7065 },
    openingHours: {
      weekday: '11:30-15:00, 17:30-23:00',
      weekend: '11:30-23:00'
    },
    specialties: ['パッタイ', 'トムヤムクン', 'ガパオライス'],
    deliveryApps: {
      ubereats: 'bangkok-thai-shinjuku',
      wolt: 'bangkok-shinjuku'
    },
    isPopular: false,
    tags: ['本場', '辛い', 'アジアン']
  },

  // === 恵比寿エリア ===
  {
    id: 'ebisu-french-001',
    name: 'ビストロ・ド・エビス',
    category: ['フレンチ', '洋食'],
    rating: 4.5,
    priceLevel: 3,
    area: '恵比寿',
    address: '東京都渋谷区恵比寿1-9-7',
    location: { lat: 35.6465, lng: 139.7100 },
    openingHours: {
      weekday: '11:30-14:30, 18:00-22:00',
      weekend: '11:30-22:00'
    },
    specialties: ['コース料理', 'ワイン', 'フォアグラ'],
    deliveryApps: {
      ubereats: 'bistro-ebisu-french'
    },
    isPopular: true,
    tags: ['高級', 'デート', 'ワイン']
  },
  {
    id: 'ebisu-yakiniku-001',
    name: '焼肉 牛角 恵比寿店',
    category: ['焼肉', '韓国料理'],
    rating: 4.1,
    priceLevel: 2,
    area: '恵比寿',
    address: '東京都渋谷区恵比寿1-11-2',
    location: { lat: 35.6470, lng: 139.7095 },
    openingHours: {
      weekday: '17:00-24:00',
      weekend: '16:00-24:00'
    },
    specialties: ['カルビ', 'ハラミ', 'ビビンバ'],
    deliveryApps: {
      ubereats: 'gyukaku-ebisu-yakiniku',
      demaekan: 'gyukaku-ebisu'
    },
    isPopular: true,
    tags: ['チェーン', '焼肉', '飲み放題']
  },
  {
    id: 'ebisu-cafe-001',
    name: 'カフェ・ド・恵比寿',
    category: ['カフェ', 'スイーツ'],
    rating: 4.3,
    priceLevel: 2,
    area: '恵比寿',
    address: '東京都渋谷区恵比寿西1-4-1',
    location: { lat: 35.6445, lng: 139.7079 },
    openingHours: {
      weekday: '07:00-21:00',
      weekend: '08:00-22:00'
    },
    specialties: ['パンケーキ', 'コーヒー', 'フルーツタルト'],
    deliveryApps: {
      ubereats: 'cafe-ebisu-pancake',
      wolt: 'cafe-ebisu'
    },
    isPopular: false,
    tags: ['朝営業', 'スイーツ', 'パンケーキ']
  }
];

// 지역별 레스토랑 필터링 함수
export const getRestaurantsByArea = (area: string): PilotRestaurant[] => {
  return PILOT_RESTAURANTS.filter(restaurant => restaurant.area === area);
};

// 카테고리별 레스토랑 필터링 함수
export const getRestaurantsByCategory = (category: string): PilotRestaurant[] => {
  return PILOT_RESTAURANTS.filter(restaurant => 
    restaurant.category.some(cat => cat.includes(category))
  );
};

// 인기 레스토랑 필터링 함수
export const getPopularRestaurants = (): PilotRestaurant[] => {
  return PILOT_RESTAURANTS.filter(restaurant => restaurant.isPopular);
};

// 배달앱별 레스토랑 필터링 함수
export const getRestaurantsByDeliveryApp = (appName: keyof PilotRestaurant['deliveryApps']): PilotRestaurant[] => {
  return PILOT_RESTAURANTS.filter(restaurant => restaurant.deliveryApps[appName]);
};

// 거리 계산 함수 (하버사인 공식)
export const calculateDistanceFromUser = (
  userLat: number, 
  userLng: number, 
  restaurant: PilotRestaurant
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (restaurant.location.lat - userLat) * Math.PI / 180;
  const dLng = (restaurant.location.lng - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(restaurant.location.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 소수점 첫째자리까지
};

// 음식 키워드로 레스토랑 검색
export const searchRestaurantsByFood = (foodKeywords: string[]): PilotRestaurant[] => {
  const results: PilotRestaurant[] = [];
  
  foodKeywords.forEach(keyword => {
    const matchingRestaurants = PILOT_RESTAURANTS.filter(restaurant => 
      restaurant.category.some(cat => cat.includes(keyword)) ||
      restaurant.specialties.some(spec => spec.includes(keyword)) ||
      restaurant.name.includes(keyword) ||
      restaurant.tags.some(tag => tag.includes(keyword))
    );
    results.push(...matchingRestaurants);
  });
  
  // 중복 제거
  const uniqueResults = results.filter((restaurant, index, self) => 
    index === self.findIndex(r => r.id === restaurant.id)
  );
  
  return uniqueResults;
}; 