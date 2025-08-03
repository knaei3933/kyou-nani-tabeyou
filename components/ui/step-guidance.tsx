// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from './glass-card';

export interface StepGuidance {
  stepId: number;
  title: string;
  message: string;
  actionText: string;
  tips?: string[];
  warning?: string;
  success?: string;
}

interface StepGuidanceProps {
  currentStep: number;
  guidance: StepGuidance[];
  onNext?: () => void;
  onPrev?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  showActions?: boolean;
  className?: string;
}

export const StepGuidanceComponent: React.FC<StepGuidanceProps> = ({
  currentStep,
  guidance,
  onNext,
  onPrev,
  isFirstStep = false,
  isLastStep = false,
  showActions = true,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowTips(false); // ステップ変更時にtipsを閉じる
  }, [currentStep]);

  if (!mounted) return null;

  const currentGuidance = guidance.find(g => g.stepId === currentStep);
  if (!currentGuidance) return null;

  return (
    <div className={`w-full ${className}`}>
      <GlassCard className="mb-6 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full -translate-y-16 translate-x-16 opacity-50" />
        
        <div className="relative z-10">
          {/* ガイダンスヘッダー */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              {currentStep}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {currentGuidance.title}
              </h3>
              <p className="text-gray-600 text-sm">
                ステップ {currentStep} のガイダンス
              </p>
            </div>
          </div>

          {/* メインメッセージ */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              {currentGuidance.message}
            </p>
            
            {/* 警告メッセージ */}
            {currentGuidance.warning && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="text-yellow-400 text-xl mr-3">⚠️</div>
                  <p className="text-yellow-800 text-sm">
                    {currentGuidance.warning}
                  </p>
                </div>
              </div>
            )}

            {/* 成功メッセージ */}
            {currentGuidance.success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="text-green-400 text-xl mr-3">✅</div>
                  <p className="text-green-800 text-sm">
                    {currentGuidance.success}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ヒント・コツセクション */}
          {currentGuidance.tips && currentGuidance.tips.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-3 transition-colors"
              >
                <span className="text-lg mr-2">💡</span>
                ヒント・コツを見る
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${showTips ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showTips && (
                <div className="bg-indigo-50 rounded-lg p-4 animate-fadeInUp">
                  <ul className="space-y-2">
                    {currentGuidance.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 font-bold mr-2 mt-1">•</span>
                        <span className="text-indigo-800 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-3">
              {!isFirstStep && onPrev && (
                <GlassButton
                  onClick={onPrev}
                  variant="secondary"
                  className="sm:w-auto w-full"
                >
                  ← 前のステップ
                </GlassButton>
              )}
              
              <div className="flex-1" />
              
              {!isLastStep && onNext && (
                <GlassButton
                  onClick={onNext}
                  variant="primary"
                  className="sm:w-auto w-full text-lg font-semibold"
                >
                  {currentGuidance.actionText} →
                </GlassButton>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

// ステップ別ガイダンス設定
export const STEP_GUIDANCE: StepGuidance[] = [
  {
    stepId: 1,
    title: '🤔 食事選択',
    message: 'まずは今日食べたい料理を選択してください。複数の料理を選んでも大丈夫です！',
    actionText: 'エリア指定に進む',
    tips: [
      '人気料理フィルターを使うと選びやすくなります',
      '時間帯に合わせて朝食・昼食・夕食から選べます',
      '価格や調理時間でフィルターをかけることも可能です',
      '迷った時は検索機能を使ってみてください'
    ],
    warning: '少なくとも1つの料理を選択してください'
  },
  {
    stepId: 2,
    title: '📍 エリア指定',
    message: 'お住まいのエリアまたは配達を希望するエリアを指定してください。',
    actionText: 'レストラン検索を開始',
    tips: [
      '現在地を自動取得することも可能です',
      '職場や友人の家など、任意の場所を指定できます',
      'より具体的な住所を入力すると検索精度が上がります',
      '配達可能エリア外の場合は近くの店舗を提案します'
    ],
    warning: 'エリアを指定しないとレストラン検索ができません'
  },
  {
    stepId: 3,
    title: '🏪 レストラン検索',
    message: '選択した料理とエリアに基づいて、最適なレストランを検索しています。',
    actionText: 'レストランを選択',
    tips: [
      '評価の高い順・配達時間の早い順で並び替えできます',
      '配達料金も比較して選ぶことをお勧めします',
      'レビューを確認して信頼できる店舗を選びましょう',
      '営業時間も確認してください'
    ],
    success: '複数のレストランが見つかりました！お好みの店舗を選択してください。'
  },
  {
    stepId: 4,
    title: '🍽️ メニュー確認・注文',
    message: 'レストランの詳細とメニューを確認して、注文を完了させましょう。',
    actionText: '注文を確定',
    tips: [
      'メニューの詳細説明を読んで最適な商品を選びましょう',
      '複数の配達アプリを比較して最安値を選択できます',
      'セット商品やお得なキャンペーンもチェックしてください',
      '配達時間と料金を最終確認してから注文しましょう'
    ],
    success: 'おめでとうございます！注文が完了しました。配達をお待ちください。'
  }
];

// ガイダンス管理フック
export const useStepGuidance = (initialStep: number = 1) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const markStepCompleted = (stepId: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  };
  
  const isStepCompleted = (stepId: number) => {
    return completedSteps.includes(stepId);
  };
  
  const nextStep = () => {
    markStepCompleted(currentStep);
    if (currentStep < STEP_GUIDANCE.length) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (stepId: number) => {
    if (stepId >= 1 && stepId <= STEP_GUIDANCE.length) {
      setCurrentStep(stepId);
    }
  };
  
  const getCurrentGuidance = () => {
    return STEP_GUIDANCE.find(g => g.stepId === currentStep);
  };
  
  return {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    markStepCompleted,
    isStepCompleted,
    getCurrentGuidance,
    guidance: STEP_GUIDANCE
  };
}; 