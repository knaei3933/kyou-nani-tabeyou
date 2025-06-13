// @ts-nocheck
'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { RESTAURANT_DETAILS, RestaurantDetail, MenuItem } from '@/data/details'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FlowNavigationComponent, FlowCompletionDialog } from '../../../components/ui/flow-navigation'
import { useFlowState } from '../../../lib/flowState'
import { Star, Clock, Truck, DollarSign, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, ShowOn, HideOn, useScreenSize } from '../../../components/ui/ResponsiveLayout'
import { SidebarNav, HeaderNav, QuickActions } from '../../../components/ui/DesktopNavigation'

interface CartItem extends MenuItem {
  quantity: number
}

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = RESTAURANT_DETAILS[params.id]
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu')
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 디바이스 타입 감지
  const { deviceType, isDevice } = useScreenSize()

  // フロー状態管理
  const { resetFlow } = useFlowState()

  // ナビゲーションアイテム
  const navItems = [
    { icon: '🏠', label: 'ホーム', href: '/', description: 'メインページ' },
    { icon: '🍽️', label: '食事選択', href: '/simple-test', description: '今日の食事を選ぶ' },
    { icon: '📍', label: 'エリア選択', href: '/location-select', description: '配達エリアを指定' },
    { icon: '🔍', label: '検索結果', href: '/result', description: 'レストランを探す' },
    { icon: '🏪', label: '詳細・注文', href: '/restaurant', description: 'メニューと注文' },
  ]

  if (!restaurant) {
    notFound()
  }

  // カートにアイテム追加
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id)
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  // カート合計計算
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // 注文完了処理
  const handleOrderComplete = () => {
    setShowCompletionDialog(true)
  }

  // 新しい注文開始
  const handleNewOrder = () => {
    resetFlow()
    setShowCompletionDialog(false)
    window.location.href = '/'
  }

  // メニューカテゴリ別グループ化
  const menuByCategory = restaurant.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  // 星評価表示
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* デスクトップ用サイドバー */}
      <HideOn device={["mobile", "tablet"]}>
        <div className="fixed left-0 top-0 h-full z-30">
          <SidebarNav 
            items={navItems}
            currentPage="/restaurant"
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </HideOn>

      {/* タブレット用ヘッダー */}
      <ShowOn device="tablet">
        <div className="fixed top-0 left-0 right-0 z-30">
          <HeaderNav items={navItems} currentPage="/restaurant" />
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
            currentPageStep={4}
            className="mb-6"
          />

          {/* レストラン基本情報 */}
          <ResponsiveCard variant="default" className="mb-6">
            <CardHeader>
              <ResponsiveText as="h1" size="3xl" weight="bold">
                {restaurant.name}
              </ResponsiveText>
              <ResponsiveText as="p" size="base" className="text-gray-600 mt-2">
                {restaurant.description}
              </ResponsiveText>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  {renderStars(restaurant.rating)}
                  <span className="ml-2 font-semibold">{restaurant.rating}</span>
                  <span className="text-gray-500">({restaurant.reviewCount}件)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid 
                cols={{ mobile: 1, tablet: 3, desktop: 3 }}
                gap="md"
              >
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">配送料</p>
                    <p className="text-sm text-gray-600">¥{restaurant.deliveryInfo.fee}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold">配送時間</p>
                    <p className="text-sm text-gray-600">{restaurant.deliveryInfo.estimatedTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">最低注文</p>
                    <p className="text-sm text-gray-600">¥{restaurant.deliveryInfo.minOrder}</p>
                  </div>
                </div>
              </ResponsiveGrid>
            </CardContent>
          </ResponsiveCard>

          {/* タブナビゲーション */}
          <div className="flex border-b bg-white rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'menu'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              メニュー
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              レビュー ({restaurant.reviewCount})
            </button>
          </div>

          {/* メニュータブ */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <ResponsiveText as="h3" size="xl" weight="bold" className="mb-4 text-gray-800">
                    {category}
                  </ResponsiveText>
                  <ResponsiveGrid 
                    cols={{ mobile: 1, tablet: 1, desktop: 2 }}
                    gap="md"
                  >
                    {items.map((item) => (
                      <ResponsiveCard key={item.id} variant="default" className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <ResponsiveText as="h4" size="lg" weight="semibold">
                                {item.name}
                              </ResponsiveText>
                              {item.isPopular && (
                                <Badge variant="destructive" className="text-xs">人気</Badge>
                              )}
                              {item.isRecommended && (
                                <Badge variant="secondary" className="text-xs">おすすめ</Badge>
                              )}
                            </div>
                            <ResponsiveText as="p" size="sm" className="text-gray-600 mb-2">
                              {item.description}
                            </ResponsiveText>
                            <ResponsiveText as="p" size="xl" weight="bold" className="text-blue-600">
                              ¥{item.price}
                            </ResponsiveText>
                          </div>
                          <Button
                            onClick={() => addToCart(item)}
                            className="ml-4 bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            カートに追加
                          </Button>
                        </div>
                      </ResponsiveCard>
                    ))}
                  </ResponsiveGrid>
                </div>
              ))}
            </div>
          )}

          {/* レビュータブ */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {restaurant.reviews.map((review, index) => (
                <ResponsiveCard key={index} variant="default" className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <ResponsiveText as="h4" size="base" weight="semibold">
                          {review.userName}
                        </ResponsiveText>
                        <div className="flex space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <ResponsiveText as="p" size="base" className="text-gray-700">
                        {review.comment}
                      </ResponsiveText>
                    </div>
                  </div>
                </ResponsiveCard>
              ))}
            </div>
          )}

          {/* 底部간격（카트가 있을 때 겹치지 않도록） */}
          {cart.length > 0 && <div className="h-32"></div>}

          {/* デスクトップ専用クイックアクション */}
          <ShowOn device="desktop">
            <QuickActions 
              actions={[
                { icon: '🏠', label: 'ホーム', action: () => window.location.href = '/' },
                { icon: '🔍', label: '検索結果', action: () => window.location.href = '/result' },
                { icon: '📞', label: '店舗情報', action: () => alert(`📞 ${restaurant.name}\n📍 住所: 東京都渋谷区\n⏰ 営業時間: 11:00-22:00`) },
                { icon: '🔄', label: 'リロード', action: () => window.location.reload() }
              ]}
            />
          </ShowOn>
        </ResponsiveContainer>
      </div>

      {/* カート & 注文ボタン */}
      {cart.length > 0 && (
        <Card className={`fixed bottom-0 left-0 right-0 m-4 shadow-2xl border-t-4 border-blue-600 ${
          isDevice.desktop && !sidebarCollapsed ? 'ml-64' : 
          isDevice.desktop && sidebarCollapsed ? 'ml-16' : ''
        }`}>
          <CardContent className="p-4">
            <div className={`flex ${isDevice.mobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
              <div>
                <ResponsiveText as="p" size="lg" weight="semibold">
                  カート ({cart.length}品)
                </ResponsiveText>
                <ResponsiveText as="p" size="sm" className="text-gray-600">
                  {cart.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </ResponsiveText>
              </div>
              <div className={isDevice.mobile ? 'text-left' : 'text-right'}>
                <ResponsiveText as="p" size="xl" weight="bold" className="text-blue-600">
                  合計: ¥{getTotalPrice()}
                </ResponsiveText>
                <ResponsiveText as="p" size="sm" className="text-gray-600">
                  + 配送料 ¥{restaurant.deliveryInfo.fee}
                </ResponsiveText>
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={getTotalPrice() < restaurant.deliveryInfo.minOrder}
              onClick={handleOrderComplete}
            >
              {getTotalPrice() < restaurant.deliveryInfo.minOrder
                ? `最低注文金額まで¥${restaurant.deliveryInfo.minOrder - getTotalPrice()}不足`
                : `注文を確定する (¥${getTotalPrice() + restaurant.deliveryInfo.fee})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* フロー完了ダイアログ */}
      <FlowCompletionDialog
        isOpen={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        onRestart={handleNewOrder}
      />
    </div>
  )
} 