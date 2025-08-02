import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { mealType, location, preferences } = body

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('recommend-meals', {
      body: {
        userId: user.id,
        mealType,
        location,
        preferences,
      },
    })

    if (error) {
      console.error('Edge function error:', error)
      return NextResponse.json(
        { error: 'Failed to get recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}