import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// Turso DB 클라이언트 생성
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://cook-kimg.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MzAyOTUwMzUsImlhdCI6MTc0OTQyNDYzNSwiaWQiOiIxOThjNDk2ZS1lZjNkLTRiODYtOWNlMi1lMDQwNDIwMWVlNmYiLCJyaWQiOiIxYTE4Mjg1MS0yYjE5LTRhYzMtOTdiMS00YzIyMGRkZWZlNjAifQ.24miD7qZD1bTAaqYp5SHdhfKxOuNRx9Ut9nCWESbcU1TfqhMUNrPxfd26htGB_GlwthL6R3ToAB3WFkjcUeSAg'
});

// Drizzle ORM 인스턴스 생성
export const db = drizzle(client);

// 연결 테스트 함수
export async function testConnection() {
  try {
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Turso DB 연결 성공:', result);
    return true;
  } catch (error) {
    console.error('❌ Turso DB 연결 실패:', error);
    return false;
  }
} 