// ユーザーテストシステム
// フィードバック収集、ユーザビリティ分析、タスク完了率測定

export interface TestTask {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'selection' | 'interaction' | 'performance';
  expectedTime: number; // 秒
  successCriteria: string[];
  steps: string[];
}

export interface TestSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    screenSize: { width: number; height: number };
    platform: string;
    browser: string;
  };
  startTime: Date;
  endTime?: Date;
  completedTasks: TaskResult[];
  feedback: UserFeedback;
  usabilityScore: number;
  completed: boolean;
}

export interface TaskResult {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  timeSpent: number;
  errorCount: number;
  helpRequested: boolean;
  successPath: boolean;
  userActions: UserAction[];
  satisfactionRating: number; // 1-5
  difficulty: number; // 1-5
  comments?: string;
}

export interface UserAction {
  timestamp: Date;
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'error';
  element?: string;
  coordinates?: { x: number; y: number };
  value?: string;
  errorType?: string;
}

export interface UserFeedback {
  overallSatisfaction: number; // 1-5
  easeOfUse: number; // 1-5
  visualDesign: number; // 1-5
  performance: number; // 1-5
  recommendation: number; // 1-10 NPS
  favoriteFeatures: string[];
  improvements: string[];
  additionalComments: string;
}

export interface TestReport {
  sessionId: string;
  timestamp: Date;
  overallScore: number;
  taskCompletionRate: number;
  averageTaskTime: number;
  errorRate: number;
  userSatisfaction: number;
  usabilityIssues: UsabilityIssue[];
  recommendations: string[];
  heatmapData: HeatmapPoint[];
}

export interface UsabilityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  occurrence: number;
  affectedTasks: string[];
  suggestedFix: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: Date;
  element?: string;
}

class UserTestingSystem {
  private sessions: Map<string, TestSession> = new Map();
  private testTasks: Map<string, TestTask> = new Map();
  private currentSession: TestSession | null = null;
  private isRecording = false;
  private actionBuffer: UserAction[] = [];

  constructor() {
    this.setupDefaultTasks();
    this.initializeTracking();
  }

