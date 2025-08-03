// @ts-nocheck
'use client';

import React from 'react';
import { cn, hoverScale, shadows } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: boolean;
  glow?: boolean;
  selected?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  onClick, 
  gradient = false,
  glow = false,
  selected = false 
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={cn(
        // ベーススタイル
        "relative p-6 rounded-xl border transition-all duration-300 cursor-pointer",
        // 通常状態
        "bg-white/90 backdrop-blur-sm border-gray-200",
        // ホバー状態
        "hover:bg-white hover:border-gray-300",
        // 選択状態
        selected && "border-blue-500 bg-blue-50/50",
        // グラデーション
        gradient && "bg-gradient-to-br from-white to-gray-50",
        // グロー効果
        glow && shadows.glow,
        // シャドウ
        isHovered ? shadows.medium : shadows.soft,
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* 背景グラデーション */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 rounded-xl opacity-60" />
      )}
      
      {/* グロー効果 */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25" />
      )}
      
      {/* コンテンツ */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 選択インジケーター */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
          ✓
        </div>
      )}
    </div>
  );
} 