// 配達アプリ直接リンクシステム

export interface DeliveryAppConfig {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  webUrl: string;
  appScheme?: string;
  searchPath: string;
  storePath: string;
  isAvailable: boolean;
}

// 配達アプリ設定
export const DELIVERY_APPS: Record<string, DeliveryAppConfig> = {
  ubereats: {
    name: 'ubereats',
    displayName: 'Uber Eats',
    icon: '🍔',
    color: '#00c851',
    webUrl: 'https://www.ubereats.com',
    appScheme: 'ubereats://',
    searchPath: '/jp/search',
    storePath: '/jp/store',
    isAvailable: true
  },
  demaekan: {
    name: 'demaekan',
    displayName: '出前館',
    icon: '🍜',
    color: '#ff6900',
    webUrl: 'https://demae-can.com',
    appScheme: 'demaecan://',
    searchPath: '/search',
    storePath: '/shop/detail',
    isAvailable: true
  },
  wolt: {
    name: 'wolt',
    displayName: 'Wolt',
    icon: '🚀',
    color: '#009de0',
    webUrl: 'https://wolt.com',
    appScheme: 'wolt://',
    searchPath: '/ja/jpn/tokyo/search',
    storePath: '/ja/jpn/tokyo/restaurant',
    isAvailable: true
  },
  menugo: {
    name: 'menugo',
    displayName: 'menu',
    icon: '📱',
    color: '#ff0066',
    webUrl: 'https://menu.st',
    searchPath: '/search',
    storePath: '/restaurant',
    isAvailable: false // 현재 일본 서비스 종료
  },
  foodpanda: {
    name: 'foodpanda',
    displayName: 'foodpanda',
    icon: '🐼',
    color: '#ff2b85',
    webUrl: 'https://www.foodpanda.co.jp',
    appScheme: 'foodpanda://',
    searchPath: '/search',
    storePath: '/restaurant',
    isAvailable: false // 현재 일본 서비스 종료
  }
};

// 딥링크 생성 함수
export const generateDeliveryLink = (
  appName: string, 
  restaurantId: string, 
  restaurantName: string,
  location?: { lat: number; lng: number }
): string => {
  const app = DELIVERY_APPS[appName];
  if (!app || !app.isAvailable) return '';

  // 레스토랑 ID가 실제 ID인 경우
  if (restaurantId && !restaurantId.startsWith('search-')) {
    return `${app.webUrl}${app.storePath}/${restaurantId}`;
  }

  // 검색 기반 링크 생성
  const searchQuery = encodeURIComponent(restaurantName);
  const baseUrl = app.webUrl;
  
  switch (appName) {
    case 'ubereats':
      return location 
        ? `${baseUrl}/jp/tokyo/search?q=${searchQuery}&lat=${location.lat}&lng=${location.lng}`
        : `${baseUrl}/jp/tokyo/search?q=${searchQuery}`;
        
    case 'demaekan':
      return `${baseUrl}/search?keyword=${searchQuery}&area=tokyo`;
      
    case 'wolt':
      return `${baseUrl}/ja/jpn/tokyo/search?q=${searchQuery}`;
      
    default:
      return `${baseUrl}${app.searchPath}?q=${searchQuery}`;
  }
};

// 앱 설치 확인 및 딥링크 실행
export const openDeliveryApp = async (
  appName: string,
  restaurantId: string,
  restaurantName: string,
  location?: { lat: number; lng: number }
): Promise<boolean> => {
  const app = DELIVERY_APPS[appName];
  if (!app || !app.isAvailable) return false;

  const webUrl = generateDeliveryLink(appName, restaurantId, restaurantName, location);
  
  // 모바일 디바이스에서 앱 설치 확인 시도
  if (typeof window !== 'undefined' && app.appScheme) {
    try {
      // 모바일인지 확인
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // 앱 딥링크 시도
        const appUrl = app.appScheme + 'restaurant/' + encodeURIComponent(restaurantName);
        window.location.href = appUrl;
        
        // 2초 후 앱이 열리지 않으면 웹 페이지로 이동
        setTimeout(() => {
          window.open(webUrl, '_blank');
        }, 2000);
        
        return true;
      }
    } catch (error) {
      console.warn(`앱 딥링크 실패 (${appName}):`, error);
    }
  }

  // 웹 브라우저에서 열기
  window.open(webUrl, '_blank');
  return true;
};

// 사용자 위치 기반 추천 배달앱
export const getRecommendedDeliveryApps = (
  userLocation?: { lat: number; lng: number }
): DeliveryAppConfig[] => {
  const availableApps = Object.values(DELIVERY_APPS).filter(app => app.isAvailable);
  
  // 도쿄 지역 기반 추천 순서
  return availableApps.sort((a, b) => {
    const order = ['ubereats', 'demaekan', 'wolt'];
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

// 배달앱 버튼 컴포넌트용 데이터
export const getDeliveryAppButtonData = (
  restaurantDeliveryApps: Record<string, string>,
  restaurantName: string,
  location?: { lat: number; lng: number }
) => {
  const availableApps = Object.entries(restaurantDeliveryApps)
    .filter(([appName, restaurantId]) => {
      const app = DELIVERY_APPS[appName];
      return app && app.isAvailable && restaurantId;
    })
    .map(([appName, restaurantId]) => {
      const app = DELIVERY_APPS[appName];
      return {
        ...app,
        restaurantId,
        link: generateDeliveryLink(appName, restaurantId, restaurantName, location),
        onClick: () => openDeliveryApp(appName, restaurantId, restaurantName, location)
      };
    });

  return availableApps;
};

// 배달앱 가용성 체크
export const checkDeliveryAppAvailability = async (): Promise<Record<string, boolean>> => {
  const availability: Record<string, boolean> = {};
  
  for (const [appName, app] of Object.entries(DELIVERY_APPS)) {
    try {
      // 간단한 헤드 요청으로 서비스 상태 확인
      const response = await fetch(app.webUrl, { 
        method: 'HEAD', 
        mode: 'no-cors' 
      });
      availability[appName] = app.isAvailable && response.ok;
    } catch (error) {
      availability[appName] = app.isAvailable; // 기본값 사용
    }
  }
  
  return availability;
};

// 사용 통계 추적용 (선택적)
export const trackDeliveryAppClick = (
  appName: string,
  restaurantName: string,
  source: 'search' | 'direct'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'delivery_app_click', {
      app_name: appName,
      restaurant_name: restaurantName,
      source: source,
      timestamp: new Date().toISOString()
    });
  }
  
  // 로컬 스토리지에 사용 통계 저장
  try {
    const stats = JSON.parse(localStorage.getItem('delivery_app_stats') || '{}');
    stats[appName] = (stats[appName] || 0) + 1;
    localStorage.setItem('delivery_app_stats', JSON.stringify(stats));
  } catch (error) {
    console.warn('통계 저장 실패:', error);
  }
};

// 전역 타입 확장 (TypeScript)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
} 