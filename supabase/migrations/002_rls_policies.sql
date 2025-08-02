-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Recipes policies (public read, admin write)
CREATE POLICY "Recipes are viewable by everyone" ON public.recipes
    FOR SELECT USING (true);

-- Restaurants policies (public read, admin write)
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
    FOR SELECT USING (true);

-- Meal history policies
CREATE POLICY "Users can view own meal history" ON public.meal_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal history" ON public.meal_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal history" ON public.meal_history
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal history" ON public.meal_history
    FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Health goals policies
CREATE POLICY "Users can view own health goals" ON public.health_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health goals" ON public.health_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health goals" ON public.health_goals
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health goals" ON public.health_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Shopping lists policies
CREATE POLICY "Users can view own shopping lists" ON public.shopping_lists
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = ANY(shared_with)
    );

CREATE POLICY "Users can insert own shopping lists" ON public.shopping_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists" ON public.shopping_lists
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists" ON public.shopping_lists
    FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- For anonymous users (read-only access to some tables)
GRANT SELECT ON public.recipes TO anon;
GRANT SELECT ON public.restaurants TO anon;

-- For authenticated users
GRANT SELECT ON public.recipes TO authenticated;
GRANT SELECT ON public.restaurants TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.meal_history TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.health_goals TO authenticated;
GRANT ALL ON public.shopping_lists TO authenticated;
GRANT ALL ON public.favorites TO authenticated;