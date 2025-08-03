// @ts-nocheck
// プログレッシブ・フロー表示コンポーネント
'use client';

import React, { useState, useEffect } from 'react';

export interface FlowStep {
  id: number;
  title: string;
  emoji: string;
  description: string;
  completed?: boolean;
  active?: boolean;
}

interface ProgressFlowProps {
  currentStep: number;
  steps: FlowStep[];
  className?: string;
}

export const ProgressFlow: React.FC<ProgressFlowProps> = ({
  currentStep,
  steps,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* モバイル用コンパクト表示 */}
      <div className="md:hidden mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">
              ステップ {currentStep} / {steps.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% 完了
            </span>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          
          {/* 現在のステップ情報 */}
          <div className="flex items-center">
            <div className="text-2xl mr-3">
              {steps[currentStep - 1]?.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {steps[currentStep - 1]?.title}
              </h3>
              <p className="text-sm text-gray-600">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* デスクトップ用詳細表示 */}
      <div className="hidden md:block">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">進行状況</h2>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-start">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;
              const isUpcoming = stepNumber > currentStep;

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center text-center">
                  {/* ステップ番号とアイコン */}
                  <div className="relative mb-3">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        transition-all duration-300 transform
                        ${isCompleted 
                          ? 'bg-green-500 text-white scale-110 shadow-lg' 
                          : isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-125 shadow-xl animate-pulse' 
                          : 'bg-gray-200 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? '✅' : step.emoji}
                    </div>
                    
                    {/* ステップ番号バッジ */}
                    <div
                      className={`
                        absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                        ${isCompleted 
                          ? 'bg-green-600 text-white' 
                          : isActive 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-400 text-white'
                        }
                      `}
                    >
                      {stepNumber}
                    </div>
                  </div>

                  {/* ステップ情報 */}
                  <h3
                    className={`
                      font-semibold mb-1 transition-colors duration-300
                      ${isCompleted 
                        ? 'text-green-700' 
                        : isActive 
                        ? 'text-purple-700' 
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`
                      text-xs leading-relaxed transition-colors duration-300
                      ${isCompleted 
                        ? 'text-green-600' 
                        : isActive 
                        ? 'text-purple-600' 
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.description}
                  </p>

                  {/* 接続線 */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        absolute top-6 left-1/2 w-full h-0.5 -z-10
                        transition-colors duration-500
                        ${stepNumber < currentStep 
                          ? 'bg-green-400' 
                          : 'bg-gray-300'
                        }
                      `}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// フロー設定定数
export const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    title: '食事選択',
    emoji: '🤔',
    description: 'まず何を食べたいかを選択'
  },
  {
    id: 2,
    title: 'エリア指定',
    emoji: '📍',
    description: 'お住まいのエリアを指定'
  },
  {
    id: 3,
    title: 'レストラン検索',
    emoji: '🏪',
    description: '近くのレストランを検索'
  },
  {
    id: 4,
    title: 'メニュー確認・注文',
    emoji: '🍽️',
    description: 'メニューを確認して注文'
  }
];

// フロー状態管理フック
export const useFlowProgress = (initialStep: number = 1) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const nextStep = () => {
    if (currentStep < FLOW_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= FLOW_STEPS.length) {
      setCurrentStep(stepNumber);
    }
  };
  
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FLOW_STEPS.length;
  const progress = (currentStep / FLOW_STEPS.length) * 100;
  
  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    progress,
    steps: FLOW_STEPS
  };
}; 