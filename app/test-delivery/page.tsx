'use client';

import { useState } from 'react';
import DeliveryAppButtons from '@/components/DeliveryAppButtons';

export default function TestDeliveryPage() {
  const testRestaurant = {
    name: 'ラーメン一蘭 渋谷店',
    deliveryApps: {
      ubereats: 'ichiran-shibuya-tokyo',
      demaekan: 'ramen-ichiran-shibuya',
      wolt: 'ichiran-ramen-shibuya'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔗 配達アプリテスト
          </h1>
          <p className="text-gray-600">
            배달앱 딥링크 시스템 테스트 페이지
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">📱 배달앱 버튼 테스트</h2>
          <DeliveryAppButtons
            restaurantName={testRestaurant.name}
            deliveryApps={testRestaurant.deliveryApps}
          />
        </div>

        <div className="text-center">
          <a 
            href="/simple-test" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
          >
            🍽️ 음식 선택으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
} 