// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

// 일본 주요 배달앱 정보
const DELIVERY_APPS = [
  {
    id: 'ubereats',
    name: 'Uber Eats',
    emoji: '🚚',
    color: '#000000',
    searchUrl: 'https://www.ubereats.com/jp/search?q=',
    description: '日本全域最大カバレッジ'
  },
  {
    id: 'demae-can',
    name: '出前館',
    emoji: '🏮',
    color: '#ff4b00',
    searchUrl: 'https://demae-can.com/search?keyword=',
    description: '日本ローカル1位配達アプリ'
  },
  {
    id: 'wolt',
    name: 'Wolt',
    emoji: '💙',
    color: '#00c8f4',
    searchUrl: 'https://wolt.com/ja/search?q=',
    description: 'プレミアム配達サービス'
  }
];

// サンプル選択料理（実際には前のページから受け取る）
const SAMPLE_SELECTED_FOODS = [
  { id: 'ramen', name: 'ラーメン', emoji: '🍜', category: '麺類' },
  { id: 'sushi', name: '寿司', emoji: '🍣', category: '和食' },
  { id: 'pizza', name: 'ピザ', emoji: '🍕', category: '洋食' }
];

export default function ConsumptionMethodPage() {
  const [selectedFoods, setSelectedFoods] = useState(SAMPLE_SELECTED_FOODS);
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');

  const currentFood = selectedFoods[currentFoodIndex];

  // 배달앱으로 이동하는 함수
  const openDeliveryApp = (app, foodName) => {
    const searchTerm = encodeURIComponent(foodName);
    const url = app.searchUrl + searchTerm;
    window.open(url, '_blank');
  };

  // 다음 음식으로 이동
  const goToNextFood = () => {
    if (currentFoodIndex < selectedFoods.length - 1) {
      setCurrentFoodIndex(currentFoodIndex + 1);
      setSelectedMethod('');
    } else {
      alert('全ての料理に対する選択が完了しました！🎉');
    }
  };

  // 이전 음식으로 이동
  const goToPrevFood = () => {
    if (currentFoodIndex > 0) {
      setCurrentFoodIndex(currentFoodIndex - 1);
      setSelectedMethod('');
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          marginBottom: '8px',
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          🍽️ どう食べる？
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          color: '#64748b',
          margin: '0 0 8px 0'
        }}>
          選択した料理をどのように楽しみますか？
        </p>
        
        {/* 홈으로 돌아가기 버튼 */}
        <button
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          🏠 ホーム
        </button>
      </div>

      {/* 진행 상황 표시 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {selectedFoods.map((food, index) => (
            <div key={food.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: index === currentFoodIndex ? '#3b82f6' : 
                                 index < currentFoodIndex ? '#10b981' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                {index < currentFoodIndex ? '✓' : food.emoji}
              </div>
              {index < selectedFoods.length - 1 && (
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: index < currentFoodIndex ? '#10b981' : '#e5e7eb',
                  margin: '0 4px'
                }} />
              )}
            </div>
          ))}
        </div>
        <p style={{ 
          color: '#64748b', 
          fontSize: '14px',
          margin: 0
        }}>
          {currentFoodIndex + 1} / {selectedFoods.length} - {currentFood.name} を選択中
        </p>
      </div>

      {/* 현재 선택된 음식 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {currentFood.emoji}
        </div>
        <h2 style={{ 
          fontSize: '32px', 
          marginBottom: '8px',
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          {currentFood.name}
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b',
          margin: 0
        }}>
          {currentFood.category}
        </p>
      </div>

      {/* 섭취 방법 선택 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          marginBottom: '16px',
          color: '#374151',
          textAlign: 'center'
        }}>
          どのように楽しみますか？
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          {/* 배달 주문 */}
          <div style={{
            backgroundColor: 'white',
            border: selectedMethod === 'delivery' ? '3px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: selectedMethod === 'delivery' ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setSelectedMethod('delivery')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚚</div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>
              デリバリー注文
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              配達アプリで注文する
            </p>
            {selectedMethod === 'delivery' && (
              <div style={{ 
                display: 'grid', 
                gap: '8px' 
              }}>
                {DELIVERY_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeliveryApp(app, currentFood.name);
                    }}
                    style={{
                      backgroundColor: app.color,
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {app.emoji} {app.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 맛집 찾기 */}
          <div style={{
            backgroundColor: 'white',
            border: selectedMethod === 'restaurant' ? '3px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: selectedMethod === 'restaurant' ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setSelectedMethod('restaurant')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>
              レストラン検索
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              近くのお店を探す
            </p>
            {selectedMethod === 'restaurant' && (
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://tabelog.com/keywords/${encodeURIComponent(currentFood.name)}/`, '_blank');
                  }}
                  style={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    width: '100%'
                  }}
                >
                  🔍 食べログで検索
                </button>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Phase 2でより多くの検索オプション追加予定
                </p>
              </div>
            )}
          </div>

          {/* 레시피 보기 */}
          <div style={{
            backgroundColor: 'white',
            border: selectedMethod === 'recipe' ? '3px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: selectedMethod === 'recipe' ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setSelectedMethod('recipe')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍳</div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>
              レシピを見る
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              家で作ってみる
            </p>
            {selectedMethod === 'recipe' && (
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`${currentFood.name}のレシピ機能はPhase 3で実装予定です。\n\n現在は既存のレシピページに接続されます。`);
                  }}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  📖 レシピを確認
                </button>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  Phase 3で統合予定
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '32px'
      }}>
        <button
          onClick={goToPrevFood}
          disabled={currentFoodIndex === 0}
          style={{
            backgroundColor: currentFoodIndex === 0 ? '#e5e7eb' : '#64748b',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: currentFoodIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentFoodIndex === 0 ? 0.5 : 1
          }}
        >
          ← 前の料理
        </button>

        {selectedMethod && (
          <div style={{ 
            backgroundColor: '#ecfdf5', 
            border: '2px solid #10b981',
            padding: '8px 16px', 
            borderRadius: '20px',
            fontSize: '14px',
            color: '#065f46',
            fontWeight: '600'
          }}>
            ✅ {selectedMethod === 'delivery' ? 'デリバリー' : 
                 selectedMethod === 'restaurant' ? 'レストラン' : 'レシピ'} を選択
          </div>
        )}

        <button
          onClick={goToNextFood}
          disabled={!selectedMethod}
          style={{
            backgroundColor: selectedMethod ? '#3b82f6' : '#e5e7eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: selectedMethod ? 'pointer' : 'not-allowed',
            opacity: selectedMethod ? 1 : 0.5
          }}
        >
          {currentFoodIndex === selectedFoods.length - 1 ? '完了' : '次の料理 →'}
        </button>
      </div>
    </div>
  );
} 