// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { FlowNavigationComponent } from '../../components/ui/flow-navigation';
import { GlassCard, GlassButton } from '../../components/ui/glass-card';
import { useFlowState } from '../../lib/flowState';
import { gradientText } from '../../lib/utils';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, ShowOn, HideOn, useScreenSize } from '../../components/ui/ResponsiveLayout';
import { SidebarNav, HeaderNav, QuickActions } from '../../components/ui/DesktopNavigation';

// 東京の主要エリアデータ
const TOKYO_AREAS = [
  { id: 'shibuya', name: '渋谷区', emoji: '🏙️', popular: true },
  { id: 'shinjuku', name: '新宿区', emoji: '🌆', popular: true },
  { id: 'harajuku', name: '原宿', emoji: '🎨', popular: true },
  { id: 'ikebukuro', name: '池袋', emoji: '🎪', popular: true },
  { id: 'ginza', name: '銀座', emoji: '💎', popular: true },
  { id: 'akihabara', name: '秋葉原', emoji: '⚡', popular: true },
  { id: 'ueno', name: '上野', emoji: '🎨', popular: true },
  { id: 'asakusa', name: '浅草', emoji: '🏯', popular: true },
  { id: 'roppongi', name: '六本木', emoji: '🌃', popular: true },
  { id: 'ebisu', name: '恵比寿', emoji: '🍺', popular: true },
  { id: 'daikanyama', name: '代官山', emoji: '✨', popular: false },
  { id: 'nakameguro', name: '中目黒', emoji: '🌸', popular: false },
  { id: 'kichijoji', name: '吉祥寺', emoji: '🌳', popular: false },
  { id: 'sangenjaya', name: '三軒茶屋', emoji: '☕', popular: false },
  { id: 'shimokitazawa', name: '下北沢', emoji: '🎭', popular: false }
];

