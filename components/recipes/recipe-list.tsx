import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import type { Database } from '@/lib/supabase/database.types'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeListProps {
  recipes: Recipe[]
}

export default function RecipeList({ recipes }: RecipeListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-0">
              {recipe.image_url ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center">
                  <Icons.camera className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
              {recipe.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {recipe.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {recipe.category && (
                  <Badge variant="secondary">{recipe.category}</Badge>
                )}
                {recipe.cuisine_type && (
                  <Badge variant="outline">{recipe.cuisine_type}</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                {recipe.cooking_time && (
                  <div className="flex items-center gap-1">
                    <Icons.clock className="h-4 w-4" />
                    <span>{recipe.cooking_time}分</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center gap-1">
                    <Icons.barChart className="h-4 w-4" />
                    <span>
                      {recipe.difficulty === 'easy' ? '簡単' :
                       recipe.difficulty === 'medium' ? '普通' : '難しい'}
                    </span>
                  </div>
                )}
                {recipe.cost_estimate && (
                  <div className="flex items-center gap-1">
                    <Icons.dollarSign className="h-4 w-4" />
                    <span>¥{recipe.cost_estimate}</span>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}