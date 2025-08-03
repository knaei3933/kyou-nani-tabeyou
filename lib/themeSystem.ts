// テーマシステム
// ダークモード/ライトモード、カスタムテーマ管理

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  glass: string;
  glassBorder: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glass: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      bounce: string;
    };
  };
}

export interface ThemeState {
  currentMode: ThemeMode;
  currentScheme: ColorScheme;
  customThemes: Theme[];
  activeTheme: Theme;
  systemPreference: 'light' | 'dark';
  userPreferences: {
    autoSwitch: boolean;
    switchTime: { light: string; dark: string };
    reduceGlass: boolean;
    highContrast: boolean;
  };
}

class ThemeManager {
  private state: ThemeState;
  private listeners: Set<(theme: Theme) => void> = new Set();
  private mediaQuery: MediaQueryList;
  private autoSwitchInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.state = {
      currentMode: 'system',
      currentScheme: 'blue',
      customThemes: [],
      activeTheme: this.createDefaultTheme('light', 'blue'),
      systemPreference: this.mediaQuery.matches ? 'dark' : 'light',
      userPreferences: {
        autoSwitch: false,
        switchTime: { light: '06:00', dark: '20:00' },
        reduceGlass: false,
        highContrast: false
      }
    };

    this.initialize();
  }

  private initialize() {
    this.loadUserPreferences();
    this.setupSystemListener();
    this.setupAutoSwitch();
    this.applyTheme();
  }

  // デフォルトテーマ作成
  private createDefaultTheme(mode: 'light' | 'dark', scheme: ColorScheme): Theme {
    const schemeColors = this.getSchemeColors(scheme);
    
    const lightColors: ThemeColors = {
      primary: schemeColors.primary,
      primaryDark: schemeColors.primaryDark,
      secondary: schemeColors.secondary,
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: schemeColors.accent,
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      glass: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)'
    };

    const darkColors: ThemeColors = {
      primary: schemeColors.primary,
      primaryDark: schemeColors.primaryDark,
      secondary: schemeColors.secondary,
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: schemeColors.accent,
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      glass: 'rgba(15, 23, 42, 0.1)',
      glassBorder: 'rgba(148, 163, 184, 0.2)'
    };

    return {
      id: `${mode}-${scheme}`,
      name: `${mode.charAt(0).toUpperCase() + mode.slice(1)} ${scheme.charAt(0).toUpperCase() + scheme.slice(1)}`,
      mode,
      colors: mode === 'light' ? lightColors : darkColors,
      gradients: {
        primary: mode === 'light' 
          ? `linear-gradient(135deg, ${schemeColors.primary} 0%, ${schemeColors.primaryDark} 100%)`
          : `linear-gradient(135deg, ${schemeColors.primaryDark} 0%, ${schemeColors.primary} 100%)`,
        secondary: mode === 'light'
          ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        background: mode === 'light'
          ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
          : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
      },
      shadows: {
        sm: mode === 'light' 
          ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: mode === 'light'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        lg: mode === 'light'
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        glass: mode === 'light'
          ? '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
          : '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '250ms',
          slow: '400ms'
        },
        easing: {
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
      }
    };
  }

  // カラースキーム定義
  private getSchemeColors(scheme: ColorScheme) {
    const schemes = {
      blue: {
        primary: '#3b82f6',
        primaryDark: '#1d4ed8',
        secondary: '#60a5fa',
        accent: '#06b6d4'
      },
      green: {
        primary: '#22c55e',
        primaryDark: '#16a34a',
        secondary: '#4ade80',
        accent: '#10b981'
      },
      purple: {
        primary: '#8b5cf6',
        primaryDark: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#06b6d4'
      },
      orange: {
        primary: '#f97316',
        primaryDark: '#ea580c',
        secondary: '#fb923c',
        accent: '#f59e0b'
      },
      pink: {
        primary: '#ec4899',
        primaryDark: '#db2777',
        secondary: '#f472b6',
        accent: '#06b6d4'
      }
    };

    return schemes[scheme];
  }

  // システム設定監視
  private setupSystemListener() {
    this.mediaQuery.addEventListener('change', (e) => {
      this.state.systemPreference = e.matches ? 'dark' : 'light';
      
      if (this.state.currentMode === 'system') {
        this.updateActiveTheme();
      }
    });
  }

  // 自動切り替え設定
  private setupAutoSwitch() {
    if (this.state.userPreferences.autoSwitch) {
      this.autoSwitchInterval = setInterval(() => {
        this.checkAutoSwitch();
      }, 60000); // 1分ごとにチェック
    }
  }

  private checkAutoSwitch() {
    if (!this.state.userPreferences.autoSwitch) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const { light, dark } = this.state.userPreferences.switchTime;
    
    if (currentTime === light && this.state.activeTheme.mode === 'dark') {
      this.setMode('light');
    } else if (currentTime === dark && this.state.activeTheme.mode === 'light') {
      this.setMode('dark');
    }
  }

  // テーマ適用
  private applyTheme() {
    const { colors, gradients, shadows, animations } = this.state.activeTheme;
    const root = document.documentElement;

    // CSS カスタムプロパティ設定
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.camelToKebab(key)}`, value);
    });

    Object.entries(gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    Object.entries(shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // アニメーション設定
    Object.entries(animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // ダークモードクラス管理
    if (this.state.activeTheme.mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // アクセシビリティ設定
    if (this.state.userPreferences.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (this.state.userPreferences.reduceGlass) {
      document.body.classList.add('reduce-glass');
    } else {
      document.body.classList.remove('reduce-glass');
    }

    // リスナーに通知
    this.notifyListeners(this.state.activeTheme);
  }

  // アクティブテーマ更新
  private updateActiveTheme() {
    const targetMode = this.state.currentMode === 'system' 
      ? this.state.systemPreference 
      : this.state.currentMode === 'auto'
      ? this.getAutoMode()
      : this.state.currentMode;

    this.state.activeTheme = this.createDefaultTheme(targetMode as 'light' | 'dark', this.state.currentScheme);
    this.applyTheme();
    this.saveUserPreferences();
  }

  // 自動モード判定
  private getAutoMode(): 'light' | 'dark' {
    const now = new Date();
    const hour = now.getHours();
    
    // 6:00-20:00 をライトモード、それ以外をダークモードとする
    return (hour >= 6 && hour < 20) ? 'light' : 'dark';
  }

  // パブリックメソッド
  setMode(mode: ThemeMode) {
    this.state.currentMode = mode;
    this.updateActiveTheme();
  }

  setScheme(scheme: ColorScheme) {
    this.state.currentScheme = scheme;
    this.updateActiveTheme();
  }

  setAutoSwitch(enabled: boolean, times?: { light: string; dark: string }) {
    this.state.userPreferences.autoSwitch = enabled;
    
    if (times) {
      this.state.userPreferences.switchTime = times;
    }

    if (enabled && !this.autoSwitchInterval) {
      this.setupAutoSwitch();
    } else if (!enabled && this.autoSwitchInterval) {
      clearInterval(this.autoSwitchInterval);
      this.autoSwitchInterval = null;
    }

    this.saveUserPreferences();
  }

  setHighContrast(enabled: boolean) {
    this.state.userPreferences.highContrast = enabled;
    this.applyTheme();
    this.saveUserPreferences();
  }

  setReduceGlass(enabled: boolean) {
    this.state.userPreferences.reduceGlass = enabled;
    this.applyTheme();
    this.saveUserPreferences();
  }

  // ユーザー設定管理
  private loadUserPreferences() {
    try {
      const stored = localStorage.getItem('theme_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.state = { ...this.state, ...preferences };
        this.updateActiveTheme();
      }
    } catch (error) {
      console.error('テーマ設定読み込みエラー:', error);
    }
  }

  private saveUserPreferences() {
    try {
      const preferences = {
        currentMode: this.state.currentMode,
        currentScheme: this.state.currentScheme,
        userPreferences: this.state.userPreferences
      };
      localStorage.setItem('theme_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('テーマ設定保存エラー:', error);
    }
  }

  // リスナー管理
  addListener(listener: (theme: Theme) => void) {
    this.listeners.add(listener);
  }

  removeListener(listener: (theme: Theme) => void) {
    this.listeners.delete(listener);
  }

  private notifyListeners(theme: Theme) {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('テーマリスナーエラー:', error);
      }
    });
  }

  // ユーティリティ
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  // 状態取得
  getState(): ThemeState {
    return { ...this.state };
  }

  getCurrentTheme(): Theme {
    return { ...this.state.activeTheme };
  }

  getAvailableSchemes(): ColorScheme[] {
    return ['blue', 'green', 'purple', 'orange', 'pink'];
  }

  // クリーンアップ
  destroy() {
    if (this.autoSwitchInterval) {
      clearInterval(this.autoSwitchInterval);
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
export const themeManager = new ThemeManager(); 