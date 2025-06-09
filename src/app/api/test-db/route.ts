import { NextResponse } from 'next/server';
import { testTursoConnection, createBasicTables } from '@/lib/db-simple';

export async function GET() {
  try {
    // 1. DB 연결 테스트
    const connectionTest = await testTursoConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: 'DB 연결 실패',
        error: connectionTest.error
      }, { status: 500 });
    }

    // 2. 기본 테이블 생성 테스트
    const tableCreation = await createBasicTables();

    return NextResponse.json({
      success: true,
      message: 'Turso DB 테스트 완료!',
      connectionTest: connectionTest,
      tableCreation: tableCreation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API 에러 발생',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // 샘플 레시피 데이터 삽입 테스트
    const { createClient } = await import('@libsql/client');
    
    const client = createClient({
      url: 'libsql://cook-kimg.aws-ap-northeast-1.turso.io',
      authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MzAyOTUwMzUsImlhdCI6MTc0OTQyNDYzNSwiaWQiOiIxOThjNDk2ZS1lZjNkLTRiODYtOWNlMi1lMDQwNDIwMWVlNmYiLCJyaWQiOiIxYTE4Mjg1MS0yYjE5LTRhYzMtOTdiMS00YzIyMGRkZWZlNjAifQ.24miD7qZD1bTAaqYp5SHdhfKxOuNRx9Ut9nCWESbcU1TfqhMUNrPxfd26htGB_GlwthL6R3ToAB3WFkjcUeSAg'
    });

    const now = Date.now();
    const sampleRecipe = {
      id: `recipe_${now}`,
      title: '간단한 김치볶음밥',
      description: '1인분 김치볶음밥 만들기',
      instructions: '1. 김치를 잘게 썬다\n2. 팬에 기름을 두르고 김치를 볶는다\n3. 밥을 넣고 함께 볶는다\n4. 간장으로 간을 맞춘다',
      cooking_time: 15,
      difficulty: 'easy',
      servings: 1,
      image_url: null,
      created_at: now,
      updated_at: now
    };

    await client.execute({
      sql: `INSERT INTO recipes (id, title, description, instructions, cooking_time, difficulty, servings, image_url, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sampleRecipe.id,
        sampleRecipe.title,
        sampleRecipe.description,
        sampleRecipe.instructions,
        sampleRecipe.cooking_time,
        sampleRecipe.difficulty,
        sampleRecipe.servings,
        sampleRecipe.image_url,
        sampleRecipe.created_at,
        sampleRecipe.updated_at
      ]
    });

    // 삽입된 데이터 확인
    const result = await client.execute('SELECT * FROM recipes ORDER BY created_at DESC LIMIT 5');

    return NextResponse.json({
      success: true,
      message: '샘플 레시피 삽입 완료!',
      insertedRecipe: sampleRecipe,
      recentRecipes: result.rows
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '레시피 삽입 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 