export default function LocationSelectPage() {
  const [selectedArea, setSelectedArea] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 디바이스 타입 감지
  const { deviceType, isDevice } = useScreenSize();

  const { state, setSelectedLocation, canProceedToStep } = useFlowState();

  // ナビゲーションアイテム
  const navItems = [
    { icon: '🏠', label: 'ホーム', href: '/', description: 'メインページ' },
    { icon: '🍽️', label: '食事選択', href: '/simple-test', description: '今日の食事を選ぶ' },
    { icon: '📍', label: 'エリア選択', href: '/location-select', description: '配達エリアを指定' },
    { icon: '🔍', label: '検索結果', href: '/result', description: 'レストランを探す' },
    { icon: '🏪', label: '詳細・注文', href: '/restaurant', description: 'メニューと注文' },
  ];

  // 現在地取得
  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('この端末では位置情報がサポートされていません');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({
          area: '現在地',
          address: `緯度: ${latitude.toFixed(4)}, 経度: ${longitude.toFixed(4)}`,
          coordinates: { lat: latitude, lng: longitude }
        });
        setUseCurrentLocation(true);
        setSelectedArea('current');
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の許可が拒否されました';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が取得できません';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10分間キャッシュ
      }
    );
  };

  // エリア選択
  const handleAreaSelect = (area) => {
    setSelectedArea(area.id);
    setUseCurrentLocation(false);
    setSelectedLocation({
      area: area.name,
      address: `東京都${area.name}`
    });
  };

  // カスタム住所設定
  const handleCustomAddress = () => {
    if (customAddress.trim()) {
      setSelectedLocation({
        area: 'カスタム',
        address: customAddress.trim()
      });
      setSelectedArea('custom');
      setUseCurrentLocation(false);
    }
  };

  // フィルタリングされたエリア
  const filteredAreas = showPopularOnly 
    ? TOKYO_AREAS.filter(area => area.popular)
    : TOKYO_AREAS;

  // 次のステップに進む条件チェック
  const canProceed = state.selectedLocation !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* デスクトップ用サイドバー */}
      <HideOn device={["mobile", "tablet"]}>
        <div className="fixed left-0 top-0 h-full z-30">
          <SidebarNav 
            items={navItems}
            currentPage="/location-select"
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </HideOn>

      {/* タブレット用ヘッダー */}
      <ShowOn device="tablet">
        <div className="fixed top-0 left-0 right-0 z-30">
          <HeaderNav items={navItems} currentPage="/location-select" />
        </div>
      </ShowOn>

      {/* メインコンテンツエリア */}
      <div className={`transition-all duration-300 ${
        isDevice.desktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 
        isDevice.tablet ? 'mt-16' : ''
      }`}>
        <ResponsiveContainer maxWidth="xl" padding="lg">
          {/* フローナビゲーション */}
          <FlowNavigationComponent 
            currentPageStep={2}
            className="mb-6"
          />

          {/* ヘッダー */}
          <ResponsiveCard variant="default" className="mb-6 text-center">
            <ResponsiveText as="h1" size="4xl" weight="bold" className={`mb-4 ${gradientText}`}>
              📍 配達エリアを指定
            </ResponsiveText>
            <ResponsiveText as="p" size="lg" className="text-gray-600 mb-4">
              配達を希望するエリアを選択してください
            </ResponsiveText>
            
            {/* 選択状況表示 */}
            {state.selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-green-700 font-semibold">
                  ✅ 選択済み: {state.selectedLocation.area}
                </p>
                {state.selectedLocation.address && (
                  <p className="text-green-600 text-sm">
                    {state.selectedLocation.address}
                  </p>
                )}
              </div>
            )}
          </ResponsiveCard>

          {/* 現在地取得 */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800 mb-4">
              🎯 現在地を使用
            </ResponsiveText>
            <ResponsiveText as="p" size="base" className="text-gray-600 mb-4">
              最も正確な配達エリアを設定できます
            </ResponsiveText>
            
            <div className={`flex ${isDevice.mobile ? 'flex-col' : 'flex-row'} gap-3`}>
              <GlassButton
                onClick={handleGetCurrentLocation}
                disabled={isLoadingLocation}
                variant="primary"
                className="flex-1"
              >
                {isLoadingLocation ? '取得中...' : '📍 現在地を取得'}
              </GlassButton>
            </div>
            
            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-red-700 text-sm">
                  ⚠️ {locationError}
                </p>
              </div>
            )}
          </ResponsiveCard>

          {/* エリア選択 */}
          <ResponsiveCard variant="default" className="mb-6">
            <div className={`flex ${isDevice.mobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
              <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800">
                🗾 東京主要エリア
              </ResponsiveText>
              <label className="flex items-center cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={showPopularOnly}
                  onChange={(e) => setShowPopularOnly(e.target.checked)}
                  className="mr-2 w-4 h-4"
                />
                🔥 人気エリアのみ
              </label>
            </div>

            <ResponsiveGrid 
              cols={{ mobile: 2, tablet: 4, desktop: 6 }}
              gap="md"
            >
              {filteredAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => handleAreaSelect(area)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedArea === area.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white/60 hover:bg-white/80 hover:shadow-md'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{area.emoji}</div>
                  <ResponsiveText as="div" size="sm" weight="semibold" className="text-gray-800">
                    {area.name}
                  </ResponsiveText>
                  {area.popular && (
                    <div className="text-xs text-orange-600 font-medium mt-1">
                      🔥 人気
                    </div>
                  )}
                </button>
              ))}
            </ResponsiveGrid>
          </ResponsiveCard>

          {/* カスタム住所入力 */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800 mb-4">
              ✏️ 住所を直接入力
            </ResponsiveText>
            <ResponsiveText as="p" size="base" className="text-gray-600 mb-4">
              上記以外のエリアや具体的な住所を入力できます
            </ResponsiveText>
            
            <div className={`flex ${isDevice.mobile ? 'flex-col' : 'flex-row'} gap-3`}>
              <input
                type="text"
                placeholder="例: 東京都港区六本木1-1-1"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/60 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
              />
              <GlassButton
                onClick={handleCustomAddress}
                disabled={!customAddress.trim()}
                variant="secondary"
              >
                設定
              </GlassButton>
            </div>
          </ResponsiveCard>

          {/* 注意事項 */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText as="h4" size="base" weight="bold" className="text-gray-700 mb-2">
              📝 配達エリアについて
            </ResponsiveText>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 選択したエリアに基づいて配達可能なレストランを検索します</li>
              <li>• 一部エリアでは配達対象外の場合があります</li>
              <li>• より具体的な住所を入力すると検索精度が向上します</li>
              <li>• 現在地を使用すると最も正確な結果が得られます</li>
            </ul>
          </ResponsiveCard>

          {/* 진행ボタン */}
          {canProceed && (
            <div className="text-center mb-6">
              <GlassButton
                onClick={() => window.location.href = '/result'}
                variant="primary"
                className="px-8 py-4 text-lg font-bold"
              >
                🔍 レストランを検索する
              </GlassButton>
            </div>
          )}

          {/* デスクトップ専用クイックアクション */}
          <ShowOn device="desktop">
            <QuickActions 
              actions={[
                { icon: '🏠', label: 'ホーム', action: () => window.location.href = '/' },
                { icon: '🍽️', label: '食事選択', action: () => window.location.href = '/simple-test' },
                { icon: '🎯', label: '現在地取得', action: handleGetCurrentLocation },
                { icon: '🔄', label: 'リセット', action: () => {
                  setSelectedArea('');
                  setCustomAddress('');
                  setUseCurrentLocation(false);
                  setSelectedLocation(null);
                }}
              ]}
            />
          </ShowOn>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 