// @ts-nocheck
'use client';

import Link from 'next/link';
import PWAStatus from '../components/PWAStatus';
import PerformanceMonitor from '../components/PerformanceMonitor';
import OfflineTestManager from '../components/OfflineTestManager';
import { AnimatedCard } from '../components/ui/animated-card';
import { GlassCard, GlassButton } from '../components/ui/glass-card';
import { gradientText } from '../lib/utils';

export default function HomePage() {

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      <div style={{
        maxWidth: '1000px',
        width: '100%',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        zIndex: 10
      }}>
        {/* ヘッダー */}
        <GlassCard intensity="subtle" className="mb-8">
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${gradientText}`}>
            🍽️ 今日何食べよう？
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-2 text-gray-800">
            Kyou Nani Tabeyou (오늘 뭐먹지)
          </p>
          <p className="text-lg opacity-80 leading-relaxed text-gray-700">
            食事選択から配達・グルメ・レシピまで、日本の一人暮らしのための統合食事プラットフォーム
          </p>
        </GlassCard>

        {/* 主要機能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard gradient glow>
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">食事選択</h3>
            <p className="text-sm opacity-80 text-gray-600">
              ラーメン、寿司、ピザ...今日食べたい料理を簡単に選択できます
            </p>
          </AnimatedCard>

          <AnimatedCard gradient glow>
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">配達連携</h3>
            <p className="text-sm opacity-80 text-gray-600">
              Uber Eats、出前館、Woltで直接注文またはグルメ店検索
            </p>
          </AnimatedCard>

          <AnimatedCard gradient glow>
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">レシピ提供</h3>
            <p className="text-sm opacity-80 text-gray-600">
              自分で作りたい場合は一人分のカスタマイズレシピも提供
            </p>
          </AnimatedCard>
        </div>

        {/* CTA ボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/simple-test">
            <GlassButton 
              className="px-8 py-4 text-lg font-bold min-w-[250px]"
            >
              🍽️ 食事を選択する
            </GlassButton>
          </Link>

          <Link href="/recipes">
            <GlassButton 
              variant="secondary"
              className="px-8 py-4 text-lg font-bold min-w-[250px]"
            >
              📚 全てのレシピを見る
            </GlassButton>
          </Link>
        </div>

        {/* 新機能ボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/food-stats">
            <GlassButton 
              variant="secondary"
              className="px-6 py-3 text-sm font-bold"
            >
              📊 データ統計を見る
            </GlassButton>
          </Link>
        </div>

        {/* アプリ情報 */}
        <GlassCard intensity="medium" className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-gray-800">📱 PWAアプリとしてインストール！</h3>
          <p className="text-sm opacity-80 mb-4 text-gray-600">
            ブラウザで「ホーム画面に追加」を選択すると、ネイティブアプリのように使用できます
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              オフライン使用可能
            </span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              高速起動
            </span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              プッシュ通知
            </span>
          </div>
        </GlassCard>

        {/* フッター */}
        <div className="opacity-80 text-sm text-white">
          <p>Phase 1 MVP • 2025.06 • Made with ❤️ for 一人暮らし</p>
        </div>
      </div>
      
      {/* PWA 状態表示 (開発用) */}
      <PWAStatus />
      
      {/* パフォーマンス監視 (開発用) */}
      <PerformanceMonitor />
      
      {/* オフライン機能テスト (開発用) */}
      <OfflineTestManager />
    </div>
  );
}
