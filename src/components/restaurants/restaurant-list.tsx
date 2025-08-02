import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import type { Database } from '@/lib/supabase/database.types'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

interface RestaurantListProps {
  restaurants: Restaurant[]
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  const getPriceRangeDisplay = (priceRange: string | null) => {
    if (!priceRange) return '¥'
    switch (priceRange) {
      case 'budget':
        return '¥'
      case 'moderate':
        return '¥¥'
      case 'expensive':
        return '¥¥¥'
      case 'luxury':
        return '¥¥¥¥'
      default:
        return '¥'
    }
  }

  const getRatingDisplay = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-0">
              {restaurant.image_url ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                  <Image
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-muted rounded-t-lg flex items-center justify-center">
                  <Icons.mapPin className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
                {getRatingDisplay(restaurant.rating)}
              </div>
              
              {restaurant.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {restaurant.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine_type && (
                  <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                )}
                <Badge variant="outline">
                  {getPriceRangeDisplay(restaurant.price_range)}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icons.mapPin className="h-4 w-4" />
                <span className="line-clamp-1">
                  {restaurant.address || '住所情報なし'}
                </span>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}