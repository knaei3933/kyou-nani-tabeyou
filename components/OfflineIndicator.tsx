'use client';

import { useState, useEffect } from 'react';

interface OfflineStatus {
  isOffline: boolean;
  lastSyncTime: Date | null;
  cacheStatus: 'available' | 'limited' | 'unavailable';
  offlineCapabilities: string[];
}

const OfflineIndicator = () => {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOffline: false,
    lastSyncTime: null,
    cacheStatus: 'unavailable',
    offlineCapabilities: []
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateOfflineStatus = async () => {
      const isOffline = !navigator.onLine;
      
      // キャッシュ状態確認
      let cacheStatus: 'available' | 'limited' | 'unavailable' = 'unavailable';
      let capabilities: string[] = [];
      
      try {
        const cacheNames = await caches.keys();
        const appCaches = cacheNames.filter(name => name.includes('kyou-nani-tabeyou'));
        
        if (appCaches.length > 0) {
          // キャッシュ内容を確認
          const staticCache = await caches.open(appCaches.find(name => name.includes('static')) || appCaches[0]);
          const cachedRequests = await staticCache.keys();
          
          if (cachedRequests.length > 5) {
            cacheStatus = 'available';
            capabilities = [
              'ホームページ表示',
              'レシピ検索ページ',
              'オフラインレシピ表示',
              '基本ナビゲーション'
            ];
          } else if (cachedRequests.length > 0) {
            cacheStatus = 'limited';
            capabilities = [
              'ホームページ表示',
              '基本ナビゲーション'
            ];
          }
        }
      } catch (error) {
        console.log('キャッシュ状態確認エラー:', error);
      }

      setOfflineStatus({
        isOffline,
        lastSyncTime: isOffline ? offlineStatus.lastSyncTime : new Date(),
        cacheStatus,
        offlineCapabilities: capabilities
      });
    };

    updateOfflineStatus();

    // ネットワーク状態変化の監視
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);

    // 定期的な状態確認（30秒ごと）
    const interval = setInterval(updateOfflineStatus, 30000);

    return () => {
      window.removeEventListener('online', updateOfflineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
      clearInterval(interval);
    };
  }, [offlineStatus.lastSyncTime]);

  // オンライン時は表示しない
  if (!offlineStatus.isOffline) return null;

  return (
    <>
      {/* メインオフラインバナー */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="font-medium">オフライン状態</span>
            <span className="text-orange-200 text-sm">
              {offlineStatus.cacheStatus === 'available' 
                ? '完全機能利用可能' 
                : offlineStatus.cacheStatus === 'limited'
                ? '限定機能利用可能'
                : '機能制限中'}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded transition-colors"
          >
            {showDetails ? '詳細を隠す' : '詳細を見る'}
          </button>
        </div>
      </div>

      {/* 詳細情報パネル */}
      {showDetails && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* オフライン機能 */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  利用可能な機能
                </h4>
                {offlineStatus.offlineCapabilities.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {offlineStatus.offlineCapabilities.map((capability, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    キャッシュされた機能がありません。<br/>
                    オンライン時にページを読み込み直してください。
                  </p>
                )}
              </div>

              {/* 制限事項と対処法 */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  制限事項と対処法
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-800 mb-1">
                      ⚠️ 制限される機能
                    </div>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• 新しいレシピの検索</li>
                      <li>• リアルタイムデータの更新</li>
                      <li>• 外部サービス連携</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="font-medium text-blue-800 mb-1">
                      💡 対処法
                    </div>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Wi-Fi接続を確認してください</li>
                      <li>• モバイルデータをONにしてください</li>
                      <li>• オンライン復帰後、ページを更新してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 最終同期時間 */}
            {offlineStatus.lastSyncTime && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  最終同期: {offlineStatus.lastSyncTime.toLocaleString('ja-JP')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* スペーサー（コンテンツが隠れないように） */}
      <div className={`${showDetails ? 'h-72' : 'h-14'} transition-all duration-300`}></div>
    </>
  );
};

export default OfflineIndicator; 