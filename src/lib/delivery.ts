// 배달앱 직접 링크 시스템

export interface DeliveryApp {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  webUrl: string;
  isAvailable: boolean;
}

export const DELIVERY_APPS: Record<string, DeliveryApp> = {
  ubereats: {
    name: 'ubereats',
    displayName: 'Uber Eats',
    icon: '🍔',
    color: '#00c851',
    webUrl: 'https://www.ubereats.com',
    isAvailable: true
  },
  demaekan: {
    name: 'demaekan',
    displayName: '出前館',
    icon: '🍜',
    color: '#ff6900',
    webUrl: 'https://demae-can.com',
    isAvailable: true
  },
  wolt: {
    name: 'wolt',
    displayName: 'Wolt',
    icon: '🚀',
    color: '#009de0',
    webUrl: 'https://wolt.com',
    isAvailable: true
  }
};

// 딥링크 생성
export const generateDeliveryLink = (
  appName: string, 
  restaurantId: string, 
  restaurantName: string
): string => {
  const app = DELIVERY_APPS[appName];
  if (!app) return '';

  const searchQuery = encodeURIComponent(restaurantName);
  
  switch (appName) {
    case 'ubereats':
      return restaurantId.startsWith('search-')
        ? `${app.webUrl}/jp/tokyo/search?q=${searchQuery}`
        : `${app.webUrl}/jp/store/${restaurantId}`;
        
    case 'demaekan':
      return restaurantId.startsWith('search-')
        ? `${app.webUrl}/search?keyword=${searchQuery}`
        : `${app.webUrl}/shop/detail/${restaurantId}`;
        
    case 'wolt':
      return restaurantId.startsWith('search-')
        ? `${app.webUrl}/ja/jpn/tokyo/search?q=${searchQuery}`
        : `${app.webUrl}/ja/jpn/tokyo/restaurant/${restaurantId}`;
        
    default:
      return app.webUrl;
  }
};

// 배달앱 열기
export const openDeliveryApp = (
  appName: string,
  restaurantId: string,
  restaurantName: string
): void => {
  const link = generateDeliveryLink(appName, restaurantId, restaurantName);
  if (link) {
    window.open(link, '_blank', 'noopener,noreferrer');
    
    // 사용 통계 기록
    trackDeliveryAppClick(appName, restaurantName);
  }
};

// 사용 통계 추적
export const trackDeliveryAppClick = (appName: string, restaurantName: string) => {
  try {
    const stats = JSON.parse(localStorage.getItem('delivery_stats') || '{}');
    const key = `${appName}_${new Date().toDateString()}`;
    stats[key] = (stats[key] || 0) + 1;
    localStorage.setItem('delivery_stats', JSON.stringify(stats));
  } catch (error) {
    console.warn('統計保存失敗:', error);
  }
}; 