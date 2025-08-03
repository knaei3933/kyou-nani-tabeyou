-- 東京の飲食店データ（架空のデータ）
INSERT INTO public.restaurants (name, name_en, address, location, phone, website, cuisine_types, price_level, rating, review_count, delivery_available, delivery_fee, min_order, delivery_time, opening_hours)
VALUES 
-- 渋谷エリア
('らーめん道場 渋谷店', 'Ramen Dojo Shibuya', '東京都渋谷区道玄坂1-2-3', 
 ST_GeogFromText('POINT(139.7005 35.6590)'),
 '03-1234-5678', 'https://example-ramendojo.com',
 ARRAY['ramen', 'japanese'], 2, 4.2, 856,
 true, 300, 1000, '30-45分',
 '{"mon": "11:00-23:00", "tue": "11:00-23:00", "wed": "11:00-23:00", "thu": "11:00-23:00", "fri": "11:00-24:00", "sat": "11:00-24:00", "sun": "11:00-22:00"}'::jsonb),

('寿司処 魚心', 'Sushi Uoshin', '東京都渋谷区宇田川町15-1',
 ST_GeogFromText('POINT(139.6995 35.6605)'),
 '03-2345-6789', null,
 ARRAY['sushi', 'japanese'], 3, 4.5, 423,
 false, null, null, null,
 '{"mon": "17:00-23:00", "tue": "17:00-23:00", "wed": "17:00-23:00", "thu": "17:00-23:00", "fri": "17:00-24:00", "sat": "17:00-24:00", "sun": "17:00-22:00"}'::jsonb),

('カフェ・ド・パリ', 'Cafe de Paris', '東京都渋谷区神南1-20-15',
 ST_GeogFromText('POINT(139.7015 35.6620)'),
 '03-3456-7890', 'https://example-cafeparis.com',
 ARRAY['cafe', 'french', 'bakery'], 2, 4.0, 567,
 true, 500, 1500, '40-60分',
 '{"mon": "08:00-22:00", "tue": "08:00-22:00", "wed": "08:00-22:00", "thu": "08:00-22:00", "fri": "08:00-23:00", "sat": "08:00-23:00", "sun": "08:00-21:00"}'::jsonb),

-- 新宿エリア
('焼肉 牛角 新宿店', 'Yakiniku Gyukaku Shinjuku', '東京都新宿区歌舞伎町1-18-5',
 ST_GeogFromText('POINT(139.7025 35.6935)'),
 '03-4567-8901', 'https://example-gyukaku.com',
 ARRAY['yakiniku', 'korean', 'bbq'], 3, 4.1, 1234,
 false, null, null, null,
 '{"mon": "17:00-24:00", "tue": "17:00-24:00", "wed": "17:00-24:00", "thu": "17:00-24:00", "fri": "17:00-02:00", "sat": "16:00-02:00", "sun": "16:00-24:00"}'::jsonb),

('中華料理 龍門', 'Chinese Restaurant Ryumon', '東京都新宿区西新宿2-8-1',
 ST_GeogFromText('POINT(139.6912 35.6896)'),
 '03-5678-9012', null,
 ARRAY['chinese', 'dim-sum'], 2, 3.8, 789,
 true, 400, 2000, '35-50分',
 '{"mon": "11:00-22:00", "tue": "11:00-22:00", "wed": "11:00-22:00", "thu": "11:00-22:00", "fri": "11:00-23:00", "sat": "11:00-23:00", "sun": "11:00-22:00"}'::jsonb),

('インドカレー ガンジス', 'Indian Curry Ganges', '東京都新宿区大久保2-32-3',
 ST_GeogFromText('POINT(139.7065 35.7010)'),
 '03-6789-0123', 'https://example-ganges.com',
 ARRAY['indian', 'curry', 'vegetarian'], 2, 4.3, 456,
 true, 300, 1200, '30-40分',
 '{"mon": "11:00-23:00", "tue": "11:00-23:00", "wed": "11:00-23:00", "thu": "11:00-23:00", "fri": "11:00-23:30", "sat": "11:00-23:30", "sun": "11:00-23:00"}'::jsonb),

