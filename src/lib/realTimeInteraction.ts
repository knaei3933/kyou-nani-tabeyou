// リアルタイム相互作用システム
// ユーザーフィードバック、評価、リアルタイム通知管理

export interface UserFeedback {
  id: string;
  userId: string;
  foodId: string;
  rating: number; // 1-5
  review?: string;
  tags: string[]; // ['美味しい', '安い', '早い' など]
  timestamp: Date;
  helpful: number; // 他のユーザーからの「役立つ」評価
  deviceInfo: {
    platform: string;
    location?: { lat: number; lng: number };
    contextType: 'restaurant' | 'delivery' | 'home_cooking';
  };
}

export interface SocialShare {
  id: string;
  userId: string;
  foodId: string;
  platform: 'twitter' | 'instagram' | 'line' | 'facebook';
  message: string;
  imageUrl?: string;
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface RealTimeNotification {
  id: string;
  userId: string;
  type: 'recommendation' | 'social' | 'achievement' | 'reminder';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high';
}

class RealTimeInteractionManager {
  private feedbacks: Map<string, UserFeedback[]> = new Map();
  private notifications: Map<string, RealTimeNotification[]> = new Map();
  private socialShares: SocialShare[] = [];
  private webSocket: WebSocket | null = null;
  private listeners: Set<(event: any) => void> = new Set();

  constructor() {
    this.initializeWebSocket();
    this.loadStoredData();
  }

  // WebSocket接続を初期化
  private initializeWebSocket() {
    try {
      // 開発環境では模擬WebSocketを使用
      if (process.env.NODE_ENV === 'development') {
        this.simulateWebSocket();
        return;
      }

      this.webSocket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      this.webSocket.onopen = () => {
        console.log('WebSocket接続が確立されました');
      };

      this.webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.webSocket.onclose = () => {
        console.log('WebSocket接続が閉じられました');
        // 再接続を試行
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.webSocket.onerror = (error) => {
        console.error('WebSocketエラー:', error);
      };
    } catch (error) {
      console.error('WebSocket初期化エラー:', error);
    }
  }

  // 開発環境用模擬WebSocket
  private simulateWebSocket() {
    setInterval(() => {
      // 模擬通知を送信
      const mockNotifications = [
        { type: 'recommendation', message: '新しい推薦があります！' },
        { type: 'social', message: 'あなたのレビューに「いいね」がつきました' },
        { type: 'achievement', message: 'レベルアップしました！' }
      ];

      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      this.notifyListeners({
        type: 'notification',
        data: randomNotification
      });
    }, 30000); // 30秒ごと
  }

  // WebSocketメッセージハンドリング
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'feedback_update':
        this.handleFeedbackUpdate(data.payload);
        break;
      case 'notification':
        this.handleNotificationReceived(data.payload);
        break;
      case 'social_activity':
        this.handleSocialActivity(data.payload);
        break;
      default:
        console.log('未知のメッセージタイプ:', data.type);
    }
  }

  // WebSocketからのフィードバック更新処理
  private handleFeedbackUpdate(payload: any) {
    this.notifyListeners({
      type: 'feedback_updated',
      data: payload
    });
  }

  // WebSocketからの通知受信処理
  private handleNotificationReceived(payload: RealTimeNotification) {
    const userNotifications = this.notifications.get(payload.userId) || [];
    userNotifications.unshift(payload);
    this.notifications.set(payload.userId, userNotifications);
    
    this.notifyListeners({
      type: 'notification_received',
      data: payload
    });
  }

  // WebSocketからのソーシャル活動処理
  private handleSocialActivity(payload: any) {
    this.notifyListeners({
      type: 'social_activity',
      data: payload
    });
  }