  // デフォルトテストタスク設定
  private setupDefaultTasks(): void {
    const tasks: TestTask[] = [
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
          'レストランリスト表示確認',
          '詳細情報確認'
        ],
        steps: [
          '食べ物選択完了後',
          'レストラン検索ボタンをクリック',
          '位置情報を設定',
          'レストランリストを確認',
          '気になるレストランの詳細を見る'
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
          '変更が反映されることを確認',
          'ライトモードに戻す'
        ],
        steps: [
          'ページ上でテーマ切り替え機能を探す',
          'ダークモードに切り替え',
          'デザインの変化を確認',
          'ライトモードに戻す'
        ]
      },
      {
        id: 'task-performance-check',
        name: 'パフォーマンス確認',
        description: 'アプリの応答性と読み込み速度を体感する',
        category: 'performance',
        expectedTime: 90,
        successCriteria: [
          '各ページの読み込み時間が3秒以内',
          'スムーズなアニメーション',
          'ボタン応答の遅延なし',
          '画像の適切な表示'
        ],
        steps: [
          '複数のページを素早く移動',
          'アニメーションの滑らかさをチェック',
          'ボタンの応答性をテスト',
          '画像の読み込みを確認'
        ]
      }
    ];

    tasks.forEach(task => {
      this.testTasks.set(task.id, task);
    });
  }

  // トラッキング初期化
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // クリック追跡
    document.addEventListener('click', (event) => {
      if (this.isRecording) {
        this.recordAction({
          timestamp: new Date(),
          type: 'click',
          element: this.getElementSelector(event.target as Element),
          coordinates: { x: event.clientX, y: event.clientY }
        });
      }
    });

    // スクロール追跡
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      if (this.isRecording) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.recordAction({
            timestamp: new Date(),
            type: 'scroll',
            coordinates: { x: window.scrollX, y: window.scrollY }
          });
        }, 100);
      }
    });

    // エラー追跡
    window.addEventListener('error', (event) => {
      if (this.isRecording) {
        this.recordAction({
          timestamp: new Date(),
          type: 'error',
          errorType: 'javascript',
          value: event.message
        });
      }
    });
  }

  // テストセッション開始
  startTestSession(userId?: string): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: TestSession = {
      id: sessionId,
      userId: userId || `user-${Date.now()}`,
      deviceInfo: this.getDeviceInfo(),
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

    this.sessions.set(sessionId, session);
    this.currentSession = session;
    this.isRecording = true;

    console.log(`🧪 ユーザーテスト開始: ${sessionId}`);
    return sessionId;
  }

  // タスク開始
  startTask(taskId: string): boolean {
    if (!this.currentSession || !this.testTasks.has(taskId)) {
      return false;
    }

    const task = this.testTasks.get(taskId)!;
    
    const taskResult: TaskResult = {
      taskId,
      startTime: new Date(),
      completed: false,
      timeSpent: 0,
      errorCount: 0,
      helpRequested: false,
      successPath: true,
      userActions: [],
      satisfactionRating: 0,
      difficulty: 0
    };

    // 既存のタスク結果があれば更新、なければ追加
    const existingIndex = this.currentSession.completedTasks.findIndex(t => t.taskId === taskId);
    if (existingIndex >= 0) {
      this.currentSession.completedTasks[existingIndex] = taskResult;
    } else {
      this.currentSession.completedTasks.push(taskResult);
    }

    console.log(`📋 タスク開始: ${task.name}`);
    return true;
  }

  // タスク完了
  completeTask(taskId: string, satisfactionRating: number, difficulty: number, comments?: string): boolean {
    if (!this.currentSession) return false;

    const taskResult = this.currentSession.completedTasks.find(t => t.taskId === taskId);
    if (!taskResult) return false;

    taskResult.endTime = new Date();
    taskResult.completed = true;
    taskResult.timeSpent = taskResult.endTime.getTime() - taskResult.startTime.getTime();
    taskResult.satisfactionRating = satisfactionRating;
    taskResult.difficulty = difficulty;
    taskResult.comments = comments;
    taskResult.userActions = [...this.actionBuffer];
    
    // アクションバッファをクリア
    this.actionBuffer = [];

    console.log(`✅ タスク完了: ${taskId} (${taskResult.timeSpent}ms)`);
    return true;
  }

  // ユーザーアクション記録
  private recordAction(action: UserAction): void {
    this.actionBuffer.push(action);
    
    // エラーカウント更新
    if (this.currentSession && action.type === 'error') {
      const currentTask = this.getCurrentTask();
      if (currentTask) {
        currentTask.errorCount++;
      }
    }
  }

  // 現在のタスク取得
  private getCurrentTask(): TaskResult | null {
    if (!this.currentSession) return null;
    
    return this.currentSession.completedTasks.find(task => 
      !task.completed && task.startTime
    ) || null;
  }

  // フィードバック収集
  collectFeedback(feedback: Partial<UserFeedback>): boolean {
    if (!this.currentSession) return false;

    this.currentSession.feedback = {
      ...this.currentSession.feedback,
      ...feedback
    };

    return true;
  }

  // テストセッション終了
  endTestSession(): TestReport | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.currentSession.completed = true;
    this.isRecording = false;

    // ユーザビリティスコア計算
    this.currentSession.usabilityScore = this.calculateUsabilityScore(this.currentSession);

    // レポート生成
    const report = this.generateTestReport(this.currentSession);

    console.log(`🏁 ユーザーテスト終了: スコア ${this.currentSession.usabilityScore}`);
    
    this.currentSession = null;
    return report;
  }

  // ユーザビリティスコア計算
  private calculateUsabilityScore(session: TestSession): number {
    let score = 0;
    let totalWeight = 0;

    // タスク完了率 (40%)
    const completionRate = session.completedTasks.filter(t => t.completed).length / session.completedTasks.length;
    score += completionRate * 40;
    totalWeight += 40;

    // 平均満足度 (30%)
    const avgSatisfaction = session.completedTasks.reduce((sum, task) => sum + task.satisfactionRating, 0) / session.completedTasks.length;
    score += (avgSatisfaction / 5) * 30;
    totalWeight += 30;

    // エラー率 (20%)
    const totalErrors = session.completedTasks.reduce((sum, task) => sum + task.errorCount, 0);
    const errorRate = totalErrors / session.completedTasks.length;
    score += Math.max(0, (1 - errorRate / 5)) * 20; // 最大5エラーで0点

    // 全体満足度 (10%)
    score += (session.feedback.overallSatisfaction / 5) * 10;
    totalWeight += 10;

    return Math.round(score);
  }

  // テストレポート生成
  private generateTestReport(session: TestSession): TestReport {
    const completedTasks = session.completedTasks.filter(t => t.completed);
    const totalTasks = session.completedTasks.length;
    
    const taskCompletionRate = (completedTasks.length / totalTasks) * 100;
    const averageTaskTime = completedTasks.reduce((sum, task) => sum + task.timeSpent, 0) / completedTasks.length;
    const totalErrors = session.completedTasks.reduce((sum, task) => sum + task.errorCount, 0);
    const errorRate = totalErrors / totalTasks;

    // ユーザビリティ問題検出
    const usabilityIssues = this.detectUsabilityIssues(session);

    // 推奨事項生成
    const recommendations = this.generateRecommendations(session, usabilityIssues);

    // ヒートマップデータ生成
    const heatmapData = this.generateHeatmapData(session);

    return {
      sessionId: session.id,
      timestamp: new Date(),
      overallScore: session.usabilityScore,
      taskCompletionRate,
      averageTaskTime,
      errorRate,
      userSatisfaction: session.feedback.overallSatisfaction,
      usabilityIssues,
      recommendations,
      heatmapData
    };
  }

  // ユーザビリティ問題検出
  private detectUsabilityIssues(session: TestSession): UsabilityIssue[] {
    const issues: UsabilityIssue[] = [];

    // 高いエラー率
    const highErrorTasks = session.completedTasks.filter(task => task.errorCount > 2);
    if (highErrorTasks.length > 0) {
      issues.push({
        severity: 'high',
        category: 'エラー',
        description: '複数のタスクで高いエラー率が検出されました',
        occurrence: highErrorTasks.length,
        affectedTasks: highErrorTasks.map(t => t.taskId),
        suggestedFix: 'UIの明確性向上、エラー防止機能の追加'
      });
    }

    // 長い実行時間
    const slowTasks = session.completedTasks.filter(task => {
      const expectedTask = this.testTasks.get(task.taskId);
      return expectedTask && task.timeSpent > expectedTask.expectedTime * 2000; // 2倍以上
    });

    if (slowTasks.length > 0) {
      issues.push({
        severity: 'medium',
        category: 'パフォーマンス',
        description: '期待時間を大幅に超過するタスクがあります',
        occurrence: slowTasks.length,
        affectedTasks: slowTasks.map(t => t.taskId),
        suggestedFix: 'ナビゲーションの改善、ステップ数の削減'
      });
    }

    // 低い満足度
    const unsatisfactoryTasks = session.completedTasks.filter(task => task.satisfactionRating < 3);
    if (unsatisfactoryTasks.length > 0) {
      issues.push({
        severity: 'medium',
        category: '満足度',
        description: '満足度の低いタスクが検出されました',
        occurrence: unsatisfactoryTasks.length,
        affectedTasks: unsatisfactoryTasks.map(t => t.taskId),
        suggestedFix: 'ユーザー体験の改善、フィードバック機能の強化'
      });
    }

    return issues;
  }

  // 推奨事項生成
  private generateRecommendations(session: TestSession, issues: UsabilityIssue[]): string[] {
    const recommendations: string[] = [];

    // 共通推奨事項
    if (session.usabilityScore < 70) {
      recommendations.push('全体的なユーザビリティ改善が必要です');
    }

    // 問題別推奨事項
    issues.forEach(issue => {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        recommendations.push(`優先対応: ${issue.suggestedFix}`);
      }
    });

    // フィードバック基づく推奨事項
    if (session.feedback.improvements.length > 0) {
      recommendations.push('ユーザー要望: ' + session.feedback.improvements.join(', '));
    }

    return recommendations;
  }

  // ヒートマップデータ生成
  private generateHeatmapData(session: TestSession): HeatmapPoint[] {
    const heatmapData: HeatmapPoint[] = [];

    session.completedTasks.forEach(task => {
      task.userActions.forEach(action => {
        if (action.coordinates && action.type === 'click') {
          heatmapData.push({
            x: action.coordinates.x,
            y: action.coordinates.y,
            intensity: 1,
            timestamp: action.timestamp,
            element: action.element
          });
        }
      });
    });

    return heatmapData;
  }

  // デバイス情報取得
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      platform: navigator.platform,
      browser: this.getBrowserName()
    };
  }

  // ブラウザ名取得
  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // 要素セレクタ取得
  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    return element.tagName.toLowerCase();
  }

  // 公開メソッド
  getTestTasks(): TestTask[] {
    return Array.from(this.testTasks.values());
  }

  getSession(sessionId: string): TestSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): TestSession[] {
    return Array.from(this.sessions.values());
  }

  getCurrentSession(): TestSession | null {
    return this.currentSession;
  }
}

export const userTestingSystem = new UserTestingSystem(); 