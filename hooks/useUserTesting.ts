// ユーザーテストフックシステム
// テストセッション管理、タスク実行、フィードバック収集

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TestTask {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'selection' | 'interaction' | 'performance';
  expectedTime: number;
  successCriteria: string[];
  steps: string[];
}

export interface TaskResult {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  timeSpent: number;
  errorCount: number;
  satisfactionRating: number;
  difficulty: number;
  comments?: string;
}

export interface UserFeedback {
  overallSatisfaction: number;
  easeOfUse: number;
  visualDesign: number;
  performance: number;
  recommendation: number;
  favoriteFeatures: string[];
  improvements: string[];
  additionalComments: string;
}

export interface TestSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  completedTasks: TaskResult[];
  feedback: UserFeedback;
  usabilityScore: number;
  completed: boolean;
}

// メインユーザーテストフック
export const useUserTesting = () => {
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentTask, setCurrentTask] = useState<TestTask | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [userActions, setUserActions] = useState<any[]>([]);

  // テストタスクリスト
  const testTasks: TestTask[] = [
    {
      id: 'task-food-selection',
      name: '음식 선택 기본 플로우',
      description: 'メインページから食べ物を選択して結果を確認する',
      category: 'selection',
      expectedTime: 60,
      successCriteria: [
        'メインページにアクセス',
        '食べ物選択ボタンをクリック',
        'フィルターを1つ以上選択',
        '結果ページまで到達'
      ],
      steps: [
        'メインページを開く',
        '「今日何食べよう？」ボタンをクリック',
        '好みに応じてフィルターを選択',
        '選択完了ボタンをクリック',
        '結果を確認'
      ]
    },
    {
      id: 'task-restaurant-search',
      name: 'レストラン検索',
      description: '推薦された食べ物のレストランを検索する',
      category: 'navigation',
      expectedTime: 45,
      successCriteria: [
        '結果ページでレストラン検索をクリック',
        '位置情報許可または手動入力',
        'レストランリスト表示確認'
      ],
      steps: [
        '食べ物選択完了後',
        'レストラン検索ボタンをクリック',
        '位置情報を設定',
        'レストランリストを確認'
      ]
    },
    {
      id: 'task-theme-change',
      name: 'テーマ変更',
      description: 'ダークモード・ライトモードを切り替える',
      category: 'interaction',
      expectedTime: 30,
      successCriteria: [
        'テーマ切り替えボタンを発見',
        'ダークモードに変更',
        '変更が反映されることを確認'
      ],
      steps: [
        'ページ上でテーマ切り替え機能を探す',
        'ダークモードに切り替え',
        'デザインの変化を確認'
      ]
    }
  ];

  // テストセッション開始
  const startTestSession = useCallback((userId?: string) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: TestSession = {
      id: sessionId,
      userId: userId || `user-${Date.now()}`,
      startTime: new Date(),
      completedTasks: [],
      feedback: {
        overallSatisfaction: 0,
        easeOfUse: 0,
        visualDesign: 0,
        performance: 0,
        recommendation: 0,
        favoriteFeatures: [],
        improvements: [],
        additionalComments: ''
      },
      usabilityScore: 0,
      completed: false
    };

    setSession(newSession);
    setIsRecording(true);
    console.log(`🧪 ユーザーテスト開始: ${sessionId}`);
    return sessionId;
  }, []);

  // タスク開始
  const startTask = useCallback((taskId: string) => {
    const task = testTasks.find(t => t.id === taskId);
    if (!task || !session) return false;

    setCurrentTask(task);
    setTaskStartTime(new Date());
    setUserActions([]);
    
    console.log(`📋 タスク開始: ${task.name}`);
    return true;
  }, [session, testTasks]);

  // タスク完了
  const completeTask = useCallback((
    satisfactionRating: number,
    difficulty: number,
    comments?: string
  ) => {
    if (!currentTask || !session || !taskStartTime) return false;

    const endTime = new Date();
    const timeSpent = endTime.getTime() - taskStartTime.getTime();

    const taskResult: TaskResult = {
      taskId: currentTask.id,
      startTime: taskStartTime,
      endTime,
      completed: true,
      timeSpent,
      errorCount: userActions.filter(action => action.type === 'error').length,
      satisfactionRating,
      difficulty,
      comments
    };

    const updatedSession = {
      ...session,
      completedTasks: [...session.completedTasks, taskResult]
    };

    setSession(updatedSession);
    setCurrentTask(null);
    setTaskStartTime(null);
    
    console.log(`✅ タスク完了: ${currentTask.id} (${timeSpent}ms)`);
    return true;
  }, [currentTask, session, taskStartTime, userActions]);

  // フィードバック収集
  const collectFeedback = useCallback((feedback: Partial<UserFeedback>) => {
    if (!session) return false;

    const updatedSession = {
      ...session,
      feedback: { ...session.feedback, ...feedback }
    };

    setSession(updatedSession);
    return true;
  }, [session]);

  // テストセッション終了
  const endTestSession = useCallback(() => {
    if (!session) return null;

    const endTime = new Date();
    const usabilityScore = calculateUsabilityScore(session);

    const finalSession = {
      ...session,
      endTime,
      usabilityScore,
      completed: true
    };

    setSession(finalSession);
    setIsRecording(false);
    
    console.log(`🏁 ユーザーテスト終了: スコア ${usabilityScore}`);
    return finalSession;
  }, [session]);

  // ユーザビリティスコア計算
  const calculateUsabilityScore = useCallback((testSession: TestSession): number => {
    if (testSession.completedTasks.length === 0) return 0;

    let score = 0;

    // タスク完了率 (40%)
    const completionRate = testSession.completedTasks.filter(t => t.completed).length / testTasks.length;
    score += completionRate * 40;

    // 平均満足度 (30%)
    const avgSatisfaction = testSession.completedTasks.reduce((sum, task) => sum + task.satisfactionRating, 0) / testSession.completedTasks.length;
    score += (avgSatisfaction / 5) * 30;

    // エラー率 (20%)
    const totalErrors = testSession.completedTasks.reduce((sum, task) => sum + task.errorCount, 0);
    const errorRate = totalErrors / testSession.completedTasks.length;
    score += Math.max(0, (1 - errorRate / 5)) * 20;

    // 全体満足度 (10%)
    score += (testSession.feedback.overallSatisfaction / 5) * 10;

    return Math.round(score);
  }, [testTasks]);

  // ユーザーアクション記録
  const recordUserAction = useCallback((action: any) => {
    if (isRecording) {
      setUserActions(prev => [...prev, { ...action, timestamp: new Date() }]);
    }
  }, [isRecording]);

  // アクション自動追跡設定
  useEffect(() => {
    if (!isRecording) return;

    const handleClick = (event: MouseEvent) => {
      recordUserAction({
        type: 'click',
        element: (event.target as Element)?.tagName,
        coordinates: { x: event.clientX, y: event.clientY }
      });
    };

    const handleError = (event: ErrorEvent) => {
      recordUserAction({
        type: 'error',
        message: event.message
      });
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('error', handleError);
    };
  }, [isRecording, recordUserAction]);

  return {
    // 状态
    session,
    currentTask,
    isRecording,
    testTasks,
    
    // アクション
    startTestSession,
    startTask,
    completeTask,
    collectFeedback,
    endTestSession,
    recordUserAction,
    
    // ユーティリティ
    getProgress: () => session ? (session.completedTasks.length / testTasks.length) * 100 : 0,
    getCompletedTaskCount: () => session?.completedTasks.length || 0,
    getTotalTaskCount: () => testTasks.length
  };
};

