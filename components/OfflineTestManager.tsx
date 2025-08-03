'use client';

import { useState, useEffect } from 'react';

interface OfflineTestResult {
  testName: string;
  status: 'testing' | 'success' | 'failed' | 'pending';
  details: string;
  timestamp?: Date;
}

interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  saveData: boolean;
}

const OfflineTestManager = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [testResults, setTestResults] = useState<OfflineTestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  useEffect(() => {
    if (!isDev) return;

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        saveData: connection?.saveData || false
      });
    };

    updateNetworkInfo();

    // ネットワーク状態変化の監視
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [isDev]);

  // 個別テスト実行
  const runSingleTest = async (testName: string) => {
    setTestResults(prev => prev.map(test => 
      test.testName === testName 
        ? { ...test, status: 'testing', timestamp: new Date() }
        : test
    ));

    let result: OfflineTestResult;

    try {
      switch (testName) {
        case 'Service Worker':
          result = await testServiceWorker();
          break;
        case 'キャッシュ状態':
          result = await testCacheStatus();
          break;
        case 'API応答（オンライン）':
          result = await testAPIOnline();
          break;
        case 'API応答（オフライン）':
          result = await testAPIOffline();
          break;
        case '静的リソース':
          result = await testStaticResources();
          break;
        case 'オフラインナビゲーション':
          result = await testOfflineNavigation();
          break;
        default:
          result = {
            testName,
            status: 'failed',
            details: '未知のテストです',
            timestamp: new Date()
          };
      }
    } catch (error) {
      result = {
        testName,
        status: 'failed',
        details: `エラー: ${error}`,
        timestamp: new Date()
      };
    }

    setTestResults(prev => prev.map(test => 
      test.testName === testName ? result : test
    ));
  };

  // 全テスト実行
  const runAllTests = async () => {
    setIsTestingAll(true);
    
    const tests = [
      'Service Worker',
      'キャッシュ状態',
      'API応答（オンライン）',
      '静的リソース',
      'オフラインナビゲーション'
    ];

    for (const test of tests) {
      await runSingleTest(test);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒間隔
    }

    // オフライン状態でのテスト（ユーザーに手動実行を促す）
    setTestResults(prev => [...prev, {
      testName: 'API応答（オフライン）',
      status: 'pending',
      details: 'ネットワークを手動で切断してテストしてください',
      timestamp: new Date()
    }]);

    setIsTestingAll(false);
  };

  // 初期テスト項目設定
  useEffect(() => {
    if (!isDev || testResults.length > 0) return;

    setTestResults([
      { testName: 'Service Worker', status: 'pending', details: '未実行' },
      { testName: 'キャッシュ状態', status: 'pending', details: '未実行' },
      { testName: 'API応答（オンライン）', status: 'pending', details: '未実行' },
      { testName: 'API応答（オフライン）', status: 'pending', details: '未実行' },
      { testName: '静的リソース', status: 'pending', details: '未実行' },
      { testName: 'オフラインナビゲーション', status: 'pending', details: '未実行' }
    ]);
  }, [isDev, testResults.length]);

  if (!isDev) return null;

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4 z-50 bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700 transition-colors"
        title="オフライン機能テスト"
      >
        🔌
      </button>

      {/* テストパネル */}
      {isVisible && (
        <div className="fixed bottom-32 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">オフライン機能テスト</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* ネットワーク情報 */}
          {networkInfo && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium text-sm mb-2">ネットワーク状態</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>接続状態:</span>
                  <span className={networkInfo.isOnline ? 'text-green-600' : 'text-red-600'}>
                    {networkInfo.isOnline ? 'オンライン' : 'オフライン'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>接続タイプ:</span>
                  <span>{networkInfo.connectionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>実効速度:</span>
                  <span>{networkInfo.effectiveType}</span>
                </div>
                {networkInfo.downlink > 0 && (
                  <div className="flex justify-between">
                    <span>ダウンリンク:</span>
                    <span>{networkInfo.downlink} Mbps</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* テスト制御 */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={runAllTests}
              disabled={isTestingAll}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isTestingAll ? 'テスト中...' : '全テスト実行'}
            </button>
            <button
              onClick={() => setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const, details: '未実行' })))}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              リセット
            </button>
          </div>

          {/* テスト結果 */}
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className="border border-gray-200 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{test.testName}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      test.status === 'success' ? 'bg-green-100 text-green-800' :
                      test.status === 'failed' ? 'bg-red-100 text-red-800' :
                      test.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status === 'success' ? '成功' :
                       test.status === 'failed' ? '失敗' :
                       test.status === 'testing' ? 'テスト中' : '待機中'}
                    </span>
                    <button
                      onClick={() => runSingleTest(test.testName)}
                      disabled={test.status === 'testing'}
                      className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
                    >
                      実行
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {test.details}
                </div>
                {test.timestamp && (
                  <div className="text-xs text-gray-400 mt-1">
                    {test.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 手動テスト手順 */}
          <div className="mt-4 p-3 bg-yellow-50 rounded text-xs">
            <h4 className="font-medium mb-2">手動テスト手順:</h4>
            <ol className="space-y-1 text-gray-600">
              <li>1. 全テストを実行してオンライン機能を確認</li>
              <li>2. ブラウザの開発者ツールでNetwork→Offlineを選択</li>
              <li>3. 「API応答（オフライン）」を個別実行</li>
              <li>4. ページをリロードしてオフライン表示を確認</li>
              <li>5. ナビゲーションが正常に動作することを確認</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

// テスト関数の実装
const testServiceWorker = async (): Promise<OfflineTestResult> => {
  if (!('serviceWorker' in navigator)) {
    return {
      testName: 'Service Worker',
      status: 'failed',
      details: 'Service Workerがサポートされていません',
      timestamp: new Date()
    };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return {
      testName: 'Service Worker',
      status: 'failed',
      details: 'Service Workerが登録されていません',
      timestamp: new Date()
    };
  }

  const isActive = !!registration.active;
  return {
    testName: 'Service Worker',
    status: isActive ? 'success' : 'failed',
    details: isActive ? 'Service Workerは正常に動作しています' : 'Service Workerがアクティブではありません',
    timestamp: new Date()
  };
};

const testCacheStatus = async (): Promise<OfflineTestResult> => {
  try {
    const cacheNames = await caches.keys();
    const relevantCaches = cacheNames.filter(name => name.includes('kyou-nani-tabeyou'));
    
    if (relevantCaches.length === 0) {
      return {
        testName: 'キャッシュ状態',
        status: 'failed',
        details: 'アプリケーションキャッシュが見つかりません',
        timestamp: new Date()
      };
    }

    let totalCachedItems = 0;
    for (const cacheName of relevantCaches) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalCachedItems += requests.length;
    }

    return {
      testName: 'キャッシュ状態',
      status: 'success',
      details: `${relevantCaches.length}個のキャッシュ、${totalCachedItems}個のアイテムがキャッシュされています`,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      testName: 'キャッシュ状態',
      status: 'failed',
      details: `キャッシュ確認中にエラーが発生しました: ${error}`,
      timestamp: new Date()
    };
  }
};

const testAPIOnline = async (): Promise<OfflineTestResult> => {
  try {
    const response = await fetch('/api/recipes/simple');
    const data = await response.json();
    
    if (response.ok && data.foods && data.foods.length > 0) {
      return {
        testName: 'API応答（オンライン）',
        status: 'success',
        details: `API正常応答: ${data.foods.length}個のレシピを取得`,
        timestamp: new Date()
      };
    } else {
      return {
        testName: 'API応答（オンライン）',
        status: 'failed',
        details: 'APIからの応答が不正です',
        timestamp: new Date()
      };
    }
  } catch (error) {
    return {
      testName: 'API応答（オンライン）',
      status: 'failed',
      details: `API呼び出し中にエラーが発生しました: ${error}`,
      timestamp: new Date()
    };
  }
};

const testAPIOffline = async (): Promise<OfflineTestResult> => {
  try {
    const response = await fetch('/api/recipes/simple');
    const data = await response.json();
    
    if (data.offline) {
      return {
        testName: 'API応答（オフライン）',
        status: 'success',
        details: `オフライン応答正常: ${data.foods?.length || 0}個のオフラインレシピを提供`,
        timestamp: new Date()
      };
    } else {
      return {
        testName: 'API応答（オフライン）',
        status: 'failed',
        details: 'オフライン状態でも通常のAPI応答が返されています（ネットワークが接続されている可能性があります）',
        timestamp: new Date()
      };
    }
  } catch (error) {
    return {
      testName: 'API応答（オフライン）',
      status: 'failed',
      details: `オフラインAPI呼び出し中にエラーが発生しました: ${error}`,
      timestamp: new Date()
    };
  }
};

const testStaticResources = async (): Promise<OfflineTestResult> => {
  const testUrls = ['/', '/simple-test', '/manifest.json'];
  let successCount = 0;
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) successCount++;
    } catch (error) {
      // オフライン時のエラーは期待される
    }
  }
  
  return {
    testName: '静的リソース',
    status: successCount > 0 ? 'success' : 'failed',
    details: `${testUrls.length}個中${successCount}個の静的リソースが利用可能です`,
    timestamp: new Date()
  };
};

const testOfflineNavigation = async (): Promise<OfflineTestResult> => {
  // 基本的なナビゲーション要素の存在確認
  const navigationElements = document.querySelectorAll('a[href], button[onclick]');
  
  if (navigationElements.length === 0) {
    return {
      testName: 'オフラインナビゲーション',
      status: 'failed',
      details: 'ナビゲーション要素が見つかりません',
      timestamp: new Date()
    };
  }
  
  return {
    testName: 'オフラインナビゲーション',
    status: 'success',
    details: `${navigationElements.length}個のナビゲーション要素が利用可能です`,
    timestamp: new Date()
  };
};

export default OfflineTestManager; 