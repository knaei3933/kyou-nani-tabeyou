'use client';

import React from 'react';

// Framer Motion の代替として CSS アニメーションを使用
interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionCard({ children, className = '', delay = 0 }: MotionCardProps) {
  return (
    <div 
      className={`
        transform transition-all duration-700 ease-out
        hover:scale-105 hover:shadow-2xl
        opacity-0 animate-fadeInUp
        ${className}
      `}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
}

export function MotionButton({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary'
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
  };

  return (
    <button
      className={`
        px-8 py-4 rounded-xl font-semibold text-lg
        transform transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        focus:outline-none focus:ring-4 focus:ring-purple-300
        ${variants[variant]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MotionHero({ children, className = '' }: MotionCardProps) {
  return (
    <div 
      className={`
        transform transition-all duration-1000 ease-out
        opacity-0 animate-fadeInScale
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// アニメーション用のCSS追加
export const motionStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.7s ease-out forwards;
  }

  .animate-fadeInScale {
    animation: fadeInScale 1s ease-out forwards;
  }
`; 