-- 日本料理のレシピデータ
INSERT INTO public.recipes (name, name_en, description, category, cuisine_type, ingredients, instructions, nutrition_info, cooking_time, difficulty, cost_estimate, tags, is_vegetarian, is_vegan, is_gluten_free)
VALUES 
-- 親子丼
('親子丼', 'Oyakodon', '鶏肉と卵を甘辛いタレで煮込んだ定番の丼物', 'rice_bowl', 'japanese', 
 '[{"name": "鶏もも肉", "amount": "200g"}, {"name": "玉ねぎ", "amount": "1/2個"}, {"name": "卵", "amount": "3個"}, {"name": "醤油", "amount": "大さじ2"}, {"name": "みりん", "amount": "大さじ2"}, {"name": "砂糖", "amount": "大さじ1"}, {"name": "だし汁", "amount": "100ml"}, {"name": "ご飯", "amount": "2人分"}]'::jsonb,
 ARRAY['鶏肉を一口大に切る', '玉ねぎを薄切りにする', 'フライパンにだし汁、醤油、みりん、砂糖を入れて煮立てる', '鶏肉と玉ねぎを加えて煮る', '溶き卵を回し入れる', '半熟になったら火を止める', 'ご飯の上に盛り付ける'],
 '{"calories": 680, "protein": 35, "carbs": 72, "fat": 22}'::jsonb,
 20, 'easy', 400, ARRAY['丼物', '鶏肉', '卵', '和食'], false, false, false),

-- カレーライス
('カレーライス', 'Curry Rice', '野菜と肉を煮込んだ日本式カレー', 'curry', 'japanese',
 '[{"name": "豚肉", "amount": "300g"}, {"name": "じゃがいも", "amount": "2個"}, {"name": "にんじん", "amount": "1本"}, {"name": "玉ねぎ", "amount": "1個"}, {"name": "カレールー", "amount": "4皿分"}, {"name": "水", "amount": "600ml"}, {"name": "サラダ油", "amount": "大さじ1"}, {"name": "ご飯", "amount": "4人分"}]'::jsonb,
 ARRAY['野菜と肉を一口大に切る', '鍋で肉を炒める', '野菜を加えて炒める', '水を加えて煮込む', 'アクを取りながら20分煮る', 'カレールーを加えて溶かす', 'とろみがつくまで煮込む', 'ご飯と一緒に盛り付ける'],
 '{"calories": 720, "protein": 25, "carbs": 85, "fat": 28}'::jsonb,
 45, 'easy', 350, ARRAY['カレー', '豚肉', '野菜', '洋食'], false, false, false),

-- 肉じゃが
('肉じゃが', 'Nikujaga', '牛肉とじゃがいもの甘辛煮込み料理', 'main_dish', 'japanese',
 '[{"name": "牛肉薄切り", "amount": "200g"}, {"name": "じゃがいも", "amount": "3個"}, {"name": "にんじん", "amount": "1本"}, {"name": "玉ねぎ", "amount": "1個"}, {"name": "しらたき", "amount": "1袋"}, {"name": "醤油", "amount": "大さじ3"}, {"name": "砂糖", "amount": "大さじ2"}, {"name": "みりん", "amount": "大さじ2"}, {"name": "だし汁", "amount": "300ml"}]'::jsonb,
 ARRAY['野菜を一口大に切る', '鍋で牛肉を炒める', '野菜を加えて炒める', 'だし汁と調味料を加える', '落し蓋をして15分煮る', 'じゃがいもが柔らかくなったら完成'],
 '{"calories": 420, "protein": 18, "carbs": 48, "fat": 16}'::jsonb,
 30, 'medium', 500, ARRAY['煮物', '牛肉', 'じゃがいも', '和食'], false, false, true),

-- 豚の生姜焼き
('豚の生姜焼き', 'Shogayaki', '生姜の効いた豚肉の炒め物', 'main_dish', 'japanese',
 '[{"name": "豚ロース薄切り", "amount": "300g"}, {"name": "生姜", "amount": "1かけ"}, {"name": "醤油", "amount": "大さじ2"}, {"name": "みりん", "amount": "大さじ2"}, {"name": "酒", "amount": "大さじ1"}, {"name": "砂糖", "amount": "小さじ1"}, {"name": "サラダ油", "amount": "大さじ1"}, {"name": "キャベツ", "amount": "1/4個"}]'::jsonb,
 ARRAY['生姜をすりおろす', '調味料を混ぜ合わせる', '豚肉に下味をつける', 'フライパンで豚肉を焼く', 'タレを加えて絡める', 'キャベツの千切りと一緒に盛り付ける'],
 '{"calories": 380, "protein": 28, "carbs": 15, "fat": 24}'::jsonb,
 15, 'easy', 450, ARRAY['炒め物', '豚肉', '生姜', '和食'], false, false, false),

-- 味噌汁
('豆腐とわかめの味噌汁', 'Tofu and Wakame Miso Soup', 'シンプルな定番の味噌汁', 'soup', 'japanese',
 '[{"name": "豆腐", "amount": "1/2丁"}, {"name": "わかめ", "amount": "適量"}, {"name": "味噌", "amount": "大さじ2"}, {"name": "だし汁", "amount": "400ml"}, {"name": "ねぎ", "amount": "適量"}]'::jsonb,
 ARRAY['だし汁を温める', '豆腐を切って加える', 'わかめを加える', '味噌を溶き入れる', '沸騰直前で火を止める', 'ねぎを散らす'],
 '{"calories": 65, "protein": 5, "carbs": 6, "fat": 3}'::jsonb,
 10, 'easy', 100, ARRAY['汁物', '豆腐', '味噌', '和食'], true, false, true),

