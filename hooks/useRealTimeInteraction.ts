// リアルタイム相互作用フック
// フィードバック、通知、ソーシャル共有の統合管理

import { useState, useEffect, useCallback } from 'react';
import { 
  realTimeInteractionManager, 
  UserFeedback, 
  RealTimeNotification 
} from '../lib/realTimeInteraction';

// フィードバック管理フック
export const useFeedback = (foodId: string) => {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });

  useEffect(() => {
    const loadFeedbacks = () => {
      const foodFeedbacks = realTimeInteractionManager.getFeedbacksForFood(foodId);
      setFeedbacks(foodFeedbacks);
      
      const rating = realTimeInteractionManager.getAverageRating(foodId);
      setAverageRating(rating);
    };

    loadFeedbacks();

    const handleFeedbackUpdate = (event: any) => {
      if (event.type === 'feedback_added' || event.type === 'feedback_updated') {
        if (event.data.foodId === foodId) {
          loadFeedbacks();
        }
      }
    };

    realTimeInteractionManager.addEventListener(handleFeedbackUpdate);

    return () => {
      realTimeInteractionManager.removeEventListener(handleFeedbackUpdate);
    };
  }, [foodId]);

  const submitFeedback = useCallback(async (
    userId: string,
    rating: number,
    review?: string,
    tags: string[] = []
  ) => {
    setIsSubmitting(true);
    try {
      const feedback = await realTimeInteractionManager.addFeedback({
        userId,
        foodId,
        rating,
        review,
        tags,
        deviceInfo: {
          platform: navigator.platform || 'unknown',
          contextType: 'restaurant' as const
        }
      });
      return feedback;
    } catch (error) {
      console.error('フィードバック提出エラー:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [foodId]);

  const markHelpful = useCallback(async (feedbackId: string) => {
    return await realTimeInteractionManager.markFeedbackHelpful(feedbackId);
  }, []);

  return {
    feedbacks,
    averageRating,
    isSubmitting,
    submitFeedback,
    markHelpful
  };
};

// 通知管理フック
export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = () => {
      const userNotifications = realTimeInteractionManager.getNotifications(userId);
      setNotifications(userNotifications);
      
      const unread = realTimeInteractionManager.getUnreadCount(userId);
      setUnreadCount(unread);
    };

    loadNotifications();

    const checkConnection = () => {
      setIsConnected(realTimeInteractionManager.isConnected());
    };
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    const handleNotificationUpdate = (event: any) => {
      if (event.type === 'notification_added' || event.type === 'notification_received') {
        if (event.data.userId === userId) {
          loadNotifications();
        }
      } else if (event.type === 'notification_read') {
        if (event.data.userId === userId) {
          loadNotifications();
        }
      }
    };

    realTimeInteractionManager.addEventListener(handleNotificationUpdate);

    return () => {
      realTimeInteractionManager.removeEventListener(handleNotificationUpdate);
      clearInterval(connectionInterval);
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    realTimeInteractionManager.markNotificationAsRead(userId, notificationId);
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      if (!notification.read) {
        realTimeInteractionManager.markNotificationAsRead(userId, notification.id);
      }
    });
  }, [userId, notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  };
};

// ソーシャル共有フック
export const useSocialShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareToSocial = useCallback(async (
    userId: string,
    foodId: string,
    platform: 'twitter' | 'instagram' | 'line' | 'facebook',
    message: string,
    imageUrl?: string
  ) => {
    setIsSharing(true);
    try {
      const share = await realTimeInteractionManager.shareToSocial({
        userId,
        foodId,
        platform,
        message,
        imageUrl
      });
      return share;
    } catch (error) {
      console.error('共有エラー:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  }, []);

  const generateShareMessage = useCallback((foodName: string, rating: number) => {
    const templates = [
      `「${foodName}」を食べました！⭐${rating}/5 #今日何食べよう`,
      `${foodName}がおいしかった！評価: ${rating}⭐ #グルメ記録`,
      `今日のご飯: ${foodName} (${rating}⭐) #食事記録`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }, []);

  return {
    isSharing,
    shareToSocial,
    generateShareMessage
  };
};
