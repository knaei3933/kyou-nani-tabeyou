-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    age_group TEXT CHECK (age_group IN ('10-19', '20-29', '30-39', '40-49', '50-59', '60+')),
    household_type TEXT CHECK (household_type IN ('single', 'couple', 'family', 'shared')),
    dietary_restrictions JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    monthly_budget INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    category TEXT NOT NULL,
    cuisine_type TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions TEXT[],
    nutrition_info JSONB DEFAULT '{}'::jsonb,
    cooking_time INTEGER, -- in minutes
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cost_estimate INTEGER, -- in yen
    image_url TEXT,
    tags TEXT[],
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    place_id TEXT UNIQUE, -- Google Places ID
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    phone TEXT,
    website TEXT,
    cuisine_types TEXT[],
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_fee INTEGER,
    min_order INTEGER,
    delivery_time TEXT, -- e.g., "30-45分"
    opening_hours JSONB,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meal_history table
CREATE TABLE IF NOT EXISTS public.meal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    custom_meal TEXT, -- For meals not in our database
    eaten_at TIMESTAMPTZ DEFAULT NOW(),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes TEXT,
    calories INTEGER,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    favorite_cuisines TEXT[],
    disliked_cuisines TEXT[],
    favorite_ingredients TEXT[],
    disliked_ingredients TEXT[],
    spice_level INTEGER CHECK (spice_level BETWEEN 0 AND 5), -- 0 = no spice, 5 = very spicy
    preferred_cooking_time INTEGER, -- max minutes
    preferred_meal_cost INTEGER, -- max cost in yen
    health_goals TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create health_goals table
CREATE TABLE IF NOT EXISTS public.health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'maintain', 'health_condition')),
    target_weight DECIMAL(4,1),
    target_calories INTEGER,
    target_protein INTEGER, -- grams
    target_carbs INTEGER, -- grams
    target_fat INTEGER, -- grams
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    shared_with UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_recipe UNIQUE(user_id, recipe_id),
    CONSTRAINT unique_user_restaurant UNIQUE(user_id, restaurant_id),
    CONSTRAINT has_favorite CHECK (
        (recipe_id IS NOT NULL AND restaurant_id IS NULL) OR
        (recipe_id IS NULL AND restaurant_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_cuisine ON public.recipes(cuisine_type);
CREATE INDEX idx_recipes_tags ON public.recipes USING gin(tags);
CREATE INDEX idx_restaurants_location ON public.restaurants USING gist(location);
CREATE INDEX idx_restaurants_cuisine ON public.restaurants USING gin(cuisine_types);
CREATE INDEX idx_meal_history_user_date ON public.meal_history(user_id, eaten_at DESC);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON public.health_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();