'use client';

import { useState } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'API 호출 실패',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const insertSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST'
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: '샘플 데이터 삽입 실패',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🍳 오늘 뭐먹지 - Turso DB 테스트
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">데이터베이스 연결 테스트</h2>
          
          <div className="space-x-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? '테스트 중...' : 'DB 연결 테스트'}
            </button>
            
            <button
              onClick={insertSampleData}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? '삽입 중...' : '샘플 레시피 삽입'}
            </button>
          </div>

          {testResult && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">테스트 결과:</h3>
              <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  <span className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? '✅ 성공' : '❌ 실패'}
                  </span>
                </div>
                <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.message}
                </p>
                
                {testResult.error && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-800">에러 상세:</p>
                    <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto">
                      {testResult.error}
                    </pre>
                  </div>
                )}

                {testResult.connectionTest && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-800">연결 테스트 데이터:</p>
                    <pre className="text-xs text-green-600 bg-green-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(testResult.connectionTest.data, null, 2)}
                    </pre>
                  </div>
                )}

                {testResult.recentRecipes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-800">최근 레시피:</p>
                    <pre className="text-xs text-green-600 bg-green-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(testResult.recentRecipes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">기술 스택 정보</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Frontend:</strong> Next.js 15.3.3 + TypeScript</li>
            <li>• <strong>Database:</strong> Turso (SQLite Cloud)</li>
            <li>• <strong>ORM:</strong> @libsql/client (직접 연결)</li>
            <li>• <strong>Styling:</strong> Tailwind CSS</li>
            <li>• <strong>Deployment:</strong> Vercel (예정)</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 