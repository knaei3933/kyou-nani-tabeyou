'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Icons } from '@/components/ui/icons'

const categories = [
  { value: 'all', label: 'すべて' },
  { value: 'rice_bowl', label: '丼物' },
  { value: 'noodles', label: '麺類' },
  { value: 'main_dish', label: 'メイン料理' },
  { value: 'side_dish', label: '副菜' },
  { value: 'soup', label: '汁物' },
  { value: 'snack', label: 'スナック' },
]

const difficulties = [
  { value: 'all', label: 'すべて' },
  { value: 'easy', label: '簡単' },
  { value: 'medium', label: '普通' },
  { value: 'hard', label: '難しい' },
]

export default function RecipeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || 'all'
  const difficulty = searchParams.get('difficulty') || 'all'
  const search = searchParams.get('search') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/recipes?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/recipes')
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">検索</Label>
        <div className="relative">
          <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="レシピを検索..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">カテゴリー</Label>
        <RadioGroup value={category} onValueChange={(value) => updateFilter('category', value)}>
          {categories.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={cat.value} id={`category-${cat.value}`} />
              <Label htmlFor={`category-${cat.value}`} className="font-normal cursor-pointer">
                {cat.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">難易度</Label>
        <RadioGroup value={difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
          {difficulties.map((diff) => (
            <div key={diff.value} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={diff.value} id={`difficulty-${diff.value}`} />
              <Label htmlFor={`difficulty-${diff.value}`} className="font-normal cursor-pointer">
                {diff.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="w-full"
      >
        フィルターをクリア
      </Button>
    </div>
  )
}