-- 銀座エリア
('天ぷら 銀座天國', 'Tempura Ginza Tenkoku', '東京都中央区銀座4-5-6',
 ST_GeogFromText('POINT(139.7638 35.6731)'),
 '03-7890-1234', null,
 ARRAY['tempura', 'japanese', 'kaiseki'], 4, 4.7, 234,
 false, null, null, null,
 '{"mon": "11:30-14:00,17:30-21:00", "tue": "11:30-14:00,17:30-21:00", "wed": "closed", "thu": "11:30-14:00,17:30-21:00", "fri": "11:30-14:00,17:30-21:00", "sat": "11:30-14:00,17:30-21:00", "sun": "11:30-14:00,17:30-20:00"}'::jsonb),

('イタリアン トラットリア ソーレ', 'Italian Trattoria Sole', '東京都中央区銀座2-4-6',
 ST_GeogFromText('POINT(139.7672 35.6735)'),
 '03-8901-2345', 'https://example-sole.com',
 ARRAY['italian', 'pasta', 'pizza'], 3, 4.4, 567,
 true, 600, 2500, '45-60分',
 '{"mon": "11:30-15:00,17:30-22:00", "tue": "11:30-15:00,17:30-22:00", "wed": "11:30-15:00,17:30-22:00", "thu": "11:30-15:00,17:30-22:00", "fri": "11:30-15:00,17:30-23:00", "sat": "11:30-23:00", "sun": "11:30-22:00"}'::jsonb),

-- 浅草エリア
('うなぎ 浅草川松', 'Unagi Asakusa Kawamatsu', '東京都台東区浅草1-4-2',
 ST_GeogFromText('POINT(139.7945 35.7115)'),
 '03-9012-3456', null,
 ARRAY['unagi', 'japanese'], 3, 4.6, 345,
 false, null, null, null,
 '{"mon": "11:00-21:00", "tue": "11:00-21:00", "wed": "11:00-21:00", "thu": "closed", "fri": "11:00-21:00", "sat": "11:00-21:00", "sun": "11:00-21:00"}'::jsonb),

('そば処 浅草庵', 'Soba Asakusa-an', '東京都台東区浅草2-3-1',
 ST_GeogFromText('POINT(139.7968 35.7142)'),
 '03-0123-4567', 'https://example-asakusaan.com',
 ARRAY['soba', 'japanese', 'noodles'], 2, 4.2, 678,
 true, 400, 1500, '30-45分',
 '{"mon": "11:00-20:00", "tue": "11:00-20:00", "wed": "11:00-20:00", "thu": "11:00-20:00", "fri": "11:00-20:30", "sat": "11:00-20:30", "sun": "11:00-20:00"}'::jsonb),

-- 池袋エリア
('餃子の王将 池袋店', 'Gyoza no Ohsho Ikebukuro', '東京都豊島区南池袋1-28-2',
 ST_GeogFromText('POINT(139.7112 35.7295)'),
 '03-1234-5678', 'https://example-ohsho.com',
 ARRAY['chinese', 'gyoza', 'ramen'], 1, 3.9, 1567,
 true, 300, 1000, '25-40分',
 '{"mon": "11:00-23:00", "tue": "11:00-23:00", "wed": "11:00-23:00", "thu": "11:00-23:00", "fri": "11:00-24:00", "sat": "11:00-24:00", "sun": "11:00-23:00"}'::jsonb),

('タイ料理 サイアム', 'Thai Restaurant Siam', '東京都豊島区西池袋1-15-9',
 ST_GeogFromText('POINT(139.7085 35.7310)'),
 '03-2345-6789', null,
 ARRAY['thai', 'asian', 'spicy'], 2, 4.1, 345,
 true, 400, 1800, '35-50分',
 '{"mon": "11:30-15:00,17:00-22:30", "tue": "11:30-15:00,17:00-22:30", "wed": "11:30-15:00,17:00-22:30", "thu": "11:30-15:00,17:00-22:30", "fri": "11:30-15:00,17:00-23:00", "sat": "11:30-23:00", "sun": "11:30-22:00"}'::jsonb);