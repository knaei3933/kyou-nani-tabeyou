export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          age_group: '10-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60+' | null
          household_type: 'single' | 'couple' | 'family' | 'shared' | null
          dietary_restrictions: Json
          preferences: Json
          monthly_budget: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          age_group?: '10-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60+' | null
          household_type?: 'single' | 'couple' | 'family' | 'shared' | null
          dietary_restrictions?: Json
          preferences?: Json
          monthly_budget?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          age_group?: '10-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60+' | null
          household_type?: 'single' | 'couple' | 'family' | 'shared' | null
          dietary_restrictions?: Json
          preferences?: Json
          monthly_budget?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          name_en: string | null
          description: string | null
          category: string
          cuisine_type: string | null
          ingredients: Json
          instructions: string[] | null
          nutrition_info: Json
          cooking_time: number | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          cost_estimate: number | null
          image_url: string | null
          tags: string[] | null
          is_vegetarian: boolean
          is_vegan: boolean
          is_gluten_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          description?: string | null
          category: string
          cuisine_type?: string | null
          ingredients?: Json
          instructions?: string[] | null
          nutrition_info?: Json
          cooking_time?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          cost_estimate?: number | null
          image_url?: string | null
          tags?: string[] | null
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          description?: string | null
          category?: string
          cuisine_type?: string | null
          ingredients?: Json
          instructions?: string[] | null
          nutrition_info?: Json
          cooking_time?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          cost_estimate?: number | null
          image_url?: string | null
          tags?: string[] | null
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          name_en: string | null
          place_id: string | null
          address: string | null
          location: unknown | null
          phone: string | null
          website: string | null
          cuisine_types: string[] | null
          price_level: number | null
          rating: number | null
          review_count: number
          delivery_available: boolean
          delivery_fee: number | null
          min_order: number | null
          delivery_time: string | null
          opening_hours: Json | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          place_id?: string | null
          address?: string | null
          location?: unknown | null
          phone?: string | null
          website?: string | null
          cuisine_types?: string[] | null
          price_level?: number | null
          rating?: number | null
          review_count?: number
          delivery_available?: boolean
          delivery_fee?: number | null
          min_order?: number | null
          delivery_time?: string | null
          opening_hours?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          place_id?: string | null
          address?: string | null
          location?: unknown | null
          phone?: string | null
          website?: string | null
          cuisine_types?: string[] | null
          price_level?: number | null
          rating?: number | null
          review_count?: number
          delivery_available?: boolean
          delivery_fee?: number | null
          min_order?: number | null
          delivery_time?: string | null
          opening_hours?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_history: {
        Row: {
          id: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | null
          recipe_id: string | null
          restaurant_id: string | null
          custom_meal: string | null
          eaten_at: string
          rating: number | null
          notes: string | null
          calories: number | null
          location: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | null
          recipe_id?: string | null
          restaurant_id?: string | null
          custom_meal?: string | null
          eaten_at?: string
          rating?: number | null
          notes?: string | null
          calories?: number | null
          location?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | null
          recipe_id?: string | null
          restaurant_id?: string | null
          custom_meal?: string | null
          eaten_at?: string
          rating?: number | null
          notes?: string | null
          calories?: number | null
          location?: unknown | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_cuisines: string[] | null
          disliked_cuisines: string[] | null
          favorite_ingredients: string[] | null
          disliked_ingredients: string[] | null
          spice_level: number | null
          preferred_cooking_time: number | null
          preferred_meal_cost: number | null
          health_goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_cuisines?: string[] | null
          disliked_cuisines?: string[] | null
          favorite_ingredients?: string[] | null
          disliked_ingredients?: string[] | null
          spice_level?: number | null
          preferred_cooking_time?: number | null
          preferred_meal_cost?: number | null
          health_goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_cuisines?: string[] | null
          disliked_cuisines?: string[] | null
          favorite_ingredients?: string[] | null
          disliked_ingredients?: string[] | null
          spice_level?: number | null
          preferred_cooking_time?: number | null
          preferred_meal_cost?: number | null
          health_goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      health_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain' | 'health_condition' | null
          target_weight: number | null
          target_calories: number | null
          target_protein: number | null
          target_carbs: number | null
          target_fat: number | null
          start_date: string | null
          target_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain' | 'health_condition' | null
          target_weight?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          start_date?: string | null
          target_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain' | 'health_condition' | null
          target_weight?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          start_date?: string | null
          target_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          items: Json
          is_active: boolean
          shared_with: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items?: Json
          is_active?: boolean
          shared_with?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: Json
          is_active?: boolean
          shared_with?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string | null
          restaurant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id?: string | null
          restaurant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string | null
          restaurant_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}