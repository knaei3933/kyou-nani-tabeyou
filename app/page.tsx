// @ts-nocheck
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SwipeNavigation, TouchButton, MobileNavBar } from '@/components/ui/SwipeNavigation';
import { hapticFeedback } from '@/lib/touch-gestures';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, ShowOn, HideOn, useScreenSize } from '@/components/ui/ResponsiveLayout';
import { SidebarNav, HeaderNav, QuickActions } from '@/components/ui/DesktopNavigation';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { deviceType, isDevice } = useScreenSize();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const steps = [
    { emoji: '🤔', text: 'まず何を食べたいかを選択' },
    { emoji: '📍', text: 'お住まいのエリアを指定' },
    { emoji: '🏪', text: '近くのレストランを検索' },
    { emoji: '🍽️', text: 'メニューを確認して注文' }
  ];

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    hapticFeedback.light();
  };

  const handleStartClick = () => {
    hapticFeedback.success();
    window.location.href = '/simple-test';
  };

  // ナビゲーションアイテム
  const navItems = [
    { icon: '🏠', label: 'ホーム', href: '/', description: 'メインページ' },
    { icon: '🍽️', label: '食事選択', href: '/simple-test', description: '今日の食事を選ぶ' },
    { icon: '📍', label: 'エリア選択', href: '/location-select', description: '配達エリアを指定' },
    { icon: '🔍', label: '検索結果', href: '/result', description: 'レストランを探す' },
    { icon: '🏪', label: '詳細・注文', href: '/restaurant', description: 'メニューと注文' },
  ];

  // クイックアクション
  const quickActions = [
    { icon: '🚀', label: '今すぐ開始', action: handleStartClick },
    { icon: '⭐', label: 'お気に入り', action: () => console.log('お気に入り') },
    { icon: '📱', label: 'アプリ追加', action: () => console.log('PWAインストール') },
    { icon: '💬', label: 'フィードバック', action: () => console.log('フィードバック') },
  ];

  return (
    <SwipeNavigation currentPage="home">
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* デスクトップ用サイドバー */}
      <HideOn device={["mobile", "tablet"]}>
        <div className="fixed left-0 top-0 h-full z-30">
          <SidebarNav 
            items={navItems}
            currentPage="/"
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </HideOn>

      {/* タブレット用ヘッダー */}
      <ShowOn device="tablet">
        <div className="fixed top-0 left-0 right-0 z-30">
          <HeaderNav items={navItems} currentPage="/" />
        </div>
      </ShowOn>

      {/* メインコンテンツエリア */}
      <div className={`transition-all duration-300 ${
        isDevice.desktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 
        isDevice.tablet ? 'mt-16' : ''
      }`}>
      {/* ヒーローセクション */}
      <main className="relative">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 container-mobile safe-area-inset pt-16 pb-12 md:pt-20 md:pb-16">
          {/* ヒーローヘッダー */}
          <div className={`text-center mb-12 md:mb-16 ${isLoaded ? 'animate-fadeInScale' : 'opacity-0'}`}>
            <div className="mb-6 md:mb-8">
              <h1 className="text-responsive-hero font-bold mb-4 md:mb-6">
                <span className="gradient-text">今日</span>
                <span className="block text-gray-800">何食べよう？</span>
              </h1>
              <p className="text-responsive-body text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                食事選択からレストラン検索まで、<br className="hidden sm:block" />
                <span className="font-semibold text-purple-600">4つの簡単なステップ</span>で今日のご飯を決めましょう
              </p>
            </div>

            {/* メインCTAボタン - 터치 최적화 */}
            <div className="space-y-4 px-4">
              <TouchButton 
                variant="primary" 
                size="lg"
                onClick={handleStartClick}
                className="w-full sm:w-auto text-lg md:text-2xl font-bold shadow-xl"
              >
                <span className="mr-2 md:mr-3 text-2xl md:text-3xl animate-bounce-custom">🍽️</span>
                食事選択を始める
                <svg className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </TouchButton>
              
              <p className="text-mobile-sm text-gray-500 px-4">
                約3分で完了 • レストラン検索まで対応
              </p>
            </div>
          </div>

          {/* プロセスフロー */}
          <div className={`${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="text-responsive-title font-bold text-gray-800 mb-3 md:mb-4">簡単4ステップ</h2>
              <p className="text-responsive-body text-gray-600">迷わず進める順次的な問題解決フロー</p>
            </div>

            <ResponsiveGrid 
              cols={{ mobile: 1, tablet: 2, desktop: 4 }}
              gap="lg"
              className="mb-12 md:mb-16"
            >
              {steps.map((step, index) => (
                <ResponsiveCard
                  key={index}
                  variant="default"
                  interactive={true}
                  className={`relative text-center ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.1 * index + 0.5}s` }}
                >
                  <button
                    onMouseEnter={() => setCurrentStep(index)}
                    onClick={() => handleStepClick(index)}
                    className="w-full h-full"
                  >
                    <div className="text-4xl md:text-6xl mb-3 md:mb-4 transform hover:scale-110 active:scale-95 transition-transform">
                      {step.emoji}
                    </div>
                    <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                      {index + 1}
                    </div>
                    <ResponsiveText as="h3" size="lg" weight="semibold" className="text-gray-800 mb-2">
                      ステップ {index + 1}
                    </ResponsiveText>
                    <ResponsiveText as="p" size="sm" className="text-gray-600 leading-relaxed">
                      {step.text}
                    </ResponsiveText>
                  </button>
                </ResponsiveCard>
              ))}
            </ResponsiveGrid>
          </div>

          {/* 特徴セクション */}
          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 3, desktop: 3 }}
            gap="lg"
            className={`mb-12 md:mb-16 ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`}
            style={{ animationDelay: '0.8s' }}
          >
            <ResponsiveCard variant="default" className="text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">⚡</div>
              <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800 mb-2 md:mb-3">
                高速検索
              </ResponsiveText>
              <ResponsiveText as="p" size="sm" className="text-gray-600">
                地域とジャンルを選ぶだけで瞬時に最適なレストランを検索
              </ResponsiveText>
            </ResponsiveCard>

            <ResponsiveCard variant="default" className="text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎯</div>
              <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800 mb-2 md:mb-3">
                正確な提案
              </ResponsiveText>
              <ResponsiveText as="p" size="sm" className="text-gray-600">
                あなたの好みと現在地に基づいた最適な食事選択肢を提供
              </ResponsiveText>
            </ResponsiveCard>

            <ResponsiveCard variant="default" className="text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">📱</div>
              <ResponsiveText as="h3" size="xl" weight="bold" className="text-gray-800 mb-2 md:mb-3">
                直接注文
              </ResponsiveText>
              <ResponsiveText as="p" size="sm" className="text-gray-600">
                レストラン詳細・メニュー確認から注文まで一貫した体験
              </ResponsiveText>
            </ResponsiveCard>
          </ResponsiveGrid>

          {/* サブCTA */}
          <div className={`text-center space-y-6 px-4 ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recipes">
                <button className="btn-mobile-secondary w-full sm:w-auto text-mobile-lg md:text-lg font-semibold text-purple-600 border-2 border-purple-600">
                  📚 レシピを見る
                </button>
              </Link>
              
              <Link href="/food-stats">
                <button className="btn-mobile-secondary w-full sm:w-auto text-mobile-lg md:text-lg font-semibold text-gray-600 border-2 border-gray-300">
                  📊 データ統計
                </button>
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-2">📱 PWAアプリとして利用可能</h3>
              <p className="text-gray-600 text-sm mb-4">
                ホーム画面に追加してネイティブアプリのような体験を
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  オフライン対応
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  高速起動
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  通知機能
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Phase 1 MVP • 2025.06 • 一人暮らしのための統合食事プラットフォーム
            </p>
          </div>
        </div>
             </main>
      </div>
      
      {/* デスクトップ用クイックアクション */}
      <HideOn device={["mobile", "tablet"]}>
        <QuickActions actions={quickActions} />
      </HideOn>
    </div>
    
    {/* モバイル用ナビゲーション */}
    <ShowOn device="mobile">
      <MobileNavBar currentPage="home" />
    </ShowOn>
    </SwipeNavigation>
  );
}
