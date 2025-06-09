// @ts-nocheck
'use client';

import React from 'react';
import { cn, blurBackgrounds } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  border?: boolean;
  shadow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  intensity = 'medium',
  border = true,
  shadow = true
}: GlassCardProps) {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'subtle':
        return 'backdrop-blur-sm bg-white/40';
      case 'strong':
        return 'backdrop-blur-xl bg-white/80';
      default:
        return 'backdrop-blur-lg bg-white/60';
    }
  };

  return (
    <div
      className={cn(
        // ベースガラス効果
        getIntensityClass(),
        // ボーダー
        border && "border border-white/20",
        // 角丸
        "rounded-2xl",
        // シャドウ
        shadow && "shadow-xl shadow-black/10",
        // パディング
        "p-6",
        // トランジション
        "transition-all duration-300",
        className
      )}
    >
      {/* 内側のグロー */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      
      {/* コンテンツ */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// スペシャライズされたガラスコンポーネント
export function GlassButton({ 
  children, 
  onClick, 
  className,
  variant = 'primary'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  const [isPressed, setIsPressed] = React.useState(false);

  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100/40 hover:bg-gray-100/60 border-gray-300/30';
      default:
        return 'bg-blue-100/40 hover:bg-blue-100/60 border-blue-300/30';
    }
  };

  return (
    <button
      className={cn(
        // ベーススタイル
        "relative px-6 py-3 rounded-xl backdrop-blur-lg border transition-all duration-200",
        // バリアント
        getVariantClass(),
        // ホバー効果
        "hover:scale-105 active:scale-95",
        // シャドウ
        "shadow-lg hover:shadow-xl",
        // フォント
        "font-medium text-gray-800",
        className
      )}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      {/* 背景グラデーション */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      
      {/* コンテンツ */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
} 