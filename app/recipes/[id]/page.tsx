import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'
import FavoriteButton from '@/components/recipes/favorite-button'
import type { Database } from '@/lib/supabase/database.types'

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  nutrition_info?: any
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // レシピの詳細を取得
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !recipe) {
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
      .eq('recipe_id', recipe.id)
      .single()
    
    isFavorite = !!data
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link href="/recipes">
          <Button variant="ghost" size="sm" className="mb-4">
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            レシピ一覧に戻る
          </Button>
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-muted-foreground">{recipe.description}</p>
            )}
          </div>
          {user && (
            <FavoriteButton
              recipeId={recipe.id}
              initialFavorite={isFavorite}
            />
          )}
        </div>
      </div>

      {/* メイン画像 */}
      {recipe.image_url && (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-6">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 基本情報 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">調理時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.clock className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">
                {recipe.cooking_time || 30}分
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">難易度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.barChart className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">
                {recipe.difficulty === 'easy' ? '簡単' :
                 recipe.difficulty === 'medium' ? '普通' : '難しい'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">人数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.users className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">
                {recipe.servings || 2}人分
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">費用目安</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Icons.dollarSign className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">
                ¥{recipe.cost_estimate || 500}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリーバッジ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recipe.category && (
          <Badge variant="secondary" className="text-sm">
            {recipe.category}
          </Badge>
        )}
        {recipe.cuisine_type && (
          <Badge variant="outline" className="text-sm">
            {recipe.cuisine_type}
          </Badge>
        )}
        {recipe.meal_type && (
          <Badge variant="outline" className="text-sm">
            {recipe.meal_type}
          </Badge>
        )}
        {recipe.season && (
          <Badge variant="outline" className="text-sm">
            {recipe.season}の料理
          </Badge>
        )}
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingredients">材料</TabsTrigger>
          <TabsTrigger value="instructions">作り方</TabsTrigger>
          <TabsTrigger value="nutrition">栄養情報</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>材料（{recipe.servings || 2}人分）</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.ingredients && Array.isArray(recipe.ingredients) ? (
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-muted-foreground">{ingredient.amount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">材料情報がありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>作り方</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.instructions && Array.isArray(recipe.instructions) ? (
                <ol className="space-y-4">
                  {recipe.instructions.map((step: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <p className="pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground">作り方の情報がありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>栄養情報（1人分）</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.nutrition_info ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">カロリー</span>
                      <span className="font-medium">{recipe.nutrition_info.calories || 0} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">タンパク質</span>
                      <span className="font-medium">{recipe.nutrition_info.protein || 0} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">脂質</span>
                      <span className="font-medium">{recipe.nutrition_info.fat || 0} g</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">炭水化物</span>
                      <span className="font-medium">{recipe.nutrition_info.carbs || 0} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">食物繊維</span>
                      <span className="font-medium">{recipe.nutrition_info.fiber || 0} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">塩分</span>
                      <span className="font-medium">{recipe.nutrition_info.sodium || 0} mg</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">栄養情報がありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button size="lg" className="flex-1 sm:flex-initial">
          <Icons.shoppingCart className="mr-2 h-4 w-4" />
          買い物リストに追加
        </Button>
        <Button size="lg" variant="outline" className="flex-1 sm:flex-initial">
          <Icons.share className="mr-2 h-4 w-4" />
          共有
        </Button>
        {!user && (
          <Link href="/auth?redirect=/recipes/[id]" className="flex-1 sm:flex-initial">
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