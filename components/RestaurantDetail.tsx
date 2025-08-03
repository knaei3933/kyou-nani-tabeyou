'use client'

import { useState } from 'react'
import { RestaurantDetail, MenuItem } from '@/data/details'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Truck, DollarSign, Users } from 'lucide-react'

interface RestaurantDetailProps {
  restaurant: RestaurantDetail
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function RestaurantDetailComponent({ restaurant }: RestaurantDetailProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu')

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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* レストラン基本情報 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
              <p className="text-gray-600 mt-2">{restaurant.description}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  {renderStars(restaurant.rating)}
                  <span className="ml-2 font-semibold">{restaurant.rating}</span>
                  <span className="text-gray-500">({restaurant.reviewCount}件)</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <div className="flex border-b">
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
              <h3 className="text-xl font-bold mb-4">{category}</h3>
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.isPopular && (
                            <Badge variant="destructive" className="text-xs">人気</Badge>
                          )}
                          {item.isRecommended && (
                            <Badge variant="secondary" className="text-xs">おすすめ</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <p className="font-bold text-lg text-blue-600">¥{item.price}</p>
                      </div>
                      <Button
                        onClick={() => addToCart(item)}
                        className="ml-4"
                        size="sm"
                      >
                        カートに追加
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* レビュータブ */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {restaurant.reviews.map((review, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{review.userName}</h4>
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* カート & 注文ボタン */}
      {cart.length > 0 && (
        <Card className="fixed bottom-0 left-0 right-0 m-4 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">カート ({cart.length}品)</p>
                <p className="text-gray-600">
                  {cart.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">合計: ¥{getTotalPrice()}</p>
                <p className="text-sm text-gray-600">
                  + 配送料 ¥{restaurant.deliveryInfo.fee}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={getTotalPrice() < restaurant.deliveryInfo.minOrder}
            >
              {getTotalPrice() < restaurant.deliveryInfo.minOrder
                ? `最低注文金額まで¥${restaurant.deliveryInfo.minOrder - getTotalPrice()}不足`
                : '注文に進む'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 