'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Icons } from '@/components/ui/icons'

const CUISINE_TYPES = [
  { value: '', label: 'すべて' },
  { value: '和食', label: '和食' },
  { value: '洋食', label: '洋食' },
  { value: '中華', label: '中華' },
  { value: 'イタリアン', label: 'イタリアン' },
  { value: 'フレンチ', label: 'フレンチ' },
  { value: '韓国料理', label: '韓国料理' },
  { value: 'エスニック', label: 'エスニック' },
  { value: 'カフェ', label: 'カフェ' },
]

const PRICE_RANGES = [
  { value: '', label: 'すべて' },
  { value: 'budget', label: '¥ (〜¥1,000)' },
  { value: 'moderate', label: '¥¥ (¥1,000〜¥3,000)' },
  { value: 'expensive', label: '¥¥¥ (¥3,000〜¥5,000)' },
  { value: 'luxury', label: '¥¥¥¥ (¥5,000〜)' },
]

export default function RestaurantFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/restaurants?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    
    router.push(`/restaurants?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/restaurants')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>絞り込み検索</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            クリア
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch}>
          <Label htmlFor="search">キーワード検索</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="search"
              name="search"
              placeholder="店名・説明で検索"
              defaultValue={searchParams.get('search') || ''}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Icons.search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* 料理ジャンル */}
        <div>
          <Label>料理ジャンル</Label>
          <RadioGroup
            defaultValue={searchParams.get('cuisine') || ''}
            onValueChange={(value) => handleFilterChange('cuisine', value)}
            className="mt-2"
          >
            {CUISINE_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={`cuisine-${type.value}`} />
                <Label
                  htmlFor={`cuisine-${type.value}`}
                  className="font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 価格帯 */}
        <div>
          <Label>価格帯</Label>
          <RadioGroup
            defaultValue={searchParams.get('priceRange') || ''}
            onValueChange={(value) => handleFilterChange('priceRange', value)}
            className="mt-2"
          >
            {PRICE_RANGES.map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <RadioGroupItem value={range.value} id={`price-${range.value}`} />
                <Label
                  htmlFor={`price-${range.value}`}
                  className="font-normal cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 場所 */}
        <div>
          <Label htmlFor="location">エリア</Label>
          <Input
            id="location"
            placeholder="例: 渋谷、新宿"
            defaultValue={searchParams.get('location') || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}