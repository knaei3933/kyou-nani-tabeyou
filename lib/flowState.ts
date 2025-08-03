// @ts-nocheck
'use client';

// フロー状態管理システム
export interface LocationInfo {
  area: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface RestaurantInfo {
  id: string;
  name: string;
  rating: number;
  priceRange: string;
  deliveryTime: string;
  deliveryFee: string;
}

export interface FlowState {
  currentStep: number;
  completedSteps: number[];
  selectedFoods: string[];
  selectedLocation: LocationInfo | null;
  selectedRestaurant: RestaurantInfo | null;
  timestamp: number;
}

// デフォルト状態
const defaultFlowState: FlowState = {
  currentStep: 1,
  completedSteps: [],
  selectedFoods: [],
  selectedLocation: null,
  selectedRestaurant: null,
  timestamp: Date.now()
};

// LocalStorage キー
const FLOW_STATE_KEY = 'kyou-nani-tabeyou-flow-state';

// フロー状態管理クラス
class FlowStateManager {
  private state: FlowState = defaultFlowState;
  private listeners: ((state: FlowState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  // 状態取得
  getState(): FlowState {
    return { ...this.state };
  }

  // 状態更新
  setState(updates: Partial<FlowState>) {
    this.state = {
      ...this.state,
      ...updates,
      timestamp: Date.now()
    };
    this.saveToStorage();
    this.notifyListeners();
  }

  // 現在のステップ更新
  setCurrentStep(step: number) {
    this.setState({ currentStep: step });
  }

  // ステップ完了マーク
  markStepCompleted(step: number) {
    const completedSteps = [...this.state.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    this.setState({ completedSteps });
  }

  // 食事選択更新
  setSelectedFoods(foods: string[]) {
    this.setState({ selectedFoods: foods });
  }

  // 場所選択更新
  setSelectedLocation(location: LocationInfo) {
    this.setState({ selectedLocation: location });
  }

  // レストラン選択更新
  setSelectedRestaurant(restaurant: RestaurantInfo) {
    this.setState({ selectedRestaurant: restaurant });
  }

  // 次のステップへ進む
  goToNextStep(): number {
    const nextStep = Math.min(this.state.currentStep + 1, 4);
    this.markStepCompleted(this.state.currentStep);
    this.setCurrentStep(nextStep);
    return nextStep;
  }

  // 前のステップに戻る
  goToPrevStep(): number {
    const prevStep = Math.max(this.state.currentStep - 1, 1);
    this.setCurrentStep(prevStep);
    return prevStep;
  }

  // 特定のステップに移動
  goToStep(step: number): number {
    if (step >= 1 && step <= 4) {
      this.setCurrentStep(step);
      return step;
    }
    return this.state.currentStep;
  }

  // ステップ完了チェック
  isStepCompleted(step: number): boolean {
    return this.state.completedSteps.includes(step);
  }

  // ステップ進行可能チェック
  canProceedToStep(step: number): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.state.selectedFoods.length > 0;
      case 3:
        return this.state.selectedLocation !== null;
      case 4:
        return this.state.selectedRestaurant !== null;
      default:
        return false;
    }
  }

  // 状態リセット
  resetFlow() {
    this.state = { ...defaultFlowState };
    this.saveToStorage();
    this.notifyListeners();
  }

  // リスナー追加
  subscribe(listener: (state: FlowState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // LocalStorage保存
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(this.state));
      } catch (error) {
        console.warn('Failed to save flow state to localStorage:', error);
      }
    }
  }

  // LocalStorage読み込み
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FLOW_STATE_KEY);
        if (stored) {
          const parsedState = JSON.parse(stored);
          // データが古い場合（24時間以上）はリセット
          const isExpired = Date.now() - parsedState.timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired) {
            this.state = { ...defaultFlowState, ...parsedState };
          }
        }
      } catch (error) {
        console.warn('Failed to load flow state from localStorage:', error);
      }
    }
  }

  // リスナー通知
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// シングルトンインスタンス
export const flowStateManager = new FlowStateManager();

// React Hook
import { useState, useEffect } from 'react';

export function useFlowState() {
  const [state, setState] = useState<FlowState>(flowStateManager.getState());

  useEffect(() => {
    const unsubscribe = flowStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    setCurrentStep: flowStateManager.setCurrentStep.bind(flowStateManager),
    markStepCompleted: flowStateManager.markStepCompleted.bind(flowStateManager),
    setSelectedFoods: flowStateManager.setSelectedFoods.bind(flowStateManager),
    setSelectedLocation: flowStateManager.setSelectedLocation.bind(flowStateManager),
    setSelectedRestaurant: flowStateManager.setSelectedRestaurant.bind(flowStateManager),
    goToNextStep: flowStateManager.goToNextStep.bind(flowStateManager),
    goToPrevStep: flowStateManager.goToPrevStep.bind(flowStateManager),
    goToStep: flowStateManager.goToStep.bind(flowStateManager),
    isStepCompleted: flowStateManager.isStepCompleted.bind(flowStateManager),
    canProceedToStep: flowStateManager.canProceedToStep.bind(flowStateManager),
    resetFlow: flowStateManager.resetFlow.bind(flowStateManager)
  };
}

// ページ遷移ヘルパー
export const FlowNavigation = {
  // 各ステップのURL
  getStepUrl: (step: number): string => {
    switch (step) {
      case 1: return '/simple-test';
      case 2: return '/location-select';
      case 3: return '/result';
      case 4: return '/restaurant/sample-id'; // 実際のレストランIDに置き換え予定
      default: return '/';
    }
  },

  // 現在のURLからステップ番号取得
  getCurrentStepFromUrl: (pathname: string): number => {
    if (pathname.includes('/simple-test')) return 1;
    if (pathname.includes('/location-select')) return 2;
    if (pathname.includes('/result')) return 3;
    if (pathname.includes('/restaurant')) return 4;
    return 1;
  },

  // ステップ名取得
  getStepName: (step: number): string => {
    switch (step) {
      case 1: return '食事選択';
      case 2: return 'エリア指定';
      case 3: return 'レストラン検索';
      case 4: return 'メニュー確認・注文';
      default: return '不明';
    }
  },

  // ステップ進行率計算
  getProgressPercentage: (currentStep: number): number => {
    return Math.round((currentStep / 4) * 100);
  }
}; 