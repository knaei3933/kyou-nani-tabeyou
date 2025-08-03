'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { hapticFeedback } from '@/lib/touch-gestures';

// スワイプナビゲーションプロバイダー
interface SwipeNavigationProps {
  children: ReactNode;
  currentPage?: string;
  onSwipe?: (direction: string) => void;
}

export function SwipeNavigation({ children, currentPage, onSwipe }: SwipeNavigationProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {children}
    </div>
  );
}

// タッチ最適化ボタン
interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function TouchButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick,
  className = '',
  ...props 
}: TouchButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    active:scale-95 
    touch-manipulation
    min-h-[44px] min-w-[44px]
    focus:outline-none focus:ring-2 focus:ring-offset-2
    group
  `;

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg focus:ring-gray-500',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    hapticFeedback.light();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// モバイルナビゲーションバー
interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

interface MobileNavBarProps {
  items: NavItem[];
  currentPath?: string;
}

export function MobileNavBar({ items, currentPath }: MobileNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`
              flex flex-col items-center justify-center
              p-2 rounded-lg min-w-[64px] min-h-[48px]
              transition-all duration-200
              active:scale-95 touch-manipulation
              ${currentPath === item.href 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }
            `}
            onClick={() => hapticFeedback.selection()}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// スワイプカード
interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeCardProps) {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg p-6
        touch-pan-y active:scale-[0.98]
        transition-transform duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// タッチフレンドリーリスト
interface TouchListProps {
  children: ReactNode;
  className?: string;
}

export function TouchList({ children, className = '' }: TouchListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

interface TouchListItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TouchListItem({ children, onClick, className = '' }: TouchListItemProps) {
  const handleClick = () => {
    hapticFeedback.light();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        p-4 rounded-lg bg-white shadow-sm
        transition-all duration-200
        active:scale-[0.98] active:bg-gray-50
        touch-manipulation cursor-pointer
        min-h-[56px] flex items-center
        ${className}
      `}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// プルトゥリフレッシュ
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  refreshThreshold?: number;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  refreshThreshold = 70 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);

  return (
    <div className="relative">
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50"
          style={{ transform: `translateY(${Math.min(pullDistance, refreshThreshold)}px)` }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">読み込み中...</span>
          </div>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 