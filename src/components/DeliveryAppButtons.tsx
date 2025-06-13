'use client';

import { useState } from 'react';
import { DELIVERY_APPS, openDeliveryApp } from '@/lib/delivery';

interface DeliveryAppButtonsProps {
  restaurantName: string;
  deliveryApps: {
    ubereats?: string;
    demaekan?: string;
    wolt?: string;
  };
  className?: string;
}

export default function DeliveryAppButtons({ 
  restaurantName, 
  deliveryApps, 
  className = '' 
}: DeliveryAppButtonsProps) {
  const [clickedApp, setClickedApp] = useState<string | null>(null);

  const handleAppClick = (appName: string, restaurantId: string) => {
    setClickedApp(appName);
    openDeliveryApp(appName, restaurantId, restaurantName);
    
    // 클릭 효과 제거
    setTimeout(() => setClickedApp(null), 1000);
  };

  const availableApps = Object.entries(deliveryApps)
    .filter(([_, restaurantId]) => restaurantId)
    .map(([appName, restaurantId]) => ({
      appName,
      restaurantId,
      config: DELIVERY_APPS[appName]
    }))
    .filter(({ config }) => config);

  if (availableApps.length === 0) {
    return (
      <div className={`text-center p-4 bg-gray-100 rounded-lg ${className}`}>
        <span className="text-gray-500">配達情報なし</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-semibold text-gray-700 mb-2">
        📱 配達アプリで注文
      </div>
      
      <div className="space-y-2">
        {availableApps.map(({ appName, restaurantId, config }) => (
          <button
            key={appName}
            onClick={() => handleAppClick(appName, restaurantId || '')}
            className={`
              w-full flex items-center justify-between p-3 rounded-lg 
              transition-all duration-200 transform
              ${clickedApp === appName 
                ? 'scale-95 shadow-inner' 
                : 'hover:scale-105 hover:shadow-lg'
              }
              border-2 hover:border-opacity-100 border-opacity-20
            `}
            style={{ 
              backgroundColor: `${config.color}15`,
              borderColor: config.color,
              color: config.color
            }}
            disabled={clickedApp === appName}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{config.icon}</span>
              <span className="font-semibold">{config.displayName}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {restaurantId?.startsWith('search-') ? (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  検索
                </span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  直接
                </span>
              )}
              <span className="text-sm">→</span>
            </div>
          </button>
        ))}
      </div>
      
      {/* 注意事項 */}
      <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
        💡 ボタンをクリックすると配達アプリのページが開きます。
        アプリがインストールされている場合は自動的にアプリで開きます。
      </div>
    </div>
  );
} 