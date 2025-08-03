import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import RestaurantList from '@/components/restaurants/restaurant-list'
import RestaurantFilters from '@/components/restaurants/restaurant-filters'
import { Card, CardContent } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { cuisine?: string; location?: string; priceRange?: string; search?: string }
}) {
  const supabase = await createClient()

  // クエリの構築
  let query = supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  // フィルタリング
  if (searchParams.cuisine) {
    query = query.eq('cuisine_type', searchParams.cuisine)
  }

  if (searchParams.location) {
    query = query.ilike('address', `%${searchParams.location}%`)
  }

  if (searchParams.priceRange) {
    query = query.eq('price_range', searchParams.priceRange)
  }

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  const { data: restaurants, error } = await query

  if (error) {
    console.error('Error fetching restaurants:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">レストラン検索</h1>
        <p className="text-muted-foreground">
          お近くのレストランを見つけて、美味しい食事を楽しみましょう
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Suspense fallback={<RestaurantFiltersSkeleton />}>
            <RestaurantFilters />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          {restaurants && restaurants.length > 0 ? (
            <RestaurantList restaurants={restaurants} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.mapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">レストランが見つかりません</h3>
                <p className="text-muted-foreground text-center">
                  検索条件を変更してもう一度お試しください
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function RestaurantFiltersSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}