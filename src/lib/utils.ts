// ユーティリティ関数集

// クラス値タイプ定義 (clsx 대신)
type ClassValue = string | number | boolean | undefined | null | Record<string, any>;

// シンプルなclsx代替関数
export function cn(...classes: ClassValue[]): string {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

// アニメーション関連ユーティリティ
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// カラーユーティリティ
export const gradients = {
  primary: "bg-gradient-to-r from-blue-500 to-purple-600",
  secondary: "bg-gradient-to-r from-pink-500 to-rose-500",
  food: "bg-gradient-to-r from-orange-500 to-red-500",
  success: "bg-gradient-to-r from-green-500 to-emerald-500"
};

// ホバーエフェクト
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

// パルス効果
export const pulseEffect = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// フローティングアニメーション
export const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// グラデーションテキスト
export const gradientText = "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent";

// シャドウスタイル
export const shadows = {
  glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  soft: "shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
  medium: "shadow-[0_20px_50px_rgba(0,0,0,0.15)]",
  hard: "shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
};

// ブラー効果
export const blurBackgrounds = {
  glass: "backdrop-blur-md bg-white/80 dark:bg-gray-900/80",
  strong: "backdrop-blur-lg bg-white/90 dark:bg-gray-900/90",
  subtle: "backdrop-blur-sm bg-white/70 dark:bg-gray-900/70"
}; 