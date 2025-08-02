'use client'

import { useState, useCallback } from 'react'

export interface MealRecommendation {
  type: 'recipe' | 'restaurant'
  id: string
  name: string
  score: number
  reason: string
  estimatedCost?: number
  cookingTime?: number
  deliveryTime?: string
  distance?: number
}

export interface RecommendationOptions {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  location?: {
    latitude: number
    longitude: number
  }
  preferences?: {
    maxBudget?: number
    maxCookingTime?: number
    cuisineTypes?: string[]
  }
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRecommendations = useCallback(async (options: RecommendationOptions = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      return data.recommendations
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearRecommendations = useCallback(() => {
    setRecommendations([])
    setError(null)
  }, [])

  return {
    recommendations,
    loading,
    error,
    getRecommendations,
    clearRecommendations,
  }
}