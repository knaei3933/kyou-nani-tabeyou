// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ProgressFlow, FLOW_STEPS } from './progress-flow';
import { StepGuidanceComponent, STEP_GUIDANCE } from './step-guidance';
import { useFlowState, FlowNavigation } from '../../lib/flowState';
import { GlassCard, GlassButton } from './glass-card';

interface FlowNavigationProps {
  currentPageStep?: number;
  showProgress?: boolean;
  showGuidance?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export const FlowNavigationComponent: React.FC<FlowNavigationProps> = ({
  currentPageStep,
  showProgress = true,
  showGuidance = true,
  showNavigation = true,
  className = ''
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { state, setCurrentStep, goToNextStep, goToPrevStep, canProceedToStep } = useFlowState();

  // URL同期
  useEffect(() => {
    const urlStep = FlowNavigation.getCurrentStepFromUrl(pathname);
    if (currentPageStep) {
      setCurrentStep(currentPageStep);
    } else if (urlStep !== state.currentStep) {
      setCurrentStep(urlStep);
    }
  }, [pathname, currentPageStep, setCurrentStep, state.currentStep]);

  // ナビゲーションハンドラー
  const handleNext = () => {
    const nextStep = goToNextStep();
    const nextUrl = FlowNavigation.getStepUrl(nextStep);
    
    // スムーズな遷移のための遅延
    setTimeout(() => {
      router.push(nextUrl);
    }, 300);
  };

  const handlePrev = () => {
    const prevStep = goToPrevStep();
    const prevUrl = FlowNavigation.getStepUrl(prevStep);
    
    setTimeout(() => {
      router.push(prevUrl);
    }, 300);
  };

  const handleStepClick = (stepNumber: number) => {
    if (canProceedToStep(stepNumber)) {
      const stepUrl = FlowNavigation.getStepUrl(stepNumber);
      setCurrentStep(stepNumber);
      
      setTimeout(() => {
        router.push(stepUrl);
      }, 200);
    }
  };

  // 進行可能性チェック
  const canGoNext = state.currentStep < 4 && canProceedToStep(state.currentStep + 1);
  const canGoPrev = state.currentStep > 1;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* プログレス表示 */}
      {showProgress && (
        <ProgressFlow
          currentStep={state.currentStep}
          steps={FLOW_STEPS.map(step => ({
            ...step,
            completed: state.completedSteps.includes(step.id),
            active: step.id === state.currentStep
          }))}
          className="mb-6"
        />
      )}

      {/* ガイダンス表示 */}
      {showGuidance && (
        <StepGuidanceComponent
          currentStep={state.currentStep}
          guidance={STEP_GUIDANCE}
          onNext={canGoNext ? handleNext : undefined}
          onPrev={canGoPrev ? handlePrev : undefined}
          isFirstStep={state.currentStep === 1}
          isLastStep={state.currentStep === 4}
          showActions={showNavigation}
        />
      )}

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <GlassCard className="bg-gray-50/80 border-gray-300">
          <h4 className="font-bold text-gray-700 mb-2">🔧 フロー状態 (開発)</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>現在のステップ: {state.currentStep} ({FlowNavigation.getStepName(state.currentStep)})</p>
            <p>完了済み: [{state.completedSteps.join(', ')}]</p>
            <p>選択された料理: {state.selectedFoods.length}件</p>
            <p>選択された場所: {state.selectedLocation ? '✅' : '❌'}</p>
            <p>選択されたレストラン: {state.selectedRestaurant ? '✅' : '❌'}</p>
            <p>進行率: {FlowNavigation.getProgressPercentage(state.currentStep)}%</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// 簡易ナビゲーション（プログレスのみ）
export const MiniFlowNav: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = useFlowState();
  const router = useRouter();

  const handleStepClick = (stepNumber: number) => {
    const stepUrl = FlowNavigation.getStepUrl(stepNumber);
    router.push(stepUrl);
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {FLOW_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = state.completedSteps.includes(stepNumber);
        const isActive = stepNumber === state.currentStep;
        const canAccess = stepNumber <= state.currentStep || isCompleted;

        return (
          <button
            key={step.id}
            onClick={() => canAccess && handleStepClick(stepNumber)}
            disabled={!canAccess}
            className={`
              w-8 h-8 rounded-full text-sm font-bold transition-all duration-200
              ${isCompleted 
                ? 'bg-green-500 text-white' 
                : isActive 
                ? 'bg-purple-500 text-white' 
                : canAccess
                ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
              ${canAccess ? 'hover:scale-110' : ''}
            `}
          >
            {isCompleted ? '✓' : stepNumber}
          </button>
        );
      })}
    </div>
  );
};

// ステップ遷移アニメーション用ラッパー
export const StepTransition: React.FC<{ 
  children: React.ReactNode;
  stepNumber: number;
  className?: string;
}> = ({ children, stepNumber, className = '' }) => {
  const { state } = useFlowState();
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (state.currentStep === stepNumber) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [state.currentStep, stepNumber]);

  return (
    <div
      className={`
        transition-all duration-500 ease-in-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// フロー完了確認ダイアログ
export const FlowCompletionDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}> = ({ isOpen, onClose, onRestart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GlassCard className="max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            注文完了！
          </h3>
          <p className="text-gray-600 mb-6">
            ご注文ありがとうございました。<br/>
            配達をお待ちください。
          </p>
          
          <div className="flex gap-3">
            <GlassButton
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              閉じる
            </GlassButton>
            <GlassButton
              onClick={onRestart}
              variant="primary"
              className="flex-1"
            >
              もう一度注文
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}; 