-- 冷やし中華
('冷やし中華', 'Hiyashi Chuka', '夏の定番冷たい麺料理', 'noodles', 'japanese',
 '[{"name": "中華麺", "amount": "2玉"}, {"name": "きゅうり", "amount": "1本"}, {"name": "ハム", "amount": "4枚"}, {"name": "卵", "amount": "2個"}, {"name": "トマト", "amount": "1個"}, {"name": "醤油", "amount": "大さじ3"}, {"name": "酢", "amount": "大さじ3"}, {"name": "砂糖", "amount": "大さじ2"}, {"name": "ごま油", "amount": "大さじ1"}]'::jsonb,
 ARRAY['錦糸卵を作る', '野菜とハムを細切りにする', '麺を茹でて冷水で締める', 'タレの材料を混ぜる', '麺を皿に盛り具材を乗せる', 'タレをかける'],
 '{"calories": 480, "protein": 18, "carbs": 68, "fat": 15}'::jsonb,
 20, 'easy', 350, ARRAY['麺類', '冷たい', '夏', '中華'], false, false, false),

-- 野菜炒め
('野菜炒め', 'Yasai Itame', 'シャキシャキ野菜の炒め物', 'side_dish', 'japanese',
 '[{"name": "キャベツ", "amount": "1/4個"}, {"name": "もやし", "amount": "1袋"}, {"name": "にんじん", "amount": "1/2本"}, {"name": "ピーマン", "amount": "2個"}, {"name": "豚バラ肉", "amount": "100g"}, {"name": "醤油", "amount": "大さじ1"}, {"name": "塩コショウ", "amount": "適量"}, {"name": "サラダ油", "amount": "大さじ1"}]'::jsonb,
 ARRAY['野菜を食べやすい大きさに切る', '豚肉を炒める', '硬い野菜から順に炒める', '調味料で味を調える', '強火でさっと炒める'],
 '{"calories": 220, "protein": 12, "carbs": 15, "fat": 14}'::jsonb,
 15, 'easy', 250, ARRAY['炒め物', '野菜', '豚肉', '中華'], false, false, true),

-- たこ焼き
('たこ焼き', 'Takoyaki', '大阪名物のタコ入り球状の粉もの', 'snack', 'japanese',
 '[{"name": "たこ", "amount": "200g"}, {"name": "小麦粉", "amount": "200g"}, {"name": "卵", "amount": "2個"}, {"name": "だし汁", "amount": "600ml"}, {"name": "キャベツ", "amount": "100g"}, {"name": "紅生姜", "amount": "適量"}, {"name": "青のり", "amount": "適量"}, {"name": "かつお節", "amount": "適量"}, {"name": "ソース", "amount": "適量"}]'::jsonb,
 ARRAY['生地の材料を混ぜる', 'たこを一口大に切る', 'たこ焼き器を熱する', '生地を流し込む', 'たこと具材を入れる', '竹串で回しながら焼く', 'ソースと青のりをかける'],
 '{"calories": 380, "protein": 15, "carbs": 48, "fat": 12}'::jsonb,
 30, 'medium', 400, ARRAY['粉もの', 'たこ', '大阪', 'スナック'], false, false, false),

-- ラーメン
('醤油ラーメン', 'Shoyu Ramen', 'あっさり醤油味のラーメン', 'noodles', 'japanese',
 '[{"name": "中華麺", "amount": "2玉"}, {"name": "チャーシュー", "amount": "4枚"}, {"name": "メンマ", "amount": "適量"}, {"name": "ねぎ", "amount": "適量"}, {"name": "海苔", "amount": "2枚"}, {"name": "鶏ガラスープ", "amount": "600ml"}, {"name": "醤油", "amount": "大さじ2"}, {"name": "塩", "amount": "小さじ1"}]'::jsonb,
 ARRAY['スープを温める', '醤油と塩で味を調える', '麺を茹でる', '器にスープを注ぐ', '麺を入れる', 'トッピングを乗せる'],
 '{"calories": 520, "protein": 22, "carbs": 68, "fat": 18}'::jsonb,
 15, 'easy', 500, ARRAY['麺類', 'ラーメン', '醤油', '中華'], false, false, false),

-- 天ぷら
('野菜天ぷら', 'Vegetable Tempura', 'サクサクの野菜天ぷら', 'side_dish', 'japanese',
 '[{"name": "さつまいも", "amount": "1本"}, {"name": "なす", "amount": "1本"}, {"name": "ピーマン", "amount": "2個"}, {"name": "しいたけ", "amount": "4個"}, {"name": "小麦粉", "amount": "100g"}, {"name": "冷水", "amount": "150ml"}, {"name": "卵", "amount": "1個"}, {"name": "揚げ油", "amount": "適量"}]'::jsonb,
 ARRAY['野菜を切る', '衣の材料を軽く混ぜる', '油を170度に熱する', '野菜に衣をつける', 'カラッと揚げる', '天つゆと大根おろしを添える'],
 '{"calories": 280, "protein": 6, "carbs": 38, "fat": 12}'::jsonb,
 25, 'medium', 350, ARRAY['揚げ物', '野菜', '天ぷら', '和食'], true, false, false);