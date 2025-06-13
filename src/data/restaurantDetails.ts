// レストラン詳細情報データ

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  allergens?: string[];
  spicyLevel?: number; // 1-5
}

export interface RestaurantReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface DeliveryInfo {
  fee: number;
  minOrder: number;
  estimatedTime: string;
  freeDeliveryThreshold?: number;
  serviceArea: string[];
}

export interface RestaurantDetail {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  cuisine: string[];
  address: string;
  phoneNumber: string;
  openingHours: {
    weekday: string;
    weekend: string;
  };
  images: string[];
  menu: MenuItem[];
  reviews: RestaurantReview[];
  deliveryInfo: DeliveryInfo;
  features: string[];
  tags: string[];
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

// 샘플 레스토랑 상세 정보
export const RESTAURANT_DETAILS: Record<string, RestaurantDetail> = {
  'shibuya-ramen-001': {
    id: 'shibuya-ramen-001',
    name: 'ラーメン一蘭 渋谷店',
    description: '創業以来変わらない味！とんこつラーメン専門店。一人一人のお客様に最高の一杯をお届けします。',
    rating: 4.2,
    reviewCount: 1847,
    priceRange: '800-1200円',
    cuisine: ['ラーメン', '豚骨', '餃子'],
    address: '東京都渋谷区渋谷1-22-7',
    phoneNumber: '03-1234-5678',
    openingHours: {
      weekday: '24時間営業',
      weekend: '24時間営業'
    },
    images: ['🍜', '🏪', '🍥'],
    menu: [
      {
        id: 'ramen-tonkotsu',
        name: 'とんこつラーメン',
        description: '濃厚豚骨スープと細ストレート麺の絶妙なバランス',
        price: 890,
        category: 'ラーメン',
        isPopular: true,
        isRecommended: true
      },
      {
        id: 'ramen-karaka',
        name: 'からか麺（辛さ3倍）',
        description: '辛党の方におすすめ！特製辛味ダレ入り',
        price: 990,
        category: 'ラーメン',
        spicyLevel: 4,
        isPopular: true
      },
      {
        id: 'gyoza',
        name: '焼き餃子（5個）',
        description: 'ジューシーな豚肉と野菜のハーモニー',
        price: 290,
        category: 'サイド',
        isRecommended: true
      },
      {
        id: 'kaedama',
        name: '替え玉',
        description: '追加の麺でお腹いっぱい',
        price: 190,
        category: '追加'
      },
      {
        id: 'chashu',
        name: 'チャーシュー追加',
        description: '厚切りジューシーチャーシュー3枚',
        price: 290,
        category: '追加'
      }
    ],
    reviews: [
      {
        id: 'review-1',
        userName: '田中太郎',
        rating: 5,
        comment: '深夜でも美味しいラーメンが食べられて最高！スープが濃厚でクセになる味です。',
        date: '2024-12-08',
        helpful: 12
      },
      {
        id: 'review-2',
        userName: 'ラーメン好き',
        rating: 4,
        comment: '一蘭は安定の美味しさ。替え玉も必須です！',
        date: '2024-12-07',
        helpful: 8
      },
      {
        id: 'review-3',
        userName: '佐藤花子',
        rating: 4,
        comment: '辛いからか麺がおすすめ。でも本当に辛いので注意！',
        date: '2024-12-06',
        helpful: 15
      }
    ],
    deliveryInfo: {
      fee: 200,
      minOrder: 1000,
      estimatedTime: '25-35分',
      freeDeliveryThreshold: 2000,
      serviceArea: ['渋谷区', '新宿区', '港区']
    },
    features: ['24時間営業', '一人席あり', 'テイクアウト可'],
    tags: ['深夜', '人気', 'チェーン', '濃厚']
  },

  'shibuya-pizza-001': {
    id: 'shibuya-pizza-001',
    name: 'Pizza Studio TAMAKI 渋谷',
    description: '本格石窯焼きピザ！イタリア産の厳選素材を使用した本場の味をお楽しみください。',
    rating: 4.0,
    reviewCount: 432,
    priceRange: '1200-2500円',
    cuisine: ['ピザ', 'イタリアン', 'パスタ'],
    address: '東京都渋谷区道玄坂1-5-3',
    phoneNumber: '03-5678-9012',
    openingHours: {
      weekday: '11:00-23:00',
      weekend: '11:00-24:00'
    },
    images: ['🍕', '🔥', '🧀'],
    menu: [
      {
        id: 'margherita',
        name: 'マルゲリータ',
        description: 'トマト、モッツァレラ、バジルのシンプルイズベスト',
        price: 1480,
        category: 'ピザ',
        isRecommended: true,
        isPopular: true
      },
      {
        id: 'quattro-formaggi',
        name: 'クアトロフォルマッジ',
        description: '4種類のチーズの豊かな風味',
        price: 1890,
        category: 'ピザ',
        isPopular: true
      },
      {
        id: 'carbonara-pizza',
        name: 'カルボナーラピザ',
        description: 'クリーミーなカルボナーラソースベース',
        price: 1690,
        category: 'ピザ'
      },
      {
        id: 'caesar-salad',
        name: 'シーザーサラダ',
        description: '新鮮野菜とパルメザンチーズ',
        price: 780,
        category: 'サラダ'
      }
    ],
    reviews: [
      {
        id: 'review-1',
        userName: 'イタリア好き',
        rating: 5,
        comment: '本当に美味しい！石窯で焼いたピザは格別です。',
        date: '2024-12-08',
        helpful: 9
      },
      {
        id: 'review-2',
        userName: '山田次郎',
        rating: 4,
        comment: 'チーズがとろとろで美味しかった。また注文したい。',
        date: '2024-12-07',
        helpful: 6
      }
    ],
    deliveryInfo: {
      fee: 300,
      minOrder: 1500,
      estimatedTime: '30-40분',
      freeDeliveryThreshold: 3000,
      serviceArea: ['渋谷区', '目黒区']
    },
    features: ['石窯焼き', '本格イタリアン', '手作り生地'],
    tags: ['デート', '本格', '石窯']
  },

  'shibuya-sushi-001': {
    id: 'shibuya-sushi-001',
    name: '寿司 銀座 渋谷店',
    description: '江戸前寿司の伝統を守り続ける老舗。新鮮なネタと職人の技をご堪能ください。',
    rating: 4.3,
    reviewCount: 689,
    priceRange: '2000-5000円',
    cuisine: ['寿司', '和食', '刺身'],
    address: '東京都渋谷区渋谷2-9-10',
    phoneNumber: '03-9012-3456',
    openingHours: {
      weekday: '11:30-14:00, 17:30-22:00',
      weekend: '11:30-22:00'
    },
    images: ['🍣', '🐟', '🍶'],
    menu: [
      {
        id: 'nigiri-set',
        name: '特選握り10貫セット',
        description: '厳選されたネタの握り寿司10貫',
        price: 2800,
        category: 'セット',
        isRecommended: true,
        isPopular: true
      },
      {
        id: 'sashimi-mori',
        name: '刺身盛り合わせ',
        description: '新鮮な刺身の盛り合わせ',
        price: 1980,
        category: '刺身',
        isPopular: true
      },
      {
        id: 'chirashi',
        name: 'ちらし丼',
        description: '新鮮な海鮮がたっぷりの丼',
        price: 1680,
        category: '丼'
      },
      {
        id: 'miso-soup',
        name: '味噌汁',
        description: '具沢山の味噌汁',
        price: 180,
        category: '汁物'
      }
    ],
    reviews: [
      {
        id: 'review-1',
        userName: '寿司通',
        rating: 5,
        comment: 'ネタが新鮮で職人さんの技術も素晴らしい！',
        date: '2024-12-08',
        helpful: 20
      },
      {
        id: 'review-2',
        userName: '和食好き',
        rating: 4,
        comment: '値段相応の美味しさ。特選握りがおすすめです。',
        date: '2024-12-07',
        helpful: 11
      }
    ],
    deliveryInfo: {
      fee: 400,
      minOrder: 2000,
      estimatedTime: '40-50분',
      freeDeliveryThreshold: 5000,
      serviceArea: ['渋谷区', '港区', '中央区']
    },
    features: ['江戸前寿司', '職人手作り', '新鮮ネタ'],
    tags: ['高級', '江戸前', '接待', '新鮮']
  }
};

// 레스토랑 상세 정보 검색
export const getRestaurantDetail = (restaurantId: string): RestaurantDetail | null => {
  return RESTAURANT_DETAILS[restaurantId] || null;
};

// 메뉴 카테고리별 분류
export const getMenuByCategory = (menu: MenuItem[]): Record<string, MenuItem[]> => {
  return menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

// 추천 메뉴 가져오기
export const getRecommendedMenu = (menu: MenuItem[]): MenuItem[] => {
  return menu.filter(item => item.isRecommended);
};

// 인기 메뉴 가져오기  
export const getPopularMenu = (menu: MenuItem[]): MenuItem[] => {
  return menu.filter(item => item.isPopular);
}; 