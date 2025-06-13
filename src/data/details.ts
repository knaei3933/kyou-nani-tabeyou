// レストラン詳細情報

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export interface RestaurantReview {
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RestaurantDetail {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  menu: MenuItem[];
  reviews: RestaurantReview[];
  deliveryInfo: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
}

export const RESTAURANT_DETAILS: Record<string, RestaurantDetail> = {
  'shibuya-ramen-001': {
    id: 'shibuya-ramen-001',
    name: 'ラーメン一蘭 渋谷店',
    description: '創業以来変わらない味！とんこつラーメン専門店',
    rating: 4.2,
    reviewCount: 1847,
    menu: [
      {
        id: 'ramen-tonkotsu',
        name: 'とんこつラーメン',
        description: '濃厚豚骨スープと細ストレート麺',
        price: 890,
        category: 'ラーメン',
        isPopular: true,
        isRecommended: true
      },
      {
        id: 'ramen-karaka',
        name: 'からか麺（辛さ3倍）',
        description: '辛党の方におすすめ！',
        price: 990,
        category: 'ラーメン',
        isPopular: true
      },
      {
        id: 'gyoza',
        name: '焼き餃子（5個）',
        description: 'ジューシーな豚肉と野菜',
        price: 290,
        category: 'サイド',
        isRecommended: true
      }
    ],
    reviews: [
      {
        userName: '田中太郎',
        rating: 5,
        comment: '深夜でも美味しいラーメンが食べられて最高！',
        date: '2024-12-08'
      },
      {
        userName: 'ラーメン好き',
        rating: 4,
        comment: '一蘭は安定の美味しさ。替え玉も必須です！',
        date: '2024-12-07'
      }
    ],
    deliveryInfo: {
      fee: 200,
      minOrder: 1000,
      estimatedTime: '25-35분'
    }
  },

  'shibuya-pizza-001': {
    id: 'shibuya-pizza-001',
    name: 'Pizza Studio TAMAKI 渋谷',
    description: '本格石窯焼きピザ！イタリア産の厳選素材を使用',
    rating: 4.0,
    reviewCount: 432,
    menu: [
      {
        id: 'margherita',
        name: 'マルゲリータ',
        description: 'トマト、モッツァレラ、バジルの定番',
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
        id: 'caesar-salad',
        name: 'シーザーサラダ',
        description: '新鮮野菜とパルメザンチーズ',
        price: 780,
        category: 'サラダ'
      }
    ],
    reviews: [
      {
        userName: 'イタリア好き',
        rating: 5,
        comment: '本当に美味しい！石窯で焼いたピザは格別です。',
        date: '2024-12-08'
      },
      {
        userName: '山田次郎',
        rating: 4,
        comment: 'チーズがとろとろで美味しかった。',
        date: '2024-12-07'
      }
    ],
    deliveryInfo: {
      fee: 300,
      minOrder: 1500,
      estimatedTime: '30-40분'
    }
  },

  'shibuya-sushi-001': {
    id: 'shibuya-sushi-001',
    name: '寿司 銀座 渋谷店',
    description: '江戸前寿司の伝統を守り続ける老舗',
    rating: 4.3,
    reviewCount: 689,
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
      }
    ],
    reviews: [
      {
        userName: '寿司通',
        rating: 5,
        comment: 'ネタが新鮮で職人さんの技術も素晴らしい！',
        date: '2024-12-08'
      },
      {
        userName: '和食好き',
        rating: 4,
        comment: '値段相応の美味しさ。特選握りがおすすめです。',
        date: '2024-12-07'
      }
    ],
    deliveryInfo: {
      fee: 400,
      minOrder: 2000,
      estimatedTime: '40-50분'
    }
  }
}; 