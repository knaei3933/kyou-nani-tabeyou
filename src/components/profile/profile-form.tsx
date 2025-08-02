'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

const dietaryOptions = [
  { id: 'vegetarian', label: 'ベジタリアン' },
  { id: 'vegan', label: 'ビーガン' },
  { id: 'gluten_free', label: 'グルテンフリー' },
  { id: 'halal', label: 'ハラル' },
  { id: 'kosher', label: 'コーシャ' },
  { id: 'low_carb', label: '低炭水化物' },
  { id: 'dairy_free', label: '乳製品不使用' },
  { id: 'nut_allergy', label: 'ナッツアレルギー' },
]

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age_group: profile?.age_group || '',
    household_type: profile?.household_type || '',
    monthly_budget: profile?.monthly_budget?.toString() || '',
    dietary_restrictions: (profile?.dietary_restrictions as string[]) || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age_group: formData.age_group as any,
          household_type: formData.household_type as any,
          monthly_budget: formData.monthly_budget ? parseInt(formData.monthly_budget) : null,
          dietary_restrictions: formData.dietary_restrictions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Check if this is the first time setting up profile
      if (!profile?.full_name) {
        // First time setup, create user preferences
        await supabase.from('user_preferences').insert({
          user_id: user.id,
        })
      }

      router.push('/')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDietaryChange = (dietaryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: checked
        ? [...prev.dietary_restrictions, dietaryId]
        : prev.dietary_restrictions.filter(id => id !== dietaryId),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">お名前</Label>
        <Input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="山田 太郎"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age_group">年齢層</Label>
        <Select
          value={formData.age_group}
          onValueChange={(value) => setFormData({ ...formData, age_group: value })}
        >
          <SelectTrigger id="age_group">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10-19">10-19歳</SelectItem>
            <SelectItem value="20-29">20-29歳</SelectItem>
            <SelectItem value="30-39">30-39歳</SelectItem>
            <SelectItem value="40-49">40-49歳</SelectItem>
            <SelectItem value="50-59">50-59歳</SelectItem>
            <SelectItem value="60+">60歳以上</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="household_type">世帯タイプ</Label>
        <Select
          value={formData.household_type}
          onValueChange={(value) => setFormData({ ...formData, household_type: value })}
        >
          <SelectTrigger id="household_type">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">一人暮らし</SelectItem>
            <SelectItem value="couple">夫婦・カップル</SelectItem>
            <SelectItem value="family">ファミリー</SelectItem>
            <SelectItem value="shared">シェアハウス</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_budget">月間食費予算（円）</Label>
        <Input
          id="monthly_budget"
          type="number"
          value={formData.monthly_budget}
          onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
          placeholder="30000"
        />
      </div>

      <div className="space-y-2">
        <Label>食事制限・アレルギー</Label>
        <div className="grid grid-cols-2 gap-4">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={formData.dietary_restrictions.includes(option.id)}
                onCheckedChange={(checked) => handleDietaryChange(option.id, checked as boolean)}
              />
              <Label
                htmlFor={option.id}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            '保存'
          )}
        </Button>
        {!profile?.full_name && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            スキップ
          </Button>
        )}
      </div>
    </form>
  )
}