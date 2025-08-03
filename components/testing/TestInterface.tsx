'use client';

import { useState } from 'react';

interface TestTask {
  id: string;
  name: string;
  description: string;
  steps: string[];
}

export const TestInterface = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const testTasks: TestTask[] = [
    {
      id: 'food-selection',
      name: '음식 선택 테스트',
      description: 'メインページから食べ物を選択する基本フローをテストします',
      steps: [
        'メインページの「今日何食べよう？」ボタンをクリック',
        'お好みのフィルターを選択',
        '結果を確認'
      ]
    },
    {
      id: 'restaurant-search',
      name: 'レストラン検索テスト',
      description: 'レストラン検索機能をテストします',
      steps: [
        '結果ページでレストラン検索をクリック',
        '位置情報を設定',
        'レストランリストを確認'
      ]
    },
    {
      id: 'theme-change',
      name: 'テーマ変更テスト',
      description: 'ダークモード・ライトモード切り替えをテストします',
      steps: [
        'テーマ切り替えボタンを探す',
        'ダークモードに切り替え',
        '変更を確認'
      ]
    }
  ];

  const startTest = () => {
    setIsTestActive(true);
    setCurrentTaskIndex(0);
    setCompletedTasks([]);
  };

  const completeCurrentTask = () => {
    setCompletedTasks(prev => [...prev, currentTaskIndex]);
    
    if (currentTaskIndex < testTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setIsTestActive(false);
    }
  };

  const getCurrentTask = () => testTasks[currentTaskIndex];

  if (!isTestActive) {
    return (
      <div className="test-intro">
        <h2>🧪 ユーザビリティテスト</h2>
        <p>アプリの使いやすさをテストします。{testTasks.length}個のタスクがあります。</p>
        
        <div className="task-list">
          {testTasks.map((task, index) => (
            <div key={task.id} className="task-preview">
              <h4>{index + 1}. {task.name}</h4>
              <p>{task.description}</p>
            </div>
          ))}
        </div>
        
        <button onClick={startTest} className="start-btn">
          テスト開始
        </button>

        <style jsx>{`
          .test-intro {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            max-width: 600px;
            margin: 2rem auto;
          }

          .task-list {
            margin: 2rem 0;
          }

          .task-preview {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: left;
          }

          .task-preview h4 {
            margin: 0 0 0.5rem 0;
            color: var(--color-text);
          }

          .task-preview p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
          }

          .start-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .start-btn:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  const progress = ((completedTasks.length) / testTasks.length) * 100;
  const currentTask = getCurrentTask();

  return (
    <div className="test-active">
      <div className="test-header">
        <h2>タスク {currentTaskIndex + 1} / {testTasks.length}</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="current-task">
        <h3>{currentTask.name}</h3>
        <p>{currentTask.description}</p>
        
        <div className="task-steps">
          <h4>実行手順:</h4>
          <ol>
            {currentTask.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <button onClick={completeCurrentTask} className="complete-btn">
          タスク完了
        </button>
      </div>

      {completedTasks.length === testTasks.length && (
        <div className="test-complete">
          <h3>🎉 テスト完了！</h3>
          <p>お疲れ様でした。全てのタスクが完了しました。</p>
        </div>
      )}

      <style jsx>{`
        .test-active {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          margin: 2rem auto;
        }

        .test-header {
          margin-bottom: 2rem;
        }

        .test-header h2 {
          margin: 0 0 1rem 0;
          color: var(--color-text);
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .current-task {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .current-task h3 {
          margin: 0 0 1rem 0;
          color: var(--color-text);
        }

        .current-task p {
          margin: 0 0 1.5rem 0;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .task-steps h4 {
          margin: 0 0 1rem 0;
          color: var(--color-text);
        }

        .task-steps ol {
          margin: 0 0 2rem 0;
          padding-left: 1.5rem;
          color: var(--color-text-secondary);
        }

        .task-steps li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .complete-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          width: 100%;
        }

        .complete-btn:hover {
          transform: translateY(-2px);
        }

        .test-complete {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
          text-align: center;
        }

        .test-complete h3 {
          margin: 0 0 0.5rem 0;
          color: #4CAF50;
        }

        .test-complete p {
          margin: 0;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}; 