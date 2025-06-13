// ユーザーテストダッシュボード
// テストセッション管理、タスク実行、結果分析

'use client';

import { useState, useEffect } from 'react';

interface TestTask {
  id: string;
  name: string;
  description: string;
  category: string;
  expectedTime: number;
  steps: string[];
}

interface TaskResult {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  timeSpent: number;
  satisfactionRating: number;
  difficulty: number;
  comments?: string;
}

interface TestSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  completedTasks: TaskResult[];
  usabilityScore: number;
  completed: boolean;
}

interface UserTestDashboardProps {
  className?: string;
}

export const UserTestDashboard: React.FC<UserTestDashboardProps> = ({
  className = ''
}) => {
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [currentTask, setCurrentTask] = useState<TestTask | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // テストタスクリスト
  const testTasks: TestTask[] = [
    {
      id: 'task-food-selection',
      name: '음식 선택 기본 플로우',
      description: 'メインページから食べ物を選択して結果を確認する',
      category: 'selection',
      expectedTime: 60,
      steps: [
        'メインページを開く',
        '「今日何食べよう？」ボタンをクリック',
        '好みに応じてフィルターを選択',
        '結果を確認'
      ]
    },
    {
      id: 'task-restaurant-search',
      name: 'レストラン検索',
      description: 'レストラン検索機能をテストする',
      category: 'navigation',
      expectedTime: 45,
      steps: [
        '結果ページでレストラン検索をクリック',
        '位置情報を設定',
        'レストランリストを確認'
      ]
    },
    {
      id: 'task-theme-change',
      name: 'テーマ変更',
      description: 'ダークモード・ライトモード切り替え',
      category: 'interaction',
      expectedTime: 30,
      steps: [
        'テーマ切り替え機能を探す',
        'ダークモードに切り替え',
        'デザインの変化を確認'
      ]
    }
  ];

  // テストセッション開始
  const startTestSession = () => {
    const sessionId = `session-${Date.now()}`;
    const newSession: TestSession = {
      id: sessionId,
      userId: `user-${Date.now()}`,
      startTime: new Date(),
      completedTasks: [],
      usabilityScore: 0,
      completed: false
    };

    setCurrentSession(newSession);
    setIsTestActive(true);
    console.log('🧪 ユーザーテスト開始');
  };

  // タスク開始
  const startTask = (task: TestTask) => {
    setCurrentTask(task);
    setTaskStartTime(new Date());
    console.log(`📋 タスク開始: ${task.name}`);
  };

  // タスク完了
  const completeTask = (satisfactionRating: number, difficulty: number, comments: string) => {
    if (!currentTask || !currentSession || !taskStartTime) return;

    const endTime = new Date();
    const timeSpent = endTime.getTime() - taskStartTime.getTime();

    const taskResult: TaskResult = {
      taskId: currentTask.id,
      startTime: taskStartTime,
      endTime,
      completed: true,
      timeSpent,
      satisfactionRating,
      difficulty,
      comments: comments || undefined
    };

    const updatedSession = {
      ...currentSession,
      completedTasks: [...currentSession.completedTasks, taskResult]
    };

    setCurrentSession(updatedSession);
    setCurrentTask(null);
    setTaskStartTime(null);
    
    console.log('✅ タスク完了');
  };

  // テストセッション終了
  const endTestSession = () => {
    if (!currentSession) return;

    const usabilityScore = calculateUsabilityScore(currentSession);
    const finalSession = {
      ...currentSession,
      endTime: new Date(),
      usabilityScore,
      completed: true
    };

    setCurrentSession(finalSession);
    setIsTestActive(false);
    setShowFeedbackForm(true);
    
    console.log(`🏁 テスト終了: スコア ${usabilityScore}`);
  };

  // ユーザビリティスコア計算
  const calculateUsabilityScore = (session: TestSession): number => {
    if (session.completedTasks.length === 0) return 0;

    let score = 0;
    const completionRate = session.completedTasks.filter(t => t.completed).length / testTasks.length;
    score += completionRate * 40;

    const avgSatisfaction = session.completedTasks.reduce((sum, task) => sum + task.satisfactionRating, 0) / session.completedTasks.length;
    score += (avgSatisfaction / 5) * 60;

    return Math.round(score);
  };

  // 進捗計算
  const getProgress = (): number => {
    if (!currentSession) return 0;
    return (currentSession.completedTasks.length / testTasks.length) * 100;
  };

  // 残りタスク取得
  const getRemainingTasks = (): TestTask[] => {
    if (!currentSession) return testTasks;
    const completedTaskIds = currentSession.completedTasks.map(t => t.taskId);
    return testTasks.filter(task => !completedTaskIds.includes(task.id));
  };

  return (
    <div className={`user-test-dashboard ${className}`}>
      {/* ヘッダー */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          🧪 ユーザーテスト
        </h2>
        {currentSession && (
          <div className="session-info">
            <span>セッション: {currentSession.id.slice(-8)}</span>
            <span>進捗: {getProgress().toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* テスト開始前 */}
      {!isTestActive && !currentSession?.completed && (
        <div className="test-intro">
          <h3>ユーザビリティテストへようこそ</h3>
          <p>
            このテストでは、アプリの使いやすさを評価します。
            {testTasks.length}個のタスクを順番に実行してください。
          </p>
          <div className="task-preview">
            <h4>テストタスク一覧:</h4>
            <ul>
              {testTasks.map((task, index) => (
                <li key={task.id}>
                  {index + 1}. {task.name} (予想時間: {task.expectedTime}秒)
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={startTestSession}
            className="start-test-btn"
          >
            テスト開始
          </button>
        </div>
      )}

      {/* テスト実行中 */}
      {isTestActive && currentSession && (
        <div className="test-active">
          {/* 進捗バー */}
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="progress-text">
              {currentSession.completedTasks.length} / {testTasks.length} タスク完了
            </div>
          </div>

          {/* 現在のタスク */}
          {currentTask ? (
            <TaskExecutionPanel
              task={currentTask}
              onComplete={completeTask}
              startTime={taskStartTime}
            />
          ) : (
            <TaskSelectionPanel
              tasks={getRemainingTasks()}
              onTaskSelect={startTask}
              onEndTest={endTestSession}
              allTasksCompleted={getRemainingTasks().length === 0}
            />
          )}
        </div>
      )}

      {/* フィードバックフォーム */}
      {showFeedbackForm && currentSession?.completed && (
        <TestResultsPanel
          session={currentSession}
          onClose={() => setShowFeedbackForm(false)}
        />
      )}

      <style jsx>{`
        .user-test-dashboard {
          background: var(--color-surface, rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border, rgba(255, 255, 255, 0.2));
          border-radius: 16px;
          padding: 2rem;
          margin: 1rem 0;
          max-width: 800px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .session-info {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .test-intro {
          text-align: center;
        }

        .test-intro h3 {
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .test-intro p {
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .task-preview {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .task-preview h4 {
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .task-preview ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .task-preview li {
          color: var(--color-text-secondary);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--color-border);
        }

        .task-preview li:last-child {
          border-bottom: none;
        }

        .start-test-btn {
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-normal, 250ms);
        }

        .start-test-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--color-surface);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: 6px;
          transition: width var(--duration-normal, 250ms) ease;
        }

        .progress-text {
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 640px) {
          .user-test-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .session-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

// タスク実行パネル
interface TaskExecutionPanelProps {
  task: TestTask;
  onComplete: (satisfaction: number, difficulty: number, comments: string) => void;
  startTime: Date | null;
}

const TaskExecutionPanel: React.FC<TaskExecutionPanelProps> = ({
  task,
  onComplete,
  startTime
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [satisfaction, setSatisfaction] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [comments, setComments] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleComplete = () => {
    onComplete(satisfaction, difficulty, comments);
    setShowCompletion(false);
  };

  return (
    <div className="task-execution">
      <div className="task-header">
        <h3>{task.name}</h3>
        <div className="task-timer">
          実行時間: {elapsedTime}秒 / 予想: {task.expectedTime}秒
        </div>
      </div>

      <div className="task-description">
        <p>{task.description}</p>
      </div>

      <div className="task-steps">
        <h4>実行手順:</h4>
        <ol>
          {task.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="task-actions">
        <button
          onClick={() => setShowCompletion(true)}
          className="complete-task-btn"
        >
          タスク完了
        </button>
      </div>

      {showCompletion && (
        <TaskCompletionForm
          satisfaction={satisfaction}
          difficulty={difficulty}
          comments={comments}
          onSatisfactionChange={setSatisfaction}
          onDifficultyChange={setDifficulty}
          onCommentsChange={setComments}
          onSubmit={handleComplete}
          onCancel={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
};

// タスク選択パネル
interface TaskSelectionPanelProps {
  tasks: TestTask[];
  onTaskSelect: (task: TestTask) => void;
  onEndTest: () => void;
  allTasksCompleted: boolean;
}

const TaskSelectionPanel: React.FC<TaskSelectionPanelProps> = ({
  tasks,
  onTaskSelect,
  onEndTest,
  allTasksCompleted
}) => {
  if (allTasksCompleted) {
    return (
      <div className="test-completion">
        <h3>🎉 全てのタスクが完了しました！</h3>
        <p>お疲れ様でした。最後にフィードバックをお聞かせください。</p>
        <button onClick={onEndTest} className="end-test-btn">
          テスト終了・フィードバック入力
        </button>
      </div>
    );
  }

  return (
    <div className="task-selection">
      <h3>次のタスクを選択してください</h3>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <h4>{task.name}</h4>
            <p>{task.description}</p>
            <div className="task-meta">
              <span>カテゴリ: {task.category}</span>
              <span>予想時間: {task.expectedTime}秒</span>
            </div>
            <button
              onClick={() => onTaskSelect(task)}
              className="select-task-btn"
            >
              このタスクを開始
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// その他のコンポーネント型定義は省略... 