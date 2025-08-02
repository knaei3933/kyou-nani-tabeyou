import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'
import RestaurantFavoriteButton from '@/components/restaurants/restaurant-favorite-button'
import type { Database } from '@/lib/supabase/database.types'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // レストランの詳細を取得
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !restaurant) {
    notFound()
  }

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser()

  // お気に入り状態を確認
  let isFavorite = false
  if (user) {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurant.id)
      .single()
    
    isFavorite = !!data
  }

  const getPriceRangeDisplay = (priceRange: string | null) => {
    if (!priceRange) return '¥'
    switch (priceRange) {
      case 'budget':
        return '¥ (〜¥1,000)'
      case 'moderate':
        return '¥¥ (¥1,000〜¥3,000)'
      case 'expensive':
        return '¥¥¥ (¥3,000〜¥5,000)'
      case 'luxury':
        return '¥¥¥¥ (¥5,000〜)'
      default:
        return '¥'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link href="/restaurants">
          <Button variant="ghost" size="sm" className="mb-4">
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            レストラン一覧に戻る
          </Button>
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-muted-foreground">{restaurant.description}</p>
            )}
          </div>
          {user && (
            <RestaurantFavoriteButton
              restaurantId={restaurant.id}
              initialFavorite={isFavorite}
            />
          )}
        </div>
      </div>

      {/* メイン画像 */}
      {restaurant.image_url && (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-6">
          <Image
            src={restaurant.image_url}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 基本情報 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">
                {restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">価格帯</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.dollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">
                {getPriceRangeDisplay(restaurant.price_range)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">料理ジャンル</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base">
              {restaurant.cuisine_type || '未設定'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">基本情報</TabsTrigger>
          <TabsTrigger value="menu">メニュー</TabsTrigger>
          <TabsTrigger value="access">アクセス</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>店舗情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">営業時間</h4>
                <p className="text-muted-foreground">
                  {restaurant.opening_hours || '営業時間の情報がありません'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">電話番号</h4>
                <p className="text-muted-foreground">
                  {restaurant.phone || '電話番号の情報がありません'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">ウェブサイト</h4>
                {restaurant.website ? (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {restaurant.website}
                    <Icons.externalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-muted-foreground">ウェブサイトの情報がありません</p>
                )}
              </div>

              {restaurant.features && (
                <div>
                  <h4 className="font-semibold mb-2">特徴</h4>
                  <div className="flex flex-wrap gap-2">
                    {(restaurant.features as string[]).map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>メニュー情報</CardTitle>
            </CardHeader>
            <CardContent>
              {restaurant.menu_items && Array.isArray(restaurant.menu_items) ? (
                <div className="space-y-3">
                  {(restaurant.menu_items as any[]).map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <span className="font-semibold">¥{item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">メニュー情報がありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>アクセス情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">住所</h4>
                <p className="text-muted-foreground">
                  {restaurant.address || '住所情報がありません'}
                </p>
              </div>

              {restaurant.latitude && restaurant.longitude && (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Icons.mapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      地図機能は Phase 2 で実装予定です
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button size="lg" className="flex-1 sm:flex-initial">
          <Icons.phone className="mr-2 h-4 w-4" />
          電話で予約
        </Button>
        <Button size="lg" variant="outline" className="flex-1 sm:flex-initial">
          <Icons.share className="mr-2 h-4 w-4" />
          共有
        </Button>
        {!user && (
          <Link href="/auth?redirect=/restaurants/[id]" className="flex-1 sm:flex-initial">
            <Button size="lg" variant="secondary" className="w-full">
              <Icons.user className="mr-2 h-4 w-4" />
              ログインしてお気に入りに追加
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}