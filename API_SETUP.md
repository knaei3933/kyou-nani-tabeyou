# Google Places API 設定ガイド

## 📋 概要
「今日何食べよう」で実際のレストランデータを取得するためのGoogle Places API設定

## 🔧 設定手順

### 1. Google Cloud Console設定
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Places API を有効化

### 2. API키취득・設定  
1. 認証情報でAPIキー生成
2. プロジェクトルートに `.env.local` 作成:
```env
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

### 3. 費用予想
- **フェーズ1A**: $25-50/월 (100-200 사용자)
- **フェーズ1B**: $50-100/월 (200-500 사용자)  
- **완전 서비스**: $150-300/월 (1,000+ 사용자)

## 🎯 実装완료 기능

### ✅ 완료
- API통합 라이브러리 (`src/lib/googlePlaces.ts`)
- 서버사이드 API (`/api/restaurants/search`)
- 데모 모드 (API키 없이도 작동)
- 위치정보 기반 검색
- 실제 Places 데이터 연동

### 🔄 다음 단계  
- 실제 API키 설정
- 프로덕션 배포 테스트
- 캐싱 시스템 구현

## 🚀 테스트 방법
```bash
# 현재 데모 모드로 테스트 가능
npm run dev
# /simple-test → /result에서 Google Places 데이터 확인
``` 