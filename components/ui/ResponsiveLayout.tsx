'use client';

import React, { ReactNode, HTMLAttributes } from 'react';

// 디바이스 타입 정의
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceArray = DeviceType[];

// 브레이크포인트 설정
const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 9999 }
};

// 화면 크기 훅
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 768,
    height: typeof window !== 'undefined' ? window.innerHeight : 1024
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const deviceType: DeviceType = 
    screenSize.width <= BREAKPOINTS.mobile.max ? 'mobile' :
    screenSize.width <= BREAKPOINTS.tablet.max ? 'tablet' : 'desktop';

  const isDevice = {
    mobile: deviceType === 'mobile',
    tablet: deviceType === 'tablet',
    desktop: deviceType === 'desktop'
  };

  return { screenSize, deviceType, isDevice };
}

// 반응형 컨테이너
interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'lg',
  padding = 'md',
  className = '',
  ...props 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-4 md:px-6 lg:px-8',
    lg: 'px-6 md:px-8 lg:px-12',
    xl: 'px-8 md:px-12 lg:px-16'
  };

  return (
    <div 
      className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// 반응형 그리드
interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  } | number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({ 
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
  ...props 
}: ResponsiveGridProps) {
  let gridClasses = 'grid ';

  if (typeof cols === 'number') {
    gridClasses += `grid-cols-${cols} `;
  } else {
    if (cols.mobile) gridClasses += `grid-cols-${cols.mobile} `;
    if (cols.tablet) gridClasses += `md:grid-cols-${cols.tablet} `;
    if (cols.desktop) gridClasses += `lg:grid-cols-${cols.desktop} `;
  }

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div 
      className={`${gridClasses} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// 반응형 카드
interface ResponsiveCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  interactive?: boolean;
}

export function ResponsiveCard({ 
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props 
}: ResponsiveCardProps) {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'bg-white shadow-sm border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg',
    filled: 'bg-gray-50 border border-gray-200'
  };

  const interactiveClasses = interactive 
    ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
    : '';

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${interactiveClasses} p-4 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// 반응형 텍스트
interface ResponsiveTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  className?: string;
}

export function ResponsiveText({ 
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  className = ''
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs md:text-sm',
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl lg:text-5xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    accent: 'text-purple-600'
  };

  return (
    <Component 
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`}
    >
      {children}
    </Component>
  );
}

// 표시/숨김 컴포넌트
interface ShowOnProps {
  device: DeviceType | DeviceArray;
  children: ReactNode;
}

export function ShowOn({ device, children }: ShowOnProps) {
  const { isDevice } = useScreenSize();
  
  const shouldShow = Array.isArray(device) 
    ? device.some(d => isDevice[d])
    : isDevice[device];
    
  if (!shouldShow) return null;
  
  return <>{children}</>;
}

interface HideOnProps {
  device: DeviceType | DeviceArray;
  children: ReactNode;
}

export function HideOn({ device, children }: HideOnProps) {
  const { isDevice } = useScreenSize();
  
  const shouldHide = Array.isArray(device)
    ? device.some(d => isDevice[d])
    : isDevice[device];
    
  if (shouldHide) return null;
  
  return <>{children}</>;
}

// 반응형 스페이싱
interface ResponsiveSpacingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  direction?: 'vertical' | 'horizontal' | 'all';
}

export function ResponsiveSpacing({ 
  size = 'md',
  direction = 'vertical',
  className = '',
  ...props 
}: ResponsiveSpacingProps) {
  const spacingClasses = {
    xs: direction === 'vertical' ? 'py-2 md:py-3' : 
        direction === 'horizontal' ? 'px-2 md:px-3' : 'p-2 md:p-3',
    sm: direction === 'vertical' ? 'py-3 md:py-4' : 
        direction === 'horizontal' ? 'px-3 md:px-4' : 'p-3 md:p-4',
    md: direction === 'vertical' ? 'py-4 md:py-6' : 
        direction === 'horizontal' ? 'px-4 md:px-6' : 'p-4 md:p-6',
    lg: direction === 'vertical' ? 'py-6 md:py-8' : 
        direction === 'horizontal' ? 'px-6 md:px-8' : 'p-6 md:p-8',
    xl: direction === 'vertical' ? 'py-8 md:py-12' : 
        direction === 'horizontal' ? 'px-8 md:px-12' : 'p-8 md:p-12',
    '2xl': direction === 'vertical' ? 'py-12 md:py-16' : 
           direction === 'horizontal' ? 'px-12 md:px-16' : 'p-12 md:p-16'
  };

  return (
    <div 
      className={`${spacingClasses[size]} ${className}`}
      {...props}
    />
  );
} 