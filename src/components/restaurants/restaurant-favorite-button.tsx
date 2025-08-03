'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/use-toast'

interface RestaurantFavoriteButtonProps {
  restaurantId: string
  initialFavorite: boolean
}

export default function RestaurantFavoriteButton({ restaurantId, initialFavorite }: RestaurantFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const toggleFavorite = async () => {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'ログインが必要です',
          description: 'お気に入りに追加するにはログインしてください',
          variant: 'destructive',
        })
        router.push('/auth')
        return
      }

      if (isFavorite) {
        // お気に入りから削除
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)

        if (error) throw error

        setIsFavorite(false)
        toast({
          title: 'お気に入りから削除しました',
          description: 'レストランをお気に入りから削除しました',
        })
      } else {
        // お気に入りに追加
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            favorited_at: new Date().toISOString(),
          })

        if (error) throw error

        setIsFavorite(true)
        toast({
          title: 'お気に入りに追加しました',
          description: 'レストランをお気に入りに追加しました',
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'もう一度お試しください',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={toggleFavorite}
      disabled={isLoading}
      variant={isFavorite ? 'default' : 'outline'}
      size="lg"
      className="gap-2"
    >
      {isLoading ? (
        <Icons.spinner className="h-5 w-5 animate-spin" />
      ) : isFavorite ? (
        <Icons.heart className="h-5 w-5 fill-current" />
      ) : (
        <Icons.heart className="h-5 w-5" />
      )}
      {isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
    </Button>
  )
}