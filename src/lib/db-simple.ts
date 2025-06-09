// 간단한 Turso DB 연결 테스트 (Drizzle ORM 없이)
export async function testTursoConnection() {
  try {
    // 동적 import로 libsql 클라이언트 로드
    const { createClient } = await import('@libsql/client');
    
    const client = createClient({
      url: 'libsql://cook-kimg.aws-ap-northeast-1.turso.io',
      authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MzAyOTUwMzUsImlhdCI6MTc0OTQyNDYzNSwiaWQiOiIxOThjNDk2ZS1lZjNkLTRiODYtOWNlMi1lMDQwNDIwMWVlNmYiLCJyaWQiOiIxYTE4Mjg1MS0yYjE5LTRhYzMtOTdiMS00YzIyMGRkZWZlNjAifQ.24miD7qZD1bTAaqYp5SHdhfKxOuNRx9Ut9nCWESbcU1TfqhMUNrPxfd26htGB_GlwthL6R3ToAB3WFkjcUeSAg'
    });

    // 간단한 테스트 쿼리 실행
    const result = await client.execute('SELECT 1 as test, datetime("now") as current_time');
    
    return {
      success: true,
      message: 'Turso DB 연결 성공!',
      data: result.rows
    };
  } catch (error) {
    return {
      success: false,
      message: 'Turso DB 연결 실패',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// 기본 테이블 생성 함수
export async function createBasicTables() {
  try {
    const { createClient } = await import('@libsql/client');
    
    const client = createClient({
      url: 'libsql://cook-kimg.aws-ap-northeast-1.turso.io',
      authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MzAyOTUwMzUsImlhdCI6MTc0OTQyNDYzNSwiaWQiOiIxOThjNDk2ZS1lZjNkLTRiODYtOWNlMi1lMDQwNDIwMWVlNmYiLCJyaWQiOiIxYTE4Mjg1MS0yYjE5LTRhYzMtOTdiMS00YzIyMGRkZWZlNjAifQ.24miD7qZD1bTAaqYp5SHdhfKxOuNRx9Ut9nCWESbcU1TfqhMUNrPxfd26htGB_GlwthL6R3ToAB3WFkjcUeSAg'
    });

    // 기본 테이블 생성 SQL
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        instructions TEXT NOT NULL,
        cooking_time INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        servings INTEGER DEFAULT 1,
        image_url TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ingredients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `;

    await client.executeMultiple(createTablesSQL);
    
    return {
      success: true,
      message: '기본 테이블 생성 완료!'
    };
  } catch (error) {
    return {
      success: false,
      message: '테이블 생성 실패',
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 