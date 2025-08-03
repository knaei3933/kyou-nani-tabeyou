import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 사용자 테이블
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 레시피 테이블
export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  instructions: text('instructions').notNull(),
  cookingTime: integer('cooking_time').notNull(), // 분 단위
  difficulty: text('difficulty').notNull(), // 'easy', 'medium', 'hard'
  servings: integer('servings').default(1),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 재료 테이블
export const ingredients = sqliteTable('ingredients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // '야채', '고기', '조미료' 등
  unit: text('unit').notNull(), // 'g', 'ml', '개' 등
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 레시피-재료 관계 테이블
export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  ingredientId: text('ingredient_id').notNull().references(() => ingredients.id),
  amount: real('amount').notNull(),
  unit: text('unit').notNull(),
});

// 사용자 냉장고 테이블
export const userFridge = sqliteTable('user_fridge', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  ingredientId: text('ingredient_id').notNull().references(() => ingredients.id),
  amount: real('amount').notNull(),
  unit: text('unit').notNull(),
  expiryDate: integer('expiry_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 사용자 선호도 테이블
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  allergies: text('allergies'), // JSON 배열
  dislikes: text('dislikes'), // JSON 배열
  dietaryRestrictions: text('dietary_restrictions'), // JSON 배열
  preferredCuisines: text('preferred_cuisines'), // JSON 배열
  cookingLevel: text('cooking_level').notNull().default('beginner'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}); 