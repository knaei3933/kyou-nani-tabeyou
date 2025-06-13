# 🔧 技術仕様書

> **注意**: このファイルは廃止予定です。最新情報は [README.md](./README.md) を参照してください。

## 現在の技術スタック

### フロントエンド
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- PWA (Service Worker + Manifest)

### データ・API統合
```typescript
// Google Places API統合予定
interface RestaurantData {
  place_id: string;
  name: string;
  rating: number;
  location: { lat: number; lng: number };
  deliveryApps: {
    ubereats?: string;
    demaekan?: string;
  }
}
```

### 配布・運用
- Vercel (本番環境)
- カスタムドメイン対応
- 自動配布システム

## 実装優先順位

### Phase 1A: Google Places API
```bash
npm install @googlemaps/google-maps-services-js
```

### Phase 1B: ディープリンク
```typescript
const openDeliveryApp = (restaurant: RestaurantData, app: string) => {
  const url = `https://www.${app}.com/jp/store/${restaurant.deliveryApps[app]}`;
  window.open(url, '_blank');
};
```

---

**このファイルは今後削除予定です。詳細は [README.md](./README.md) を参照してください。** 