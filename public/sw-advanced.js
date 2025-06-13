// Advanced Service Worker - High Performance PWA
const SW_VERSION = 'v5-advanced-2024';

// キャッシュ名定義
const CACHE_NAMES = {
  STATIC: `kyou-nani-static-${SW_VERSION}`,
  DYNAMIC: `kyou-nani-dynamic-${SW_VERSION}`, 
  API: `kyou-nani-api-${SW_VERSION}`,
  IMAGES: `kyou-nani-images-${SW_VERSION}`
};

// キャッシュ戦略設定
const CACHE_STRATEGIES = {
  STATIC: { maxAge: 30 * 24 * 60 * 60 * 1000, maxEntries: 100 },
  API: { maxAge: 5 * 60 * 1000, maxEntries: 50 },
  DYNAMIC: { maxAge: 24 * 60 * 60 * 1000, maxEntries: 100 },
  IMAGES: { maxAge: 7 * 24 * 60 * 60 * 1000, maxEntries: 200 }
};

// 필수 리소스
const CRITICAL_RESOURCES = [
  '/',
  '/simple-test', 
  '/offline.html',
  '/manifest.json'
];

// Background Sync
const BG_SYNC_TAG = 'kyou-nani-background-sync';
const requestQueue = [];

/**
 * Install Event
 */
self.addEventListener('install', (event) => {
  console.log('🚀 고급 Service Worker 설치 시작');
  
  event.waitUntil(
    Promise.all([
      cacheStaticResources(),
      precacheAPIData()
    ]).then(() => {
      console.log('✅ Service Worker 설치 완료');
      return self.skipWaiting();
    })
  );
});

/**
 * Activate Event
 */
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker 활성화 시작');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      enforeCacheLimits()
    ]).then(() => {
      console.log('✅ Service Worker 활성화 완료');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event - 고급 캐싱 전략
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // 이미지 요청 처리
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // HTML/정적 파일 처리
  event.respondWith(handleStaticRequest(request));
});

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  if (event.tag === BG_SYNC_TAG) {
    event.waitUntil(processBackgroundSync());
  }
});

/**
 * Push 알림 Event
 */
self.addEventListener('push', (event) => {
  const options = {
    body: '今日何食べよう？新しいおすすめ料理があります！',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: '1' },
    actions: [
      { action: 'explore', title: '料理を見る', icon: '/icon-192x192.png' },
      { action: 'close', title: '閉じる' }
    ]
  };

  const title = '今日何食べよう？';
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * 알림 클릭 Event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/simple-test'));
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

/**
 * 정적 리소스 캐싱
 */
async function cacheStaticResources() {
  const cache = await caches.open(CACHE_NAMES.STATIC);
  
  try {
    await cache.addAll(CRITICAL_RESOURCES);
    console.log('📦 정적 리소스 캐시 완료');
  } catch (error) {
    console.error('❌ 정적 리소스 캐시 실패:', error);
  }
}

/**
 * API 사전 캐싱
 */
async function precacheAPIData() {
  const cache = await caches.open(CACHE_NAMES.API);
  const apis = ['/api/foods/basic', '/api/categories'];
  
  for (const api of apis) {
    try {
      const response = await fetch(api);
      if (response.ok) {
        await cache.put(api, response);
      }
    } catch (error) {
      console.warn(`API 사전 캐시 실패: ${api}`);
    }
  }
}

/**
 * API 요청 처리 (Stale While Revalidate)
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(CACHE_NAMES.API);
  const cachedResponse = await cache.match(request);

  try {
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineAPIResponse();
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }

    // Background Sync 큐잉
    if (request.method === 'POST') {
      await queueBackgroundSync(request);
    }

    return createOfflineAPIResponse();
  }
}

/**
 * 이미지 요청 처리 (Cache First)
 */
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    return createPlaceholderImage();
  }
}

/**
 * 정적 파일 요청 처리 (Network First)
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAMES.DYNAMIC);

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    
    const cachedResponse = await cache.match(request);
    return cachedResponse || createOfflineResponse();
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || createOfflineResponse();
  }
}

/**
 * Background Sync 처리
 */
async function processBackgroundSync() {
  console.log('🔄 Background Sync 실행 중');
  
  for (const queuedRequest of requestQueue) {
    try {
      await fetch(queuedRequest.request);
      console.log('✅ Background Sync 완료:', queuedRequest.id);
    } catch (error) {
      console.error('❌ Background Sync 실패:', queuedRequest.id, error);
    }
  }
  
  requestQueue.length = 0;
}

/**
 * Background Sync 큐잉
 */
async function queueBackgroundSync(request) {
  const id = Date.now().toString();
  requestQueue.push({
    id,
    request: request.clone(),
    timestamp: Date.now()
  });
  
  try {
    await self.registration.sync.register(BG_SYNC_TAG);
  } catch (error) {
    console.error('Background Sync 등록 실패:', error);
  }
}

/**
 * 유틸리티 함수들
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(request.url);
}

function createPlaceholderImage() {
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">🍽️</text>
  </svg>`;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

function createOfflineAPIResponse() {
  return new Response(JSON.stringify({
    success: false,
    message: 'オフライン状態です',
    offline: true,
    data: {
      foods: [
        { id: 1, name: 'ラーメン', emoji: '🍜', category: 'japanese' },
        { id: 2, name: 'カレー', emoji: '🍛', category: 'curry' },
        { id: 3, name: '寿司', emoji: '🍣', category: 'japanese' }
      ]
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function createOfflineResponse() {
  return caches.match('/offline.html') || 
         new Response('オフライン状態です', { status: 503 });
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(CACHE_NAMES);
  
  await Promise.all(
    cacheNames.map(cacheName => {
      if (!currentCaches.includes(cacheName)) {
        console.log('🗑️ 이전 캐시 삭제:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

async function enforeCacheLimits() {
  for (const [cacheKey, cacheName] of Object.entries(CACHE_NAMES)) {
    const strategy = CACHE_STRATEGIES[cacheKey];
    if (strategy) {
      await limitCacheSize(cacheName, strategy.maxEntries);
    }
  }
}

async function limitCacheSize(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`🧹 캐시 크기 제한 적용: ${cacheName}`);
  }
}

console.log('🚀 고급 Service Worker 로드 완료'); 