// テスト結果分析フック
export const useTestAnalysis = (sessions: TestSession[]) => {
  const [analysis, setAnalysis] = useState({
    averageScore: 0,
    completionRate: 0,
    commonIssues: [] as string[],
    recommendations: [] as string[]
  });

  useEffect(() => {
    if (sessions.length === 0) return;

    // 平均スコア計算
    const averageScore = sessions.reduce((sum, session) => sum + session.usabilityScore, 0) / sessions.length;

    // 完了率計算
    const totalTasks = sessions.length * 3; // 각 세션당 3개 태스크
    const completedTasks = sessions.reduce((sum, session) => sum + session.completedTasks.filter(t => t.completed).length, 0);
    const completionRate = (completedTasks / totalTasks) * 100;

    // 공통 문제점 분석
    const allComments = sessions.flatMap(session => 
      session.completedTasks.map(task => task.comments).filter(Boolean) as string[]
    );
    const commonIssues = [...new Set(allComments)].slice(0, 5);

    // 개선 제안 생성
    const recommendations = [];
    if (averageScore < 70) recommendations.push('전반적인 사용성 개선 필요');
    if (completionRate < 80) recommendations.push('태스크 완료율 향상 필요');

    setAnalysis({
      averageScore,
      completionRate,
      commonIssues,
      recommendations
    });
  }, [sessions]);

  return analysis;
};

// フィードバックフォームフック
export const useFeedbackForm = () => {
  const [feedback, setFeedback] = useState<Partial<UserFeedback>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFeedback = useCallback((field: keyof UserFeedback, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitFeedback = useCallback(() => {
    setIsSubmitted(true);
    console.log('📝 フィードバック送信:', feedback);
    return feedback;
  }, [feedback]);

  const resetForm = useCallback(() => {
    setFeedback({});
    setIsSubmitted(false);
  }, []);

  return {
    feedback,
    isSubmitted,
    updateFeedback,
    submitFeedback,
    resetForm,
    isValid: () => {
      return feedback.overallSatisfaction && 
             feedback.easeOfUse && 
             feedback.visualDesign && 
             feedback.performance;
    }
  };
}; 