  // フィードバック追加
  async addFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'helpful'>): Promise<UserFeedback> {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: new Date(),
      helpful: 0
    };

    const foodFeedbacks = this.feedbacks.get(feedback.foodId) || [];
    foodFeedbacks.push(newFeedback);
    this.feedbacks.set(feedback.foodId, foodFeedbacks);

    // ローカルストレージに保存
    this.saveToStorage('feedbacks', Object.fromEntries(this.feedbacks));

    // WebSocketで送信
    this.sendWebSocketMessage({
      type: 'new_feedback',
      payload: newFeedback
    });

    // リスナーに通知
    this.notifyListeners({
      type: 'feedback_added',
      data: newFeedback
    });

    return newFeedback;
  }

  // 音食に対するフィードバック取得
  getFeedbacksForFood(foodId: string): UserFeedback[] {
    return this.feedbacks.get(foodId) || [];
  }

  // 平均評価計算
  getAverageRating(foodId: string): { average: number; count: number } {
    const foodFeedbacks = this.getFeedbacksForFood(foodId);
    
    if (foodFeedbacks.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = foodFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return {
      average: total / foodFeedbacks.length,
      count: foodFeedbacks.length
    };
  }

  // フィードバックに「役立つ」評価
  async markFeedbackHelpful(feedbackId: string): Promise<boolean> {
    for (const [foodId, feedbacks] of this.feedbacks.entries()) {
      const feedback = feedbacks.find(f => f.id === feedbackId);
      if (feedback) {
        feedback.helpful += 1;
        this.saveToStorage('feedbacks', Object.fromEntries(this.feedbacks));
        
        this.notifyListeners({
          type: 'feedback_updated',
          data: feedback
        });
        
        return true;
      }
    }
    return false;
  }

  // ソーシャル共有
  async shareToSocial(share: Omit<SocialShare, 'id' | 'timestamp' | 'engagement'>): Promise<SocialShare> {
    const newShare: SocialShare = {
      ...share,
      id: this.generateId(),
      timestamp: new Date(),
      engagement: { likes: 0, shares: 0, comments: 0 }
    };

    this.socialShares.push(newShare);
    this.saveToStorage('socialShares', this.socialShares);

    // プラットフォーム別の共有URL生成
    const shareUrl = this.generateShareUrl(newShare);
    
    // 新しいウィンドウで共有ページを開く
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    this.notifyListeners({
      type: 'social_shared',
      data: newShare
    });

    return newShare;
  }

  // プラットフォーム別共有URL生成
  private generateShareUrl(share: SocialShare): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const encodedMessage = encodeURIComponent(share.message);
    const url = `${baseUrl}/food/${share.foodId}`;

    switch (share.platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'line':
        return `https://social-plugins.line.me/lineit/share?url=${url}&text=${encodedMessage}`;
      default:
        return url;
    }
  }

  // 通知追加
  async addNotification(notification: Omit<RealTimeNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: RealTimeNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification); // 新しい通知を先頭に
    
    // 最大50件まで保持
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    this.notifications.set(notification.userId, userNotifications);
    this.saveToStorage('notifications', Object.fromEntries(this.notifications));

    this.notifyListeners({
      type: 'notification_added',
      data: newNotification
    });
  }

  // ユーザー通知取得
  getNotifications(userId: string): RealTimeNotification[] {
    return this.notifications.get(userId) || [];
  }

  // 未読通知数
  getUnreadCount(userId: string): number {
    const userNotifications = this.getNotifications(userId);
    return userNotifications.filter(n => !n.read).length;
  }

  // 通知を既読にマーク
  markNotificationAsRead(userId: string, notificationId: string): void {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.saveToStorage('notifications', Object.fromEntries(this.notifications));
      
      this.notifyListeners({
        type: 'notification_read',
        data: notification
      });
    }
  }

  // イベントリスナー管理
  addEventListener(listener: (event: any) => void): void {
    this.listeners.add(listener);
  }

  removeEventListener(listener: (event: any) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(event: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('リスナーエラー:', error);
      }
    });
  }

  // WebSocketメッセージ送信
  private sendWebSocketMessage(message: any): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    }
  }

  // ユーティリティメソッド
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private loadStoredData(): void {
    try {
      const storedFeedbacks = localStorage.getItem('rtm_feedbacks');
      if (storedFeedbacks) {
        const data = JSON.parse(storedFeedbacks);
        this.feedbacks = new Map(Object.entries(data));
      }

      const storedNotifications = localStorage.getItem('rtm_notifications');
      if (storedNotifications) {
        const data = JSON.parse(storedNotifications);
        this.notifications = new Map(Object.entries(data));
      }

      const storedShares = localStorage.getItem('rtm_socialShares');
      if (storedShares) {
        this.socialShares = JSON.parse(storedShares);
      }
    } catch (error) {
      console.error('ストレージデータの読み込みに失敗:', error);
    }
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`rtm_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('ストレージへの保存に失敗:', error);
    }
  }

  // WebSocket接続状態
  isConnected(): boolean {
    return this.webSocket?.readyState === WebSocket.OPEN;
  }

  // クリーンアップ
  destroy(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
export const realTimeInteractionManager = new RealTimeInteractionManager(); 