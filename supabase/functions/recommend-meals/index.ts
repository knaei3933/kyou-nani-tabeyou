import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  userId: string
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

interface MealRecommendation {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { userId, mealType, location, preferences } = await req.json() as RecommendationRequest

    // Get user profile and preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_preferences(*)')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Get user's meal history (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: mealHistory } = await supabase
      .from('meal_history')
      .select('*, recipes(*), restaurants(*)')
      .eq('user_id', userId)
      .gte('eaten_at', thirtyDaysAgo.toISOString())
      .order('eaten_at', { ascending: false })
      .limit(100)

    // Get current time and determine meal type if not specified
    const now = new Date()
    const currentHour = now.getHours()
    const detectedMealType = mealType || (
      currentHour < 10 ? 'breakfast' :
      currentHour < 15 ? 'lunch' :
      currentHour < 21 ? 'dinner' : 'snack'
    )

    // Build user context for AI
    const userContext = {
      profile: {
        ageGroup: profile.age_group,
        householdType: profile.household_type,
        dietaryRestrictions: profile.dietary_restrictions || [],
        monthlyBudget: profile.monthly_budget,
      },
      preferences: profile.user_preferences?.[0] || {},
      recentMeals: mealHistory?.slice(0, 10).map(h => ({
        name: h.recipes?.name || h.restaurants?.name || h.custom_meal,
        type: h.recipes ? 'recipe' : 'restaurant',
        rating: h.rating,
        daysAgo: Math.floor((now.getTime() - new Date(h.eaten_at).getTime()) / (1000 * 60 * 60 * 24))
      })) || [],
      currentMealType: detectedMealType,
      location: location,
      specificPreferences: preferences,
    }

    // Query available options
    const recipePromise = supabase
      .from('recipes')
      .select('*')
      .limit(50)

    const restaurantPromise = location ? supabase
      .from('restaurants')
      .select('*')
      .limit(20) : Promise.resolve({ data: [] })

    const [recipesResult, restaurantsResult] = await Promise.all([recipePromise, restaurantPromise])

    // Call OpenAI for recommendations
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a food recommendation AI for a Japanese meal planning app. 
            Provide personalized meal recommendations based on user preferences, history, and context.
            Consider dietary restrictions, budget, cooking time, and variety.
            Avoid recommending the same meals eaten recently.
            Return a JSON array of 5 recommendations with scores (0-100) and reasons.`
          },
          {
            role: 'user',
            content: JSON.stringify({
              userContext,
              availableRecipes: recipesResult.data,
              availableRestaurants: restaurantsResult.data,
              task: 'Recommend 5 meals for ' + detectedMealType
            })
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const aiResult = await openaiResponse.json()
    const recommendations = JSON.parse(aiResult.choices[0].message.content).recommendations as MealRecommendation[]

    // Log recommendation event
    await supabase
      .from('recommendation_logs')
      .insert({
        user_id: userId,
        meal_type: detectedMealType,
        recommendations: recommendations,
        context: userContext,
      })

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in recommend-meals function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})