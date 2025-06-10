// Service Worker for PWA functionality - Performance Optimized
const CACHE_VERSION = 'v4-offline-support';
const STATIC_CACHE = `kyou-nani-tabeyou-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `kyou-nani-tabeyou-dynamic-${CACHE_VERSION}`;
const API_CACHE = `kyou-nani-tabeyou-api-${CACHE_VERSION}`;

// 静的リソース（長期キャッシュ）
const STATIC_CACHE_URLS = [
  '/',
  '/simple-test',
  '/recipes',
  '/food-stats',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/icon-96x96.png'
];

// APIリソース（短期キャッシュ）
const API_CACHE_URLS = [
  '/api/recipes/simple',
  '/api/recipes/recommend'
];

// キャッシュ期限設定
const CACHE_STRATEGIES = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30日
  API: 60 * 60 * 1000, // 1時間
  DYNAMIC: 7 * 24 * 60 * 60 * 1000 // 7日
};

// パフォーマンス最適化されたキャッシュ管理
const isExpired = (timestamp, maxAge) => {
  return (Date.now() - timestamp) > maxAge;
};

// Install event - cache static assets with performance optimization
self.addEventListener('install', (event) => {
  console.log('Service Worker インストール中（パフォーマンス最適化版）...');
  event.waitUntil(
    Promise.all([
      // 静的リソースのキャッシュ
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('静的ファイルをキャッシュ中...');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      // APIリソースの事前キャッシュ
      caches.open(API_CACHE).then((cache) => {
        console.log('APIリソースを事前キャッシュ中...');
        return Promise.all(
          API_CACHE_URLS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {
              console.log(`API事前キャッシュ失敗: ${url}`);
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker インストール完了（最適化版）！');
      return self.skipWaiting();
    })
  );
});

// Activate event - advanced cache cleanup
self.addEventListener('activate', (event) => {
  console.log('Service Worker アクティベート中（最適化版）...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker アクティベート完了（最適化版）！');
        return self.clients.claim();
      })
  );
});

// Advanced fetch strategy with performance optimization
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API リクエストの戦略（Stale While Revalidate）
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          // キャッシュがあれば即座に返し、バックグラウンドで更新
          if (cachedResponse) {
            // バックグラウンドで最新データを取得してキャッシュ更新
            fetch(request).then(response => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            }).catch(() => {
              console.log('バックグラウンド更新失敗:', url.pathname);
            });
            return cachedResponse;
          }

          // キャッシュがない場合はネットワークから取得
          return fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // 完全オフライン時の応答
            return new Response(JSON.stringify({
              success: false,
              message: 'オフライン状態です。ネットワーク接続を確認してください。',
              offline: true,
              foods: [
                {
                  id: 'offline_ramen',
                  name: 'ラーメン',
                  emoji: '🍜',
                  category: 'ramen',
                  popular: true,
                  priceRange: '600-1000',
                  calories: '500-700',
                  cookingTime: '45分',
                  difficulty: '中級',
                  description: 'オフラインでも見ることができる基本料理'
                },
                {
                  id: 'offline_sushi',
                  name: '寿司',
                  emoji: '🍣',
                  category: 'washoku',
                  popular: true,
                  priceRange: '1000-3000',
                  calories: '400-600',
                  cookingTime: '30分',
                  difficulty: '上級',
                  description: 'オフラインでも見ることができる基本料理'
                },
                {
                  id: 'offline_curry',
                  name: 'カレー',
                  emoji: '🍛',
                  category: 'curry',
                  popular: true,
                  priceRange: '500-1000',
                  calories: '600-800',
                  cookingTime: '40分',
                  difficulty: '初級',
                  description: 'オフラインでも見ることができる基本料理'
                }
              ]
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // 静的リソースの戦略（Cache First with Network Fallback）
  if (url.pathname.includes('/icon-') || url.pathname.includes('/manifest.json')) {
    // アイコンとマニフェストは長期キャッシュ
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(response => {
          if (response.ok) {
            const cache = caches.open(STATIC_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // その他の静的ファイル（HTML、CSS、JS）
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // キャッシュがあれば返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // ネットワークから取得してキャッシュ
      return fetch(request).then(response => {
        if (response.ok) {
          const cacheName = request.destination === 'document' ? DYNAMIC_CACHE : STATIC_CACHE;
          caches.open(cacheName).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // ナビゲーションリクエストの場合はオフラインページを返す
        if (request.mode === 'navigate') {
          return caches.match('/offline.html').then(response => {
            return response || new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>オフライン</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .container {
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>📱 オフライン状態</h1>
                  <p>インターネット接続を確認してください</p>
                  <button onclick="location.reload()" style="
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                  ">🔄 再試行</button>
                </div>
              </body>
              </html>
            `, {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        }
        
        // その他のリソースのオフライン応答
        return new Response('リソースが利用できません', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Background Sync (今後実装予定)
self.addEventListener('sync', (event) => {
  if (event.tag === 'food-sync') {
    console.log('料理データ同期中...');
    // 今後オフラインで保存されたデータ同期ロジック
  }
});

// Push notification (今後実装予定)
self.addEventListener('push', (event) => {
  console.log('プッシュ通知受信:', event.data?.text());
  
  const options = {
    body: event.data?.text() || '新しい料理が追加されました！',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    data: {
      url: '/simple-test'
    }
  };

  event.waitUntil(
    self.registration.showNotification('今日何食べよう', